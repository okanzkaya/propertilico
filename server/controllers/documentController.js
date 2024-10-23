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
<<<<<<< HEAD
  maxKeys: 1000 // Limit cache size
});

// Encryption setup with key validation
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8');
if (ENCRYPTION_KEY.length !== 32) {
  console.error('Invalid encryption key length. It must be exactly 32 bytes.');
  process.exit(1);
}

=======
  maxKeys: 1000
});

>>>>>>> master
// Constants
const IV_LENGTH = 16;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_LIMIT = 256 * 1024 * 1024; // 256MB
<<<<<<< HEAD
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
=======
const PREVIEW_SIZE = { width: 400, height: 300 };
const PREVIEW_QUALITY = 80;

// Encryption key validation
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8');
if (ENCRYPTION_KEY.length !== 32) {
  console.error('Invalid encryption key length. It must be exactly 32 bytes.');
  process.exit(1);
}

// File Categories and Types
const FILE_TYPES = {
  documents: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    category: 'document'
  },
  images: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    category: 'image'
  },
  videos: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/avi'],
    extensions: ['.mp4', '.webm', '.avi'],
    category: 'video'
  }
};

// Helper Functions
function getFileCategory(mimeType, extension) {
  for (const [key, value] of Object.entries(FILE_TYPES)) {
    if (value.mimeTypes.includes(mimeType) || value.extensions.includes(extension.toLowerCase())) {
      return value.category;
    }
  }
  return 'other';
}

function validateFileType(mimeType, extension) {
  return Object.values(FILE_TYPES).some(type => 
    type.mimeTypes.includes(mimeType) || type.extensions.includes(extension.toLowerCase())
  );
}

// Encryption Functions
function encrypt(buffer) {
  try {
>>>>>>> master
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
<<<<<<< HEAD
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Input must be a buffer');
    }
=======
>>>>>>> master
    const iv = buffer.slice(0, IV_LENGTH);
    const encryptedContent = buffer.slice(IV_LENGTH);
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    return Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new AppError('Failed to decrypt file', 500);
  }
}

<<<<<<< HEAD
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
=======
// Preview Generation Functions
async function generateImagePreview(buffer) {
  return sharp(buffer)
    .resize(PREVIEW_SIZE.width, PREVIEW_SIZE.height, {
      fit: 'inside',
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .jpeg({ quality: PREVIEW_QUALITY })
    .toBuffer();
}

async function generateVideoPreview(buffer, tempDir) {
  const tempVideoPath = path.join(tempDir, `preview-${Date.now()}.mp4`);
  const tempThumbPath = path.join(tempDir, `thumb-${Date.now()}.jpg`);

  try {
    await fs.writeFile(tempVideoPath, buffer);

    const preview = await new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: ['1'],
          filename: path.basename(tempThumbPath),
          folder: path.dirname(tempThumbPath),
          size: `${PREVIEW_SIZE.width}x${PREVIEW_SIZE.height}`
        })
        .on('end', async () => {
          try {
            const thumbBuffer = await fs.readFile(tempThumbPath);
            const optimizedThumb = await sharp(thumbBuffer)
              .jpeg({ quality: PREVIEW_QUALITY })
              .toBuffer();
            resolve(optimizedThumb);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', reject);
    });

    return preview;
  } finally {
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempThumbPath).catch(() => {});
  }
}
async function generateVideoThumbnail(buffer) {
>>>>>>> master
  const tempDir = os.tmpdir();
  const tempVideoPath = path.join(tempDir, `${Date.now()}-video.mp4`);
  const tempThumbPath = path.join(tempDir, `${Date.now()}-thumb.jpg`);

  try {
<<<<<<< HEAD
    await fs.writeFile(tempVideoPath, videoBuffer);
=======
    await fs.writeFile(tempVideoPath, buffer);
>>>>>>> master

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
<<<<<<< HEAD
              .resize(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .jpeg({ quality: THUMBNAIL_QUALITY })
=======
              .resize(400, 300, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .jpeg({ quality: 80 })
>>>>>>> master
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
<<<<<<< HEAD
          size: `${PREVIEW_IMAGE_SIZE.width}x${PREVIEW_IMAGE_SIZE.height}`
=======
          size: '400x300'
>>>>>>> master
        });
    });
  } catch (error) {
    await cleanup();
    throw error;
  }

  async function cleanup() {
<<<<<<< HEAD
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
=======
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempThumbPath).catch(() => {});
  }
}

