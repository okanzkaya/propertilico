module.exports = (sequelize, DataTypes) => {
    const Tax = sequelize.define('Tax', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rate: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      effectiveDate: {
        type: DataTypes.DATE
      },
      expirationDate: {
        type: DataTypes.DATE
      },
      description: {
        type: DataTypes.TEXT
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      }
    }, {
      tableName: 'taxes',
      timestamps: true
    });
  
    Tax.associate = (models) => {
      Tax.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };
  
    return Tax;
  };