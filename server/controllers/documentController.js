const { models, sequelize } = require('../config/db');
const crypto = require('crypto');
const { Op } = require('sequelize');

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
if (ENCRYPTION_KEY.length !== 32) {
  console.error('Invalid encryption key length. It must be exactly 32 bytes.');
  process.exit(1);
}

const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}

function categorizeFile(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return 'video';
  return 'other';
}

exports.getDocuments = async (req, res) => {
  try {
    const documents = await models.Document.findAll({
      where: { userId: req.user.id, isDeleted: false },
      attributes: { exclude: ['content'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const category = categorizeFile(originalname);
    
    if (size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds the limit (10MB)' });
    }

    const newFile = await models.Document.create({
      userId: req.user.id,
      name: originalname,
      type: 'file',
      category,
      mimeType: mimetype,
      size,
      content: encrypt(buffer.toString('base64')),
      path: `/${originalname}`
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    await t.rollback();
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await models.Document.findOne({
      where: { id: req.params.id, userId: req.user.id, type: 'file' }
    });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const decryptedContent = Buffer.from(decrypt(file.content), 'base64');

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.name}"`
    });

    res.send(decryptedContent);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
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
      return res.status(404).json({ message: 'Document not found' });
    }

    await t.commit();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};

exports.updateDocument = async (req, res) => {
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
      return res.status(404).json({ message: 'Document not found' });
    }

    await t.commit();
    res.json({ message: 'Document updated successfully', document: updatedDocuments[0] });
  } catch (error) {
    await t.rollback();
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const document = await models.Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t
    });
    if (!document) {
      await t.rollback();
      return res.status(404).json({ message: 'Document not found' });
    }
    document.isFavorite = !document.isFavorite;
    await document.save({ transaction: t });
    await t.commit();
    res.json({ message: 'Favorite status updated', isFavorite: document.isFavorite });
  } catch (error) {
    await t.rollback();
    console.error('Error updating favorite status:', error);
    res.status(500).json({ message: 'Error updating favorite status', error: error.message });
  }
};

exports.getStorageInfo = async (req, res) => {
  try {
    const totalSize = await models.Document.sum('size', {
      where: { userId: req.user.id, isDeleted: false, type: 'file' }
    });

    const limit = 268435456; // 256 MB in bytes

    res.json({ used: totalSize || 0, limit });
  } catch (error) {
    console.error('Error fetching storage information:', error);
    res.status(500).json({ message: 'Error fetching storage information', error: error.message });
  }
};