async function generatePreview(document, buffer) {
  if (!document || !buffer) {
    console.log('Invalid document or buffer for preview generation');
    return null;
  }

  console.log('Generating preview for document type:', document.category);

  try {
    switch (document.category) {
      case 'image':
        return await sharp(buffer)
          .resize(400, 300, {
            fit: 'inside',
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .jpeg({ quality: 80 })
          .toBuffer();

      case 'video':
        try {
          return await generateVideoThumbnail(buffer);
        } catch (error) {
          console.error('Video thumbnail generation failed:', error);
          return null;
        }

      case 'document':
      default:
        return null;
    }
>>>>>>> master
  } catch (error) {
    console.error('Preview generation error:', error);
    return null;
  }
<<<<<<< HEAD
};

// Controller methods
=======
}
// Storage Validation
async function validateStorage(userId, newSize) {
  const totalSize = await models.Document.sum('size', {
    where: { userId, isDeleted: false }
  });
  
  const projectedTotal = (totalSize || 0) + newSize;
  if (projectedTotal > STORAGE_LIMIT) {
    throw new AppError(
      `Storage limit exceeded. Current: ${formatSize(totalSize)}, ` +
      `New: ${formatSize(newSize)}, Limit: ${formatSize(STORAGE_LIMIT)}`,
      400
    );
  }
  
  return totalSize;
}

function formatSize(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Controller Methods
>>>>>>> master
exports.getPreview = async (req, res, next) => {
  try {
    const document = await models.Document.findOne({
      where: { 
<<<<<<< HEAD
        id: req.params.id, 
=======
        id: req.params.id,
>>>>>>> master
        userId: req.user.id,
        isDeleted: false
      }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

<<<<<<< HEAD
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
=======
    // Only generate previews for images
    if (document.category === 'image') {
      try {
        const decryptedContent = decrypt(document.content);
        const preview = await sharp(decryptedContent)
          .resize(400, 300, {
            fit: 'inside',
            withoutEnlargement: true,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        // Set response headers
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', preview.length);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        
        // Send binary data
        return res.send(preview);
      } catch (error) {
        console.error('Image preview generation error:', error);
        return res.status(500).json({ message: 'Failed to generate preview' });
      }
    } else {
      // For non-images, return 404
      return res.status(404).json({ message: 'Preview not available' });
    }
>>>>>>> master
  } catch (error) {
    console.error('Preview error:', error);
    next(error);
  }
};

<<<<<<< HEAD
=======
function generatePlaceholderSVG(category) {
  const colors = {
    document: '#4A90E2',
    image: '#2ECC71',
    video: '#E74C3C',
    other: '#95A5A6'
  };

  return `
    <svg width="${PREVIEW_SIZE.width}" height="${PREVIEW_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f5"/>
      <rect width="80" height="100" x="${PREVIEW_SIZE.width/2 - 40}" y="${PREVIEW_SIZE.height/2 - 50}" fill="${colors[category]}"/>
      <text x="${PREVIEW_SIZE.width/2}" y="${PREVIEW_SIZE.height/2 + 10}" 
            fill="#fff" text-anchor="middle" font-family="Arial" font-size="14">
        ${category.toUpperCase()}
      </text>
    </svg>
  `;
}

exports.uploadFiles = async (req, res, next) => {
  const t = await sequelize.transaction();
  const uploadedFiles = [];
  const errors = [];

  try {
    if (!req.files?.length) {
      throw new AppError('No files uploaded', 400);
    }

    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    await validateStorage(req.user.id, totalSize);

    for (const file of req.files) {
      try {
        const { originalname, buffer, mimetype, size } = file;
        const sanitizedName = sanitize(originalname);
        const extension = path.extname(sanitizedName);

        if (size > MAX_FILE_SIZE) {
          throw new Error(`File size exceeds ${formatSize(MAX_FILE_SIZE)} limit`);
        }

        if (!validateFileType(mimetype, extension)) {
          throw new Error('Unsupported file type');
        }

        const category = getFileCategory(mimetype, extension);
        const preview = await generatePreview({ category, name: sanitizedName }, buffer);
        const encryptedContent = encrypt(buffer);

        const newFile = await models.Document.create({
          userId: req.user.id,
          name: sanitizedName,
          type: 'file',
          category,
          mimeType: mimetype,
          size,
          content: encryptedContent,
          path: `/${sanitizedName}`,
          preview
        }, { transaction: t });

        if (preview) {
          previewCache.set(`preview:${newFile.id}`, preview);
        }

        const { content, ...fileData } = newFile.toJSON();
        uploadedFiles.push(fileData);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    if (uploadedFiles.length === 0) {
      throw new AppError('No files were successfully uploaded', 400);
    }

    await t.commit();

    res.status(201).json({
      status: 'success',
      data: {
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
const validateImageData = async (buffer, mimeType) => {
  try {
    if (mimeType.includes('svg')) {
      // Validate SVG
      const text = buffer.toString('utf8');
      if (!text.includes('<svg')) {
        throw new Error('Invalid SVG content');
      }
      return true;
    } else {
      // Validate image using sharp
      const metadata = await sharp(buffer).metadata();
      console.log('Image validation:', {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: buffer.length
      });
      return true;
    }
  } catch (error) {
    console.error('Image validation failed:', error);
    return false;
  }
};

>>>>>>> master
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

<<<<<<< HEAD
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

=======
>>>>>>> master
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
<<<<<<< HEAD
      return res.status(404).json({ message: 'Document not found' });
=======
      throw new AppError('Document not found', 404);
>>>>>>> master
    }

    const decryptedContent = decrypt(document.content);
    
    res.set({
      'Content-Type': document.mimeType,
      'Content-Length': decryptedContent.length,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(document.name)}"`,
      'Cache-Control': 'private, no-cache'
    });

<<<<<<< HEAD
    return res.send(decryptedContent);
  } catch (error) {
    console.error('Download error:', error);
=======
    res.send(decryptedContent);
  } catch (error) {
>>>>>>> master
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  const t = await sequelize.transaction();
<<<<<<< HEAD
  try {
    const [updatedRowsCount] = await models.Document.update(
=======
  
  try {
    const result = await models.Document.update(
>>>>>>> master
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

<<<<<<< HEAD
    if (updatedRowsCount === 0) {
      throw new AppError('Document not found', 404);
    }

    // Remove from cache
    previewCache.del(`preview:${req.params.id}`);

    await t.commit();
=======
    if (result[0] === 0) {
      throw new AppError('Document not found', 404);
    }

    previewCache.del(`preview:${req.params.id}`);
    await t.commit();
    
>>>>>>> master
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.updateDocument = async (req, res, next) => {
  const t = await sequelize.transaction();
<<<<<<< HEAD
  try {
    const { name } = req.body;
    const sanitizedName = sanitize(name);

    const [updatedRowsCount, updatedDocuments] = await models.Document.update(
=======
  
  try {
    const { name } = req.body;
    if (!name) {
      throw new AppError('Name is required', 400);
    }

    const sanitizedName = sanitize(name);
    if (sanitizedName !== name) {
      throw new AppError('Invalid characters in filename', 400);
    }

    const [updatedCount, [updatedDocument]] = await models.Document.update(
>>>>>>> master
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

<<<<<<< HEAD
    if (updatedRowsCount === 0) {
=======
    if (updatedCount === 0) {
>>>>>>> master
      throw new AppError('Document not found', 404);
    }

    await t.commit();
<<<<<<< HEAD
    res.json({ 
      message: 'Document updated successfully', 
      document: updatedDocuments[0] 
=======
    
    res.json({
      status: 'success',
      message: 'Document updated successfully',
      document: updatedDocument
>>>>>>> master
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  const t = await sequelize.transaction();
<<<<<<< HEAD
=======
  
>>>>>>> master
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
<<<<<<< HEAD
    res.json({ 
      message: 'Favorite status updated', 
      isFavorite: document.isFavorite 
=======
    
    res.json({
      status: 'success',
      message: 'Favorite status updated',
      isFavorite: document.isFavorite
>>>>>>> master
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

<<<<<<< HEAD
=======
// In documentController.js
>>>>>>> master
exports.getStorageInfo = async (req, res, next) => {
  try {
    const totalSize = await models.Document.sum('size', {
      where: { 
        userId: req.user.id, 
        isDeleted: false 
      }
    });

<<<<<<< HEAD
    res.json({ 
      used: totalSize || 0, 
      limit: STORAGE_LIMIT,
      available: STORAGE_LIMIT - (totalSize || 0)
    });
  } catch (error) {
=======
    const storageInfo = {
      used: totalSize || 0,
      limit: STORAGE_LIMIT,
      available: STORAGE_LIMIT - (totalSize || 0)
    };

    console.log('Storage info:', storageInfo); // Add this for debugging

    res.json(storageInfo);
  } catch (error) {
    console.error('Storage info error:', error);
>>>>>>> master
    next(new AppError('Error fetching storage information', 500));
  }
};

<<<<<<< HEAD
// Cache cleanup on process exit
process.on('SIGINT', () => {
  previewCache.close();
  process.exit();
=======
exports.cleanupTempFiles = async () => {
  try {
    const tempDir = os.tmpdir();
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      if (file.startsWith('preview-') || file.startsWith('thumb-')) {
        const filePath = path.join(tempDir, file);
        try {
          const stats = await fs.stat(filePath);
          const age = now - stats.mtime.getTime();
          
          // Delete files older than 1 hour
          if (age > 3600000) {
            await fs.unlink(filePath);
          }
        } catch (error) {
          console.error(`Error cleaning up file ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error during temp file cleanup:', error);
  }
};

// Setup auto cleanup
setInterval(exports.cleanupTempFiles, 3600000); // Run every hour

// Cleanup on process exit
process.on('SIGINT', async () => {
  try {
    await exports.cleanupTempFiles();
    previewCache.close();
  } catch (error) {
    console.error('Error during shutdown cleanup:', error);
  } finally {
    process.exit();
  }
>>>>>>> master
});

module.exports = exports;