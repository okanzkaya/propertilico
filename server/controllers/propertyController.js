const { Property } = require('../models/Property');
const { User } = require('../models/User');
const { sequelize } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = './uploads/properties';
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
}).array('images', 5);

exports.createProperty = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const user = await User.findByPk(req.user.id);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.properties.length >= user.maxProperties) {
      await t.rollback();
      return res.status(403).json({ message: 'You have reached the maximum number of properties for your subscription' });
    }

    const newProperty = await Property.create({
      ...req.body,
      ownerId: req.user.id,
      furnished: req.body.furnished === 'true',
      parking: req.body.parking === 'true',
      petFriendly: req.body.petFriendly === 'true',
      availableNow: req.body.availableNow === 'true',
      location: sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', req.body.longitude, req.body.latitude), 4326),
      images: req.files ? req.files.map((file, index) => ({
        path: file.path.replace(/\\/g, '/'),
        isMain: index.toString() === req.body.mainImageIndex
      })) : []
    }, { transaction: t });

    await user.addProperty(newProperty, { transaction: t });

    await t.commit();
    res.status(201).json(newProperty);
  } catch (error) {
    await t.rollback();
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Error creating property' });
  }
};

exports.getUserProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { ownerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      where: { id: req.params.id, ownerId: req.user.id }
    });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    res.status(500).json({ message: 'Error fetching property' });
  }
};

exports.updateProperty = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

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

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file, index) => ({
        path: file.path.replace(/\\/g, '/'),
        isMain: index.toString() === req.body.mainImageIndex
      }));
    }

    const [updatedRowsCount, updatedProperties] = await Property.update(
      updateData,
      {
        where: { id: req.params.id, ownerId: req.user.id },
        returning: true,
        transaction: t
      }
    );

    if (updatedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Property not found' });
    }

    await t.commit();
    res.json(updatedProperties[0]);
  } catch (error) {
    await t.rollback();
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Error updating property' });
  }
};

exports.deleteProperty = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const property = await Property.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
      transaction: t
    });

    if (!property) {
      await t.rollback();
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete associated images
    if (property.images && property.images.length > 0) {
      for (const image of property.images) {
        await fs.unlink(image.path).catch(console.error);
      }
    }

    await property.destroy({ transaction: t });

    await User.update(
      { properties: sequelize.literal('"properties" - 1') },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Error deleting property' });
  }
};

exports.toggleFavorite = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const property = await Property.findByPk(req.params.id, { transaction: t });
    if (!property) {
      await t.rollback();
      return res.status(404).json({ message: 'Property not found' });
    }

    const user = await User.findByPk(req.user.id, { transaction: t });
    const isFavorite = await user.hasFavoriteProperty(property, { transaction: t });

    if (isFavorite) {
      await user.removeFavoriteProperty(property, { transaction: t });
    } else {
      await user.addFavoriteProperty(property, { transaction: t });
    }

    await t.commit();
    res.json({ isFavorite: !isFavorite });
  } catch (error) {
    await t.rollback();
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Error updating favorite status' });
  }
};