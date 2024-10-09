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
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    rentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    propertyType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
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
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: -180,
        max: 180
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
    indexes: [
      { fields: ['propertyType'] },
      { fields: ['rentAmount'] },
      { fields: ['bedrooms'] },
      { fields: ['bathrooms'] },
      { fields: ['area'] },
      { fields: ['ownerId'] }
    ]
  });

  Property.associate = (models) => {
    Property.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
  };

  return Property;
};