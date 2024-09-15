const Property = require('../models/Property');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/properties';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
}).array('images', 5); // Allow up to 5 images

exports.createProperty = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.properties.length >= user.maxProperties) {
        return res.status(403).json({ message: 'You have reached the maximum number of properties for your subscription' });
      }

      const newProperty = new Property({
        name: req.body.name,
        description: req.body.description,
        rentAmount: req.body.rentAmount,
        propertyType: req.body.propertyType,
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        area: req.body.area,
        furnished: req.body.furnished === 'true',
        parking: req.body.parking === 'true',
        petFriendly: req.body.petFriendly === 'true',
        availableNow: req.body.availableNow === 'true',
        owner: req.user._id,
        location: {
          type: 'Point',
          coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
        },
        images: req.files ? req.files.map((file, index) => ({
          path: file.path.replace(/\\/g, '/'),
          isMain: index.toString() === req.body.mainImageIndex
        })) : []
      });

      const savedProperty = await newProperty.save();
      user.properties.push(savedProperty._id);
      await user.save();

      res.status(201).json(savedProperty);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.getUserProperties = async (req, res) => {
  console.log('Fetching properties for user:', req.user._id);
  try {
    const properties = await Property.find({ owner: req.user._id });
    console.log('Found properties:', properties);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  console.log('Fetching property by ID:', req.params.id);
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) {
      console.log('Property not found');
      return res.status(404).json({ message: 'Property not found' });
    }
    console.log('Found property:', property);
    res.json(property);
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  console.log('Updating property:', req.params.id);

  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ message: 'An unknown error occurred when uploading.' });
    }

    console.log('Update data:', req.body);
    console.log('Updated files:', req.files);

    try {
      let updateData = {
        ...req.body,
        furnished: req.body.furnished === 'true',
        parking: req.body.parking === 'true',
        petFriendly: req.body.petFriendly === 'true',
        availableNow: req.body.availableNow === 'true',
      };

      if (req.body.longitude && req.body.latitude) {
        updateData.location = {
          type: 'Point',
          coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
        };
      }

      if (req.files && req.files.length > 0) {
        updateData.images = req.files.map((file, index) => ({
          path: file.path.replace(/\\/g, '/'),
          isMain: index.toString() === req.body.mainImageIndex
        }));
      }

      const property = await Property.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!property) {
        console.log('Property not found for update');
        return res.status(404).json({ message: 'Property not found' });
      }

      console.log('Updated property:', property);
      res.json(property);
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(400).json({ message: error.message });
    }
  });
};

exports.deleteProperty = async (req, res) => {
  console.log('Deleting property:', req.params.id);
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!property) {
      console.log('Property not found for deletion');
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Delete associated images
    if (property.images && property.images.length > 0) {
      property.images.forEach(image => {
        fs.unlink(image.path, (err) => {
          if (err) console.error('Error deleting image file:', err);
        });
      });
    }

    const user = await User.findById(req.user._id);
    user.properties = user.properties.filter(p => p.toString() !== req.params.id);
    await user.save();
    console.log('Updated user properties after deletion');

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  console.log('Toggling favorite for property:', req.params.id);
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      console.log('Property not found');
      return res.status(404).json({ message: 'Property not found' });
    }

    const user = await User.findById(req.user._id);
    const favoriteIndex = user.favoriteProperties.indexOf(property._id);

    if (favoriteIndex > -1) {
      // Remove from favorites
      user.favoriteProperties.splice(favoriteIndex, 1);
      console.log('Property removed from favorites');
    } else {
      // Add to favorites
      user.favoriteProperties.push(property._id);
      console.log('Property added to favorites');
    }

    await user.save();
    res.json({ isFavorite: favoriteIndex === -1 });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: error.message });
  }
};