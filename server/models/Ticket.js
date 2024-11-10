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
        notEmpty: { msg: 'Title is required' },
        len: { args: [3, 255], msg: 'Title must be between 3 and 255 characters' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description is required' }
      }
    },
    status: {
      type: DataTypes.ENUM('Open', 'In Progress', 'Closed'),
      defaultValue: 'Open',
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Status is required' },
        isIn: { args: [['Open', 'In Progress', 'Closed']], msg: 'Invalid status value' }
      }
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      defaultValue: 'Low',
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Priority is required' },
        isIn: { args: [['Low', 'Medium', 'High']], msg: 'Invalid priority value' }
      }
    },
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Invalid date format' }
      }
    },
    notes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      get() {
        const value = this.getDataValue('notes');
        if (!value) return [];
        return Array.isArray(value) ? value : [];
      },
      set(value) {
        this.setDataValue('notes', Array.isArray(value) ? value : []);
      }
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      get() {
        const value = this.getDataValue('attachments');
        if (!value) return [];
        return Array.isArray(value) ? value : [];
      },
      set(value) {
        this.setDataValue('attachments', Array.isArray(value) ? value : []);
      }
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
    ],
    hooks: {
      beforeValidate: (ticket) => {
        if (ticket.dueDate === '') {
          ticket.dueDate = null;
        }
      },
      beforeSave: (ticket) => {
        // Ensure notes is always an array
        if (!Array.isArray(ticket.notes)) {
          ticket.notes = [];
        }
        // Ensure attachments is always an array
        if (!Array.isArray(ticket.attachments)) {
          ticket.attachments = [];
        }
      }
    }
  });

  // Add note method
  Ticket.prototype.addNote = async function(content, userId, userName, attachments = []) {
    const note = {
      id: require('uuid').v4(),
      content,
      createdBy: userId,
      userName,
      createdAt: new Date(),
      attachments: attachments || []
    };

    // Initialize or update notes array
    this.notes = Array.isArray(this.notes) ? [...this.notes, note] : [note];
    return this.save();
  };

  // Add attachment method
  Ticket.prototype.addAttachment = async function(file, userId) {
    const attachment = {
      id: require('uuid').v4(),
      fileName: file.originalname,
      fileType: file.mimetype,
      filePath: file.filename,
      fileSize: file.size,
      uploadedBy: userId,
      uploadedAt: new Date()
    };

    // Initialize or update attachments array
    this.attachments = Array.isArray(this.attachments) ? [...this.attachments, attachment] : [attachment];
    return this.save();
  };

  // Remove attachment method
  Ticket.prototype.removeAttachment = async function(attachmentId) {
    this.attachments = this.attachments.filter(att => att.id !== attachmentId);
    return this.save();
  };

  // Remove note method
  Ticket.prototype.removeNote = async function(noteId) {
    this.notes = this.notes.filter(note => note.id !== noteId);
    return this.save();
  };

  // Get formatted notes
  Ticket.prototype.getFormattedNotes = function() {
    return (this.notes || []).map(note => ({
      ...note,
      createdAt: new Date(note.createdAt),
      attachments: note.attachments || []
    })).sort((a, b) => b.createdAt - a.createdAt);
  };

  // Get formatted attachments
  Ticket.prototype.getFormattedAttachments = function() {
    return (this.attachments || []).map(att => ({
      ...att,
      uploadedAt: new Date(att.uploadedAt)
    })).sort((a, b) => b.uploadedAt - a.uploadedAt);
  };

  // Update note method
  Ticket.prototype.updateNote = async function(noteId, content) {
    const noteIndex = this.notes.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
      this.notes[noteIndex] = {
        ...this.notes[noteIndex],
        content,
        updatedAt: new Date()
      };
      return this.save();
    }
    throw new Error('Note not found');
  };

  // Check if user can modify ticket
  Ticket.prototype.canModify = function(userId) {
    return this.userId === userId || this.assigneeId === userId;
  };

  return Ticket;
};