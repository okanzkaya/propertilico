const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
<<<<<<< HEAD
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
=======
const documentController = require('../controllers/documentController');

// Configure multer for multiple file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // Maximum 10 files at once
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/webm',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }
>>>>>>> master
});

router.use(protect);

<<<<<<< HEAD
// Add the preview route before other routes
router.get('/:id/preview', getPreview);

router.get('/', getDocuments);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteDocument);
router.put('/:id', updateDocument);
router.put('/:id/favorite', toggleFavorite);
router.get('/storage', getStorageInfo);
=======
// Updated routes to handle multiple files
router.post('/upload', upload.array('files', 10), documentController.uploadFiles);
router.get('/', documentController.getDocuments);
router.get('/:id/preview', documentController.getPreview);
router.get('/:id/download', documentController.downloadFile);
router.delete('/:id', documentController.deleteDocument);
router.put('/:id', documentController.updateDocument);
router.put('/:id/favorite', documentController.toggleFavorite);
router.get('/storage', documentController.getStorageInfo);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 10 files at once'
      });
    }
  }
  next(error);
});
>>>>>>> master

module.exports = router;