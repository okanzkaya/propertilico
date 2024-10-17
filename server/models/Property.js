const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    static associate(models) {
      Property.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner'
      });

      // Add this new association for favorites
      Property.belongsToMany(models.User, {
        through: 'UserFavorites',
        as: 'favoritedBy',
        foreignKey: 'propertyId'
      });
    }
  }

  Property.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Property name cannot be empty' },
        len: { args: [1, 255], msg: 'Property name must be between 1 and 255 characters' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Property description cannot be empty' }
      }
    },
    rentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'Rent amount must be a valid decimal number' },
        min: { args: [0], msg: 'Rent amount cannot be negative' }
      }
    },
    propertyType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Property type cannot be empty' },
        isIn: {
          args: [['Apartment', 'House', 'Condo', 'Townhouse', 'Other']],
          msg: 'Invalid property type'
        }
      }
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Number of bedrooms must be an integer' },
        min: { args: [0], msg: 'Number of bedrooms cannot be negative' }
      }
    },
    bathrooms: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: 'Number of bathrooms must be a valid number' },
        min: { args: [0], msg: 'Number of bathrooms cannot be negative' }
      }
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: 'Area must be a valid number' },
        min: { args: [0], msg: 'Area cannot be negative' }
      }
    },
    furnished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    parking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    petFriendly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    availableNow: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: { msg: 'Latitude must be a valid number' },
        min: { args: [-90], msg: 'Latitude must be between -90 and 90' },
        max: { args: [90], msg: 'Latitude must be between -90 and 90' }
      }
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: { msg: 'Longitude must be a valid number' },
        min: { args: [-180], msg: 'Longitude must be between -180 and 180' },
        max: { args: [180], msg: 'Longitude must be between -180 and 180' }
      }
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isValidImageArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Images must be an array');
          }
          if (value.some(img => typeof img !== 'object' || !img.path || typeof img.path !== 'string')) {
            throw new Error('All image entries must be objects with a path property');
          }
        }
      }
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    occupancyStatus: {
      type: DataTypes.ENUM('Occupied', 'Vacant'),
      allowNull: false,
      defaultValue: 'Vacant',
      validate: {
        isIn: {
          args: [['Occupied', 'Vacant']],
          msg: 'Invalid occupancy status'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    underscored: true,
    indexes: [
      { fields: ['property_type'] },
      { fields: ['rent_amount'] },
      { fields: ['bedrooms'] },
      { fields: ['bathrooms'] },
      { fields: ['area'] },
      { fields: ['owner_id'] },
      { fields: ['available_now'] },
      { fields: ['occupancy_status'] }
    ],
    hooks: {
      beforeValidate: (property) => {
        if (property.latitude === '') property.latitude = null;
        if (property.longitude === '') property.longitude = null;
      }
    }
  });

  return Property;
};