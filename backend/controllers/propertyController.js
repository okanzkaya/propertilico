const { models, sequelize } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'properties');
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
}).array('images', 5);

// Helper function to handle file upload
const handleFileUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

exports.createProperty = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    await handleFileUpload(req, res);

    const user = await models.User.findByPk(req.user.id);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    // Check subscription limit
    if (user.properties >= user.maxProperties) {
      await t.rollback();
      return res.status(403).json({ message: 'You have reached the maximum number of properties for your subscription' });
    }

    // Handle coordinates
    let latitude = parseFloat(req.body.latitude);
    let longitude = parseFloat(req.body.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      latitude = null;
      longitude = null;
    } else {
      latitude = Math.max(-90, Math.min(90, latitude));
      longitude = (((longitude + 180) % 360) + 360) % 360 - 180;
    }

    // Handle images and main image
    let images = [];
    if (req.files && req.files.length > 0) {
      const mainImageIndex = parseInt(req.body.mainImageIndex) || 0;
      images = req.files.map((file, index) => ({
        path: file.filename,
        isMain: index === mainImageIndex
      }));
    }

    const newProperty = await models.Property.create({
      ...req.body,
      ownerId: req.user.id,
      furnished: req.body.furnished === 'true',
      parking: req.body.parking === 'true',
      petFriendly: req.body.petFriendly === 'true',
      availableNow: req.body.availableNow === 'true',
      latitude,
      longitude,
      location: latitude && longitude
        ? sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', longitude, latitude), 4326)
        : null,
      images
    }, { transaction: t });

    // Update user's properties count
    await user.increment('properties', { transaction: t });

    await t.commit();
    res.status(201).json(newProperty);
  } catch (error) {
    await t.rollback();
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Error creating property', error: error.message });
  }
};

exports.getUserProperties = async (req, res) => {
  try {
    const properties = await models.Property.findAll({
      where: { ownerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await models.Property.findOne({
      where: { id: req.params.id, ownerId: req.user.id }
    });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    await handleFileUpload(req, res);

    let updateData = {
      ...req.body,
      furnished: req.body.furnished === 'true',
      parking: req.body.parking === 'true',
      petFriendly: req.body.petFriendly === 'true',
      availableNow: req.body.availableNow === 'true',
    };

    if (req.body.longitude && req.body.latitude) {
      updateData.location = sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', req.body.longitude, req.body.latitude), 4326);
    }

    // Handle existing images and main image
    let currentImages = [];
    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages) 
        ? req.body.existingImages 
        : [req.body.existingImages];
      
      currentImages = existingImages.map(img => {
        const image = typeof img === 'string' ? JSON.parse(img) : img;
        return {
          path: image.path,
          isMain: false
        };
      });
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        path: file.filename,
        isMain: false
      }));
      currentImages = [...currentImages, ...newImages];
    }

    // Set main image
    const mainImageIndex = parseInt(req.body.mainImageIndex);
    if (!isNaN(mainImageIndex) && mainImageIndex >= 0 && mainImageIndex < currentImages.length) {
      currentImages[mainImageIndex].isMain = true;
    } else if (currentImages.length > 0) {
      currentImages[0].isMain = true;
    }

    updateData.images = currentImages;

    const property = await models.Property.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
      transaction: t
    });

    if (!property) {
      await t.rollback();
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete removed images from storage
    const oldImages = property.images || [];
    const remainingImagePaths = currentImages.map(img => img.path);
    
    for (const oldImage of oldImages) {
      if (!remainingImagePaths.includes(oldImage.path)) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'properties', oldImage.path);
        await fs.unlink(imagePath).catch(console.error);
      }
    }

    const [updatedRowsCount, updatedProperties] = await models.Property.update(
      updateData,
      {
        where: { id: req.params.id, ownerId: req.user.id },
        returning: true,
        transaction: t
      }
    );

    await t.commit();
    res.json(updatedProperties[0]);
  } catch (error) {
    await t.rollback();
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Error updating property', error: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const property = await models.Property.findOne({
      where: { id: id, ownerId: req.user.id },
      transaction: t
    });

    if (!property) {
      await t.rollback();
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete associated images
    if (property.images && property.images.length > 0) {
      for (const image of property.images) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'properties', image.path);
        await fs.unlink(imagePath).catch(console.error);
      }
    }

    await property.destroy({ transaction: t });

    await models.User.update(
      { properties: sequelize.literal('"properties" - 1') },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Error deleting property', error: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const propertyId = req.params.id;
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    const property = await models.Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const user = await models.User.findByPk(req.user.id);
    const isFavorite = await user.hasFavoriteProperty(property);

    if (isFavorite) {
      await user.removeFavoriteProperty(property);
    } else {
      await user.addFavoriteProperty(property);
    }

    res.json({ isFavorite: !isFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Error updating favorite status' });
  }
};;