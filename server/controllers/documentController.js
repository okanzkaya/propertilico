const { models, sequelize } = require('../config/db');
const crypto = require('crypto');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const sanitize = require('sanitize-filename');

// Encryption setup
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8');
if (ENCRYPTION_KEY.length !== 32) {
  console.error('Invalid encryption key length. It must be exactly 32 bytes.');
  process.exit(1);
}

const IV_LENGTH = 16;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_LIMIT = 256 * 1024 * 1024; // 256MB

// Improved encryption with error handling
function encrypt(buffer) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new AppError('Failed to encrypt file', 500);
  }
}

function decrypt(buffer) {
  try {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Input must be a buffer');
    }
    const iv = buffer.slice(0, IV_LENGTH);
    const encryptedContent = buffer.slice(IV_LENGTH);
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    return Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new AppError('Failed to decrypt file', 500);
  }
}

function categorizeFile(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const categories = {
    document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
  };

  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(extension)) {
      return category;
    }
  }
  return 'other';
}

// Improved validation middleware
const validateFileSize = async (userId, newFileSize) => {
  const totalSize = await models.Document.sum('size', {
    where: { userId, isDeleted: false }
  });
  if ((totalSize || 0) + newFileSize > STORAGE_LIMIT) {
    throw new AppError('Storage limit exceeded', 400);
  }
};

// Controller methods
exports.getDocuments = async (req, res, next) => {
  try {
    const documents = await models.Document.findAll({
      where: { userId: req.user.id, isDeleted: false },
      attributes: { exclude: ['content'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    next(new AppError('Error fetching documents', 500));
  }
};

exports.uploadFile = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const sanitizedName = sanitize(originalname);
    
    if (size > MAX_FILE_SIZE) {
      throw new AppError('File size exceeds the limit (10MB)', 400);
    }

    await validateFileSize(req.user.id, size);

    const encryptedContent = encrypt(buffer);
    const category = categorizeFile(sanitizedName);

    const newFile = await models.Document.create({
      userId: req.user.id,
      name: sanitizedName,
      type: 'file',
      category,
      mimeType: mimetype,
      size,
      content: encryptedContent,
      path: `/${sanitizedName}`
    }, { transaction: t });

    await t.commit();

    // Remove content from response
    const { content, ...fileWithoutContent } = newFile.toJSON();
    res.status(201).json({ 
      message: 'File uploaded successfully',
      file: fileWithoutContent // Return single file object instead of files array
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};;

// In server/controllers/documentController.js
exports.downloadFile = async (req, res, next) => {
  try {
    console.log('Download request for document:', req.params.id);
    
    const document = await models.Document.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id,
        isDeleted: false
      }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.content) {
      return res.status(404).json({ message: 'File content not found' });
    }

    const decryptedContent = decrypt(document.content);
    
    res.set({
      'Content-Type': document.mimeType,
      'Content-Length': decryptedContent.length,
      'Content-Disposition': `inline; filename="${encodeURIComponent(document.name)}"`,
      'Access-Control-Allow-Origin': process.env.CLIENT_URL || 'http://localhost:3000',
    });

    return res.send(decryptedContent);
  } catch (error) {
    console.error('Download error:', error);
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const [updatedRowsCount] = await models.Document.update(
      { isDeleted: true },
      { 
        where: { 
          id: req.params.id, 
          userId: req.user.id,
          isDeleted: false
        },
        transaction: t
      }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('Document not found', 404);
    }

    await t.commit();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.updateDocument = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { name } = req.body;
    const sanitizedName = sanitize(name);

    const [updatedRowsCount, updatedDocuments] = await models.Document.update(
      { name: sanitizedName },
      {
        where: { 
          id: req.params.id, 
          userId: req.user.id,
          isDeleted: false
        },
        returning: true,
        transaction: t
      }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('Document not found', 404);
    }

    await t.commit();
    res.json({ 
      message: 'Document updated successfully', 
      document: updatedDocuments[0] 
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const document = await models.Document.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id,
        isDeleted: false
      },
      transaction: t
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    document.isFavorite = !document.isFavorite;
    await document.save({ transaction: t });
    
    await t.commit();
    res.json({ 
      message: 'Favorite status updated', 
      isFavorite: document.isFavorite 
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.getStorageInfo = async (req, res, next) => {
  try {
    const totalSize = await models.Document.sum('size', {
      where: { 
        userId: req.user.id, 
        isDeleted: false 
      }
    });

    res.json({ 
      used: totalSize || 0, 
      limit: STORAGE_LIMIT,
      available: STORAGE_LIMIT - (totalSize || 0)
    });
  } catch (error) {
    next(new AppError('Error fetching storage information', 500));
  }
};

module.exports = exports;