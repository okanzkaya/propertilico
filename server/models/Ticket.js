const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      Ticket.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Ticket.belongsTo(models.User, {
        foreignKey: 'assigneeId',
        as: 'assignee'
      });
    }
  }

  Ticket.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title cannot be empty' },
        len: { args: [3, 255], msg: 'Title must be between 3 and 255 characters' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description cannot be empty' }
      }
    },
    status: {
      type: DataTypes.ENUM('Open', 'In Progress', 'Closed'),
      defaultValue: 'Open',
      validate: {
        isIn: { args: [['Open', 'In Progress', 'Closed']], msg: 'Invalid status' }
      }
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      defaultValue: 'Low',
      validate: {
        isIn: { args: [['Low', 'Medium', 'High']], msg: 'Invalid priority' }
      }
    },
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    isOverdue: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.dueDate && new Date(this.dueDate) < new Date();
      }
    }
  }, {
    sequelize,
    modelName: 'Ticket',
    tableName: 'tickets',
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['assignee_id'] },
      { fields: ['due_date'] },
      { fields: ['created_at'] }
    ]
  });

  Ticket.prototype.addNote = async function (content, userId) {
    const note = {
      content,
      createdBy: userId,
      createdAt: new Date()
    };
    this.notes = [...(this.notes || []), note];
    return this.save();
  };

  return Ticket;
};