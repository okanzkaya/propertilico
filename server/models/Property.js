module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
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
        min: { args: [0], msg: 'Rent amount cannot be negative' }
      }
    },
    propertyType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Property type cannot be empty' }
      }
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Number of bedrooms cannot be negative' }
      }
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Number of bathrooms cannot be negative' }
      }
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
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
        min: { args: [-90], msg: 'Latitude must be between -90 and 90' },
        max: { args: [90], msg: 'Latitude must be between -90 and 90' }
      }
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: { args: [-180], msg: 'Longitude must be between -180 and 180' },
        max: { args: [180], msg: 'Longitude must be between -180 and 180' }
      }
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'properties',
    underscored: true,
    indexes: [
      { fields: ['property_type'] },
      { fields: ['rent_amount'] },
      { fields: ['bedrooms'] },
      { fields: ['bathrooms'] },
      { fields: ['area'] },
      { fields: ['owner_id'] }
    ]
  });

  Property.associate = (models) => {
    Property.belongsTo(models.User, {
      foreignKey: 'owner_id',
      as: 'owner'
    });
  };

  return Property;
};