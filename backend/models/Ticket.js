const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      Ticket.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      });
      Ticket.belongsTo(models.User, {
        foreignKey: 'assigneeId',
        as: 'assignee',
        onDelete: 'SET NULL'
      });
    }

    // Static method to get tickets by status
    static async getTicketsByStatus(status) {
      return await this.findAll({
        where: { status },
        include: ['user', 'assignee'],
        order: [['createdAt', 'DESC']]
      });
    }

    // Static method to get overdue tickets
    static async getOverdueTickets() {
      const { Op } = require('sequelize');
      return await this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          status: {
            [Op.ne]: 'Closed'
          }
        },
        include: ['user', 'assignee'],
        order: [['dueDate', 'ASC']]
      });
    }
  }

  Ticket.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: { msg: 'User ID is required' },
        isUUID: { args: 4, msg: 'Invalid User ID format' }
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: 'Title is required' },
        notEmpty: { msg: 'Title cannot be empty' },
        len: { args: [3, 255], msg: 'Title must be between 3 and 255 characters' },
        customValidator(value) {
          if (value && value.trim().length < 3) {
            throw new Error('Title must contain at least 3 non-whitespace characters');
          }
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: 'Description is required' },
        notEmpty: { msg: 'Description cannot be empty' },
        len: { args: [10, 5000], msg: 'Description must be between 10 and 5000 characters' },
        customValidator(value) {
          if (value && value.trim().length < 10) {
            throw new Error('Description must contain at least 10 non-whitespace characters');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('Open', 'In Progress', 'Closed'),
      defaultValue: 'Open',
      allowNull: false,
      validate: {
        notNull: { msg: 'Status is required' },
        isIn: {
          args: [['Open', 'In Progress', 'Closed']],
          msg: 'Status must be Open, In Progress, or Closed'
        }
      }
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      defaultValue: 'Low',
      allowNull: false,
      validate: {
        notNull: { msg: 'Priority is required' },
        isIn: {
          args: [['Low', 'Medium', 'High']],
          msg: 'Priority must be Low, Medium, or High'
        }
      }
    },
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isUUID: { args: 4, msg: 'Invalid Assignee ID format' }
      }
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Invalid date format' },
        isFuture(value) {
          if (value && new Date(value) < new Date()) {
            throw new Error('Due date cannot be in the past');
          }
        }
      }
    },
    notes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidNotesArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Notes must be an array');
          }
          value.forEach((note, index) => {
            if (!note.id || !note.content || !note.createdBy || !note.createdAt) {
              throw new Error(`Invalid note at index ${index}`);
            }
          });
        }
      },
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
      validate: {
        isValidAttachmentsArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Attachments must be an array');
          }
          value.forEach((attachment, index) => {
            if (!attachment.id || !attachment.fileName || !attachment.filePath) {
              throw new Error(`Invalid attachment at index ${index}`);
            }
          });
        }
      },
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
    },
    totalNotes: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.notes?.length || 0;
      }
    },
    totalAttachments: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.attachments?.length || 0;
      }
    },
    lastUpdated: {
      type: DataTypes.VIRTUAL,
      get() {
        const dates = [
          this.updatedAt,
          ...(this.notes || []).map(note => new Date(note.createdAt)),
          ...(this.attachments || []).map(att => new Date(att.uploadedAt))
        ];
        return new Date(Math.max(...dates));
      }
    }
  }, {
    sequelize,
    modelName: 'Ticket',
    tableName: 'tickets',
    underscored: true,
    paranoid: true, // Enables soft deletes
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['assignee_id'] },
      { fields: ['due_date'] },
      { fields: ['created_at'] },
      { fields: ['deleted_at'] }
    ],
    hooks: {
      beforeValidate: (ticket) => {
        if (ticket.dueDate === '') {
          ticket.dueDate = null;
        }
        
        // Trim strings
        if (ticket.title) ticket.title = ticket.title.trim();
        if (ticket.description) ticket.description = ticket.description.trim();
      },
      beforeSave: (ticket) => {
        // Ensure arrays are properly initialized
        if (!Array.isArray(ticket.notes)) {
          ticket.notes = [];
        }
        if (!Array.isArray(ticket.attachments)) {
          ticket.attachments = [];
        }
      },
      afterCreate: async (ticket, options) => {
        // You could add logging or notifications here
        console.log(`Ticket created: ${ticket.id}`);
      },
      afterUpdate: async (ticket, options) => {
        // You could add logging or notifications here
        console.log(`Ticket updated: ${ticket.id}`);
      }
    }
  });

  // Instance Methods
  
  // Add note method with validation
  Ticket.prototype.addNote = async function(content, userId, userName, attachments = []) {
    if (!content || content.trim().length === 0) {
      throw new Error('Note content cannot be empty');
    }

    const note = {
      id: uuidv4(),
      content: content.trim(),
      createdBy: userId,
      userName,
      createdAt: new Date(),
      attachments: Array.isArray(attachments) ? attachments : []
    };

    this.notes = Array.isArray(this.notes) ? [...this.notes, note] : [note];
    return await this.save();
  };

  // Add attachment method with validation
  Ticket.prototype.addAttachment = async function(file, userId) {
    if (!file || !file.filename) {
      throw new Error('Invalid file data');
    }

    const attachment = {
      id: uuidv4(),
      fileName: file.originalname,
      fileType: file.mimetype,
      filePath: file.filename,
      fileSize: file.size,
      uploadedBy: userId,
      uploadedAt: new Date()
    };

    this.attachments = Array.isArray(this.attachments) ? 
      [...this.attachments, attachment] : [attachment];
    return await this.save();
  };

  // Remove attachment method with validation
  Ticket.prototype.removeAttachment = async function(attachmentId) {
    if (!attachmentId) {
      throw new Error('Attachment ID is required');
    }

    const originalLength = this.attachments.length;
    this.attachments = this.attachments.filter(att => att.id !== attachmentId);
    
    if (this.attachments.length === originalLength) {
      throw new Error('Attachment not found');
    }
    
    return await this.save();
  };

  // Remove note method with validation
  Ticket.prototype.removeNote = async function(noteId) {
    if (!noteId) {
      throw new Error('Note ID is required');
    }

    const originalLength = this.notes.length;
    this.notes = this.notes.filter(note => note.id !== noteId);
    
    if (this.notes.length === originalLength) {
      throw new Error('Note not found');
    }
    
    return await this.save();
  };

  // Get formatted notes with sorting options
  Ticket.prototype.getFormattedNotes = function(sortBy = 'newest') {
    const notes = (this.notes || []).map(note => ({
      ...note,
      createdAt: new Date(note.createdAt),
      attachments: note.attachments || []
    }));

    return sortBy === 'newest' ? 
      notes.sort((a, b) => b.createdAt - a.createdAt) :
      notes.sort((a, b) => a.createdAt - b.createdAt);
  };

  // Get formatted attachments with sorting options
  Ticket.prototype.getFormattedAttachments = function(sortBy = 'newest') {
    const attachments = (this.attachments || []).map(att => ({
      ...att,
      uploadedAt: new Date(att.uploadedAt)
    }));

    return sortBy === 'newest' ? 
      attachments.sort((a, b) => b.uploadedAt - a.uploadedAt) :
      attachments.sort((a, b) => a.uploadedAt - b.uploadedAt);
  };

  // Update note method with validation
  Ticket.prototype.updateNote = async function(noteId, content) {
    if (!noteId) {
      throw new Error('Note ID is required');
    }
    if (!content || content.trim().length === 0) {
      throw new Error('Note content cannot be empty');
    }

    const noteIndex = this.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    this.notes[noteIndex] = {
      ...this.notes[noteIndex],
      content: content.trim(),
      updatedAt: new Date()
    };
    
    return await this.save();
  };

  // Check if user can modify ticket
  Ticket.prototype.canModify = function(userId) {
    if (!userId) return false;
    return this.userId === userId || this.assigneeId === userId;
  };

  // Get ticket status summary
  Ticket.prototype.getStatusSummary = function() {
    return {
      isOverdue: this.isOverdue,
      daysToDueDate: this.dueDate ? 
        Math.ceil((new Date(this.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      totalNotes: this.totalNotes,
      totalAttachments: this.totalAttachments,
      lastUpdated: this.lastUpdated
    };
  };

  return Ticket;
};