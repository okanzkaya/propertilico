const { models, sequelize } = require('../config/db');
const crypto = require('crypto');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');

// Ensure the encryption key is properly set
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
if (ENCRYPTION_KEY.length !== 32) {
  console.error('Invalid encryption key length. It must be exactly 32 bytes.');
  process.exit(1);
}

const IV_LENGTH = 16;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

function encrypt(buffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

function decrypt(text) {
  if (typeof text !== 'string') {
    console.error('Decrypt error: Input is not a string', typeof text, text);
    throw new AppError('Invalid input for decryption', 400);
  }
  const textParts = text.split(':');
  if (textParts.length !== 2) {
    console.error('Decrypt error: Invalid input format', text);
    throw new AppError('Invalid encrypted data format', 400);
  }
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = Buffer.from(textParts[1], 'hex');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  return Buffer.concat([decipher.update(encryptedText), decipher.final()]);
}

function categorizeFile(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return 'video';
  return 'other';
}

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
    const category = categorizeFile(originalname);
    
    if (size > 10 * 1024 * 1024) {
      throw new AppError('File size exceeds the limit (10MB)', 400);
    }

    const encryptedContent = encrypt(buffer);

    const newFile = await models.Document.create({
      userId: req.user.id,
      name: originalname,
      type: 'file',
      category,
      mimeType: mimetype,
      size,
      content: encryptedContent,
      path: `/${originalname}`
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

function decryptBuffer(buffer) {
  const iv = buffer.slice(0, 16);
  const encryptedContent = buffer.slice(16);
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  return Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
}

exports.downloadFile = async (req, res, next) => {
  try {
    const file = await models.Document.findOne({
      where: { id: req.params.id, userId: req.user.id, type: 'file' }
    });
    if (!file) {
      throw new AppError('File not found', 404);
    }

    console.log('File content type:', typeof file.content);
    console.log('Is Buffer:', Buffer.isBuffer(file.content));

    let decryptedContent;
    try {
      if (Buffer.isBuffer(file.content)) {
        decryptedContent = decryptBuffer(file.content);
      } else if (typeof file.content === 'string') {
        decryptedContent = decrypt(file.content);
      } else {
        throw new Error('Unexpected content type');
      }
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      throw new AppError('Unable to decrypt file content', 500);
    }

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Content-Security-Policy': "default-src 'self'",
      'X-Content-Type-Options': 'nosniff'
    });

    res.send(decryptedContent);
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const [updatedRowsCount] = await models.Document.update(
      { isDeleted: true },
      { 
        where: { id: req.params.id, userId: req.user.id },
        transaction: t
      }
    );

    if (updatedRowsCount === 0) {
      await t.rollback();
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
    const [updatedRowsCount, updatedDocuments] = await models.Document.update(
      { name },
      {
        where: { id: req.params.id, userId: req.user.id },
        returning: true,
        transaction: t
      }
    );

    if (updatedRowsCount === 0) {
      await t.rollback();
      throw new AppError('Document not found', 404);
    }

    await t.commit();
    res.json({ message: 'Document updated successfully', document: updatedDocuments[0] });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const document = await models.Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t
    });
    if (!document) {
      await t.rollback();
      throw new AppError('Document not found', 404);
    }
    document.isFavorite = !document.isFavorite;
    await document.save({ transaction: t });
    await t.commit();
    res.json({ message: 'Favorite status updated', isFavorite: document.isFavorite });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.getStorageInfo = async (req, res, next) => {
  try {
    const totalSize = await models.Document.sum('size', {
      where: { userId: req.user.id, isDeleted: false, type: 'file' }
    });

    const limit = 268435456; // 256 MB in bytes

    res.json({ used: totalSize || 0, limit });
  } catch (error) {
    next(new AppError('Error fetching storage information', 500));
  }
};



module.exports = exports;