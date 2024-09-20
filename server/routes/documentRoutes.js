const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  getDocuments,
  uploadFile,
  downloadFile,
  deleteDocument,
  updateDocument,
  toggleFavorite,
  getStorageInfo
} = require('../controllers/documentController');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/', protect, getDocuments);
router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/:id/download', protect, downloadFile);
router.delete('/:id', protect, deleteDocument);
router.put('/:id', protect, updateDocument);
router.put('/:id/favorite', protect, toggleFavorite);
router.get('/storage', protect, getStorageInfo);

module.exports = router;