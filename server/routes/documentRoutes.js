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
  getStorageInfo,
  getPreview,  // Add this
} = require('../controllers/documentController');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(protect);

// Add the preview route before other routes
router.get('/:id/preview', getPreview);

router.get('/', getDocuments);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteDocument);
router.put('/:id', updateDocument);
router.put('/:id/favorite', toggleFavorite);
router.get('/storage', getStorageInfo);

module.exports = router;