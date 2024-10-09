module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    task: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500]
      }
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Completed'),
      defaultValue: 'Pending'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    indexes: [
      { fields: ['status'] },
      { fields: ['dueDate'] }
    ]
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, { 
      foreignKey: { 
        name: 'userId', 
        allowNull: false 
      }
    });
  };

  return Task;
};