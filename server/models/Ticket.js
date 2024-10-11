module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Invalid date format' },
        isAfter: { args: new Date().toISOString(), msg: 'Due date must be in the future' }
      }
    },
    notes: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    tableName: 'tickets',
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['assignee_id'] },
      { fields: ['creator_id'] },
      { fields: ['due_date'] },
      { fields: ['created_at'] }
    ],
    hooks: {
      beforeValidate: (ticket) => {
        if (ticket.dueDate && !(ticket.dueDate instanceof Date)) {
          ticket.dueDate = new Date(ticket.dueDate);
        }
      }
    }
  });

  Ticket.prototype.addNote = async function(content, userId) {
    const note = {
      content,
      createdBy: userId,
      createdAt: new Date()
    };
    this.notes = [...(this.notes || []), note];
    return this.save();
  };

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.User, {
      foreignKey: 'assignee_id',
      as: 'assignee'
    });
    Ticket.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator'
    });
  };

  return Ticket;
};