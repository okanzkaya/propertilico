const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { protect } = require('../middleware/authMiddleware');
const contactController = require('../controllers/contactController');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: JPEG, PNG, GIF'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

router.route('/')
  .get(contactController.getContacts)
  .post(upload.single('avatar'), (req, res, next) => {
    if (req.file) {
      req.body.avatarPath = req.file.path.replace(/\\/g, '/');
    }
    next();
  }, contactController.createContact);

router.route('/:id')
  .get(contactController.getContactById)
  .put(upload.single('avatar'), (req, res, next) => {
    if (req.file) {
      req.body.avatarPath = req.file.path.replace(/\\/g, '/');
    }
    next();
  }, contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;