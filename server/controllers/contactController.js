const { models, sequelize } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

console.log('Contact controller loaded');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'contacts');
    console.log('Upload directory:', dir);
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log('Upload directory created or already exists');
      cb(null, dir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    console.log('Received file:', file);
    if (file.mimetype.startsWith('image/')) {
      console.log('File type allowed:', file.mimetype);
      cb(null, true);
    } else {
      console.log('File type not allowed:', file.mimetype);
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
}).single('avatar');

const handleFileUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    console.log('Starting file upload process');
    console.log('Request headers:', req.headers);
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        reject(err);
      } else if (err) {
        console.error('Unknown error:', err);
        reject(err);
      } else {
        console.log('File upload handled successfully');
        console.log('req.file after upload:', req.file);
        console.log('req.body after upload:', req.body);
        resolve();
      }
    });
  });
};

exports.getContacts = async (req, res) => {
  try {
    console.log('Fetching contacts for user:', req.user.id);
    const contacts = await models.Contact.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    console.log(`Found ${contacts.length} contacts`);
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};

exports.createContact = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log('Creating contact...');
    console.log('Request headers:', req.headers);
    console.log('Request body before file upload:', req.body);
    console.log('Request files before file upload:', req.files);

    await handleFileUpload(req, res);

    console.log('Create contact request body after file upload:', req.body);
    console.log('Create contact request file after file upload:', req.file);

    let avatarPath = null;
    if (req.file) {
      avatarPath = path.join('uploads', 'contacts', req.file.filename).replace(/\\/g, '/');
      console.log('Create contact avatar path:', avatarPath);

      // Check if file exists
      try {
        await fs.access(path.join(__dirname, '..', avatarPath));
        console.log('File exists and is accessible');
      } catch (error) {
        console.error('File does not exist or is not accessible:', error);
      }
    } else {
      console.log('No file uploaded');
    }

    const newContact = await models.Contact.create({
      ...req.body,
      userId: req.user.id,
      avatar: avatarPath
    }, { transaction: t });

    await t.commit();
    console.log('New contact created:', newContact.toJSON());
    res.status(201).json(newContact);
  } catch (error) {
    await t.rollback();
    console.error('Error creating contact:', error);
    res.status(400).json({ message: 'Error creating contact', error: error.message });
  }
};;

exports.getContactById = async (req, res) => {
  try {
    console.log(`Fetching contact with id: ${req.params.id} for user: ${req.user.id}`);
    const contact = await models.Contact.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!contact) {
      console.log('Contact not found');
      return res.status(404).json({ message: 'Contact not found' });
    }
    console.log('Contact found:', contact.toJSON());
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Error fetching contact', error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log(`Updating contact with id: ${req.params.id}`);
    console.log('Request body before file upload:', req.body);
    console.log('Request files before file upload:', req.files);

    await handleFileUpload(req, res);

    console.log('Update contact request body after file upload:', req.body);
    console.log('Update contact request file after file upload:', req.file);

    let avatarPath = undefined;
    if (req.file) {
      avatarPath = path.join('uploads', 'contacts', req.file.filename).replace(/\\/g, '/');
      console.log('Update contact avatar path:', avatarPath);

      // Check if file exists
      try {
        await fs.access(path.join(__dirname, '..', avatarPath));
        console.log('File exists and is accessible');
      } catch (error) {
        console.error('File does not exist or is not accessible:', error);
      }

      // Delete old avatar if it exists
      const oldContact = await models.Contact.findByPk(req.params.id);
      if (oldContact && oldContact.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', oldContact.avatar);
        try {
          await fs.unlink(oldAvatarPath);
          console.log('Old avatar deleted successfully');
        } catch (err) {
          console.error('Error deleting old avatar:', err);
        }
      }
    } else {
      console.log('No new file uploaded');
    }

    const [updatedRowsCount, updatedContacts] = await models.Contact.update(
      {
        ...req.body,
        avatar: avatarPath
      },
      {
        where: { id: req.params.id, userId: req.user.id },
        returning: true,
        transaction: t
      }
    );
    if (updatedRowsCount === 0) {
      await t.rollback();
      console.log('Contact not found for update');
      return res.status(404).json({ message: 'Contact not found' });
    }
    await t.commit();
    console.log('Contact updated:', updatedContacts[0].toJSON());
    res.json(updatedContacts[0]);
  } catch (error) {
    await t.rollback();
    console.error('Error updating contact:', error);
    res.status(400).json({ message: 'Error updating contact', error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log(`Deleting contact with id: ${req.params.id}`);
    const contact = await models.Contact.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!contact) {
      await t.rollback();
      console.log('Contact not found for deletion');
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Delete avatar file if it exists
    if (contact.avatar) {
      const avatarPath = path.join(__dirname, '..', contact.avatar);
      try {
        await fs.unlink(avatarPath);
        console.log('Avatar file deleted successfully');
      } catch (err) {
        console.error('Error deleting avatar file:', err);
      }
    }

    await contact.destroy({ transaction: t });
    await t.commit();
    console.log('Contact deleted successfully');
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
};

exports.searchContacts = async (req, res) => {
  try {
    const { query } = req.query;
    console.log(`Searching contacts for user: ${req.user.id}, query: ${query}`);
    const contacts = await models.Contact.findAll({
      where: {
        userId: req.user.id,
        [sequelize.Op.or]: [
          { name: { [sequelize.Op.iLike]: `%${query}%` } },
          { email: { [sequelize.Op.iLike]: `%${query}%` } },
          { phone: { [sequelize.Op.iLike]: `%${query}%` } },
          { role: { [sequelize.Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['name', 'ASC']]
    });
    console.log(`Found ${contacts.length} contacts matching the search query`);
    res.json(contacts);
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ message: 'Error searching contacts', error: error.message });
  }
};

module.exports = exports;