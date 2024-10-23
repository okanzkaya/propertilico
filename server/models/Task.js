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
        notEmpty: { msg: 'Task cannot be empty' },
        len: { args: [1, 500], msg: 'Task must be between 1 and 500 characters' }
      }
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Completed'),
      defaultValue: 'Pending'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Invalid date format' }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'tasks',
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['due_date'] },
      { fields: ['user_id'] }
    ]
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Task;
};