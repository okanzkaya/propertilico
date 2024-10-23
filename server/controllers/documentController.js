const { models, sequelize } = require('../config/db');
const crypto = require('crypto');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const sanitize = require('sanitize-filename');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const NodeCache = require('node-cache');

// Configure ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Initialize cache with 1 hour TTL and check every 10 minutes for expired items
const previewCache = new NodeCache({ 
  stdTTL: 3600,
  checkperiod: 600,
  useClones: false,
  maxKeys: 1000 // Limit cache size
});

// Encryption setup with key validation
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8');
if (ENCRYPTION_KEY.length !== 32) {
  console.error('Invalid encryption key length. It must be exactly 32 bytes.');
  process.exit(1);
}

// Constants
const IV_LENGTH = 16;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_LIMIT = 256 * 1024 * 1024; // 256MB
const PREVIEW_IMAGE_SIZE = { width: 400, height: 300 };
const THUMBNAIL_SIZE = { width: 150, height: 150 };
const PREVIEW_QUALITY = 80;
const THUMBNAIL_QUALITY = 60;

// File type definitions
const FILE_CATEGORIES = {
  document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
};

// Improved encryption with error handling and input validation
function encrypt(buffer) {
  try {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Input must be a buffer');
    }
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
  
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(extension)) {
      return category;
    }
  }
  return 'other';
}

// Optimized thumbnail generation for videos
const generateVideoThumbnail = async (videoBuffer) => {
  const tempDir = os.tmpdir();
  const tempVideoPath = path.join(tempDir, `${Date.now()}-video.mp4`);
  const tempThumbPath = path.join(tempDir, `${Date.now()}-thumb.jpg`);

  try {
    await fs.writeFile(tempVideoPath, videoBuffer);

    return new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .on('error', async (err) => {
          console.error('FFmpeg error:', err);
          await cleanup();
          reject(err);
        })
        .on('end', async () => {
          try {
            const thumbBuffer = await fs.readFile(tempThumbPath);
            await cleanup();
            
            // Optimize thumbnail
            const optimizedThumb = await sharp(thumbBuffer)
              .resize(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .jpeg({ quality: THUMBNAIL_QUALITY })
              .toBuffer();

            resolve(optimizedThumb);
          } catch (error) {
            await cleanup();
            reject(error);
          }
        })
        .screenshots({
          timestamps: ['1'],
          filename: path.basename(tempThumbPath),
          folder: path.dirname(tempThumbPath),
          size: `${PREVIEW_IMAGE_SIZE.width}x${PREVIEW_IMAGE_SIZE.height}`
        });
    });
  } catch (error) {
    await cleanup();
    throw error;
  }

  async function cleanup() {
    try {
      await fs.unlink(tempVideoPath).catch(() => {});
      await fs.unlink(tempThumbPath).catch(() => {});
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
};

// Improved storage validation
const validateFileSize = async (userId, newFileSize) => {
  const totalSize = await models.Document.sum('size', {
    where: { userId, isDeleted: false }
  });
  
  if ((totalSize || 0) + newFileSize > STORAGE_LIMIT) {
    throw new AppError('Storage limit exceeded', 400);
  }
  
  return totalSize;
};

// Optimized preview generation with caching
// In your documentController.js, update the preview generation
const generatePreview = async (document, decryptedContent) => {
  try {
    if (document.category === 'image') {
      return await sharp(decryptedContent)
        .resize(400, 300, {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }
    
    if (document.category === 'video') {
      return await generateVideoThumbnail(decryptedContent);
    }
    
    return null;
  } catch (error) {
    console.error('Preview generation error:', error);
    return null;
  }
};

// Controller methods
exports.getPreview = async (req, res, next) => {
  try {
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

    const decryptedContent = decrypt(document.content);
    const preview = await generatePreview(document, decryptedContent);

    if (preview) {
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Length': preview.length,
        'Cache-Control': 'public, max-age=86400'
      });
      return res.send(preview);
    }

    // Fallback SVG for non-previewable files
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400'
    });

    const color = document.category === 'document' ? '#4A90E2' : 
                  document.category === 'video' ? '#E24A4A' : '#808080';

    return res.send(`
      <svg width="320" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <rect width="80" height="100" x="120" y="70" fill="${color}"/>
        <text x="160" y="140" fill="#fff" text-anchor="middle" font-family="Arial">
          ${document.category.toUpperCase()}
        </text>
      </svg>
    `);
  } catch (error) {
    console.error('Preview error:', error);
    next(error);
  }
};

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

    // Generate preview in background
    generatePreview(newFile, buffer).catch(console.error);

    const { content, ...fileWithoutContent } = newFile.toJSON();
    res.status(201).json({ 
      message: 'File uploaded successfully',
      file: fileWithoutContent
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.downloadFile = async (req, res, next) => {
  try {
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

    const decryptedContent = decrypt(document.content);
    
    res.set({
      'Content-Type': document.mimeType,
      'Content-Length': decryptedContent.length,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(document.name)}"`,
      'Cache-Control': 'private, no-cache'
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

    // Remove from cache
    previewCache.del(`preview:${req.params.id}`);

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

// Cache cleanup on process exit
process.on('SIGINT', () => {
  previewCache.close();
  process.exit();
});

module.exports = exports;