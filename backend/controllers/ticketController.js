const { models, sequelize } = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const fsPromises = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/tickets");
    // Create directory synchronously if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only images and PDF files are allowed"));
};

// Configure multer upload
exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
}).array("attachments", 5);

// Create Ticket
exports.createTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    // Process file attachments
    const attachments = req.files?.map(file => ({
      id: uuidv4(),
      fileName: file.originalname,
      filePath: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    })) || [];

    const ticketData = {
      userId: req.user.id,
      title,
      description,
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      attachments: attachments,
      notes: []
    };

    const newTicket = await models.Ticket.create(ticketData, {
      transaction: t,
      returning: true
    });

    const createdTicket = await models.Ticket.findOne({
      where: { id: newTicket.id },
      include: [
        {
          model: models.User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      transaction: t
    });

    await t.commit();

    const ticketToSend = createdTicket.toJSON();
    ticketToSend.attachments = attachments;
    ticketToSend.notes = [];

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: ticketToSend
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating ticket:', error);
    res.status(400).json({
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

// Get All Tickets
exports.getTickets = async (req, res) => {
  try {
    const tickets = await models.Ticket.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: models.User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      raw: false
    });

    const currentDate = new Date();
    const processedTickets = tickets.map(ticket => {
      const ticketData = ticket.toJSON();
      return {
        ...ticketData,
        isOverdue: ticket.dueDate && new Date(ticket.dueDate) < currentDate,
        notes: Array.isArray(ticketData.notes) ? ticketData.notes : [],
        attachments: Array.isArray(ticketData.attachments) ? ticketData.attachments : []
      };
    });

    res.json(processedTickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

// Get Single Ticket
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await models.Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: models.User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

// Update Ticket
exports.updateTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const ticket = await models.Ticket.findOne({
      where: { id, userId: req.user.id },
      transaction: t,
    });

    if (!ticket) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Process new attachments
    if (req.files?.length > 0) {
      const newAttachments = req.files.map((file) => ({
        id: uuidv4(),
        fileName: file.originalname,
        filePath: file.filename,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
      }));

      ticket.attachments = [...(ticket.attachments || []), ...newAttachments];
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      assigneeId: req.body.assigneeId || null,
      dueDate: req.body.dueDate || null,
      attachments: ticket.attachments,
    };

    const [updatedRowsCount, [updatedTicket]] = await models.Ticket.update(
      updateData,
      {
        where: { id, userId: req.user.id },
        returning: true,
        transaction: t,
      }
    );

    await t.commit();
    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket,
    });
  } catch (error) {
    await t.rollback();
    console.error('Error updating ticket:', error);
    res.status(400).json({
      message: 'Error updating ticket',
      error: error.message
    });
  }
};

// Delete Ticket
exports.deleteTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }

    const ticket = await models.Ticket.findOne({
      where: { id, userId: req.user.id },
      transaction: t
    });

    if (!ticket) {
      await t.rollback();
      return res.status(404).json({
        message: 'Ticket not found or you do not have permission to delete it'
      });
    }

    // Delete associated files
    if (ticket.attachments?.length > 0) {
      for (const attachment of ticket.attachments) {
        try {
          const filePath = path.join(__dirname, '../uploads/tickets', attachment.filePath);
          await fsPromises.unlink(filePath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }

    await ticket.destroy({ transaction: t });
    await t.commit();

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting ticket:', error);
    res.status(500).json({
      message: 'Error deleting ticket',
      error: error.message
    });
  }
};

// Add Note
exports.addNote = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    console.log('Adding note - Request body:', req.body);
    console.log('Files received:', req.files);

    if (!req.body || !req.body.content) {
      await t.rollback();
      return res.status(400).json({
        message: 'Note content is required',
        details: {
          body: req.body,
          files: req.files ? req.files.length : 0
        }
      });
    }

    // Find the ticket with its current notes
    let ticket = await models.Ticket.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      transaction: t
    });

    if (!ticket) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Process attachments for the note
    const attachments = req.files?.map(file => ({
      id: uuidv4(),
      fileName: file.originalname,
      filePath: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    })) || [];

    // Create the new note
    const newNote = {
      id: uuidv4(),
      content: req.body.content.trim(),
      createdBy: req.user.id,
      createdAt: new Date(),
      attachments: attachments,
      userName: ticket.user.name
    };

    // Initialize or update notes array
    let currentNotes = Array.isArray(ticket.notes) ? ticket.notes : [];
    currentNotes.push(newNote);

    // Update ticket with new notes array
    await models.Ticket.update(
      {
        notes: currentNotes
      },
      {
        where: { id: req.params.id },
        transaction: t
      }
    );

    // Fetch the updated ticket
    const updatedTicket = await models.Ticket.findOne({
      where: { id: ticket.id },
      include: [
        {
          model: models.User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      transaction: t
    });

    await t.commit();

    // Send response with updated ticket
    res.json({
      message: 'Note added successfully',
      ticket: {
        ...updatedTicket.toJSON(),
        notes: currentNotes // Use the updated notes array
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error adding note:', error);
    res.status(500).json({
      message: 'Error adding note to ticket',
      error: error.message
    });
  }
};

// Download Attachment
exports.downloadAttachment = async (req, res) => {
  try {
    const ticket = await models.Ticket.findOne({
      where: { id: req.params.ticketId, userId: req.user.id }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // First check ticket attachments
    let attachment = ticket.attachments?.find(att => att.id === req.params.attachmentId);

    // If not found in ticket attachments, check notes attachments
    if (!attachment && ticket.notes) {
      for (const note of ticket.notes) {
        attachment = note.attachments?.find(att => att.id === req.params.attachmentId);
        if (attachment) break;
      }
    }

    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '../uploads/tickets', attachment.filePath);
    
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      console.error('File not found:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.setHeader('Content-Type', attachment.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file' });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading attachment:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error downloading file', 
        error: error.message 
      });
    }
  }
};

// Delete Attachment
exports.deleteAttachment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id, fileId } = req.params;
    
    const ticket = await models.Ticket.findOne({
      where: { id, userId: req.user.id },
      transaction: t
    });

    if (!ticket) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const attachmentIndex = ticket.attachments.findIndex(att => att.filePath === fileId);
    
    if (attachmentIndex === -1) {
      await t.rollback();
      return res.status(404).json({ message: 'Attachment not found' });
    }

    try {
      const filePath = path.join(__dirname, '../uploads/tickets', ticket.attachments[attachmentIndex].filePath);
      await fsPromises.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    ticket.attachments.splice(attachmentIndex, 1);
    await ticket.save({ transaction: t });

    await t.commit();
    
    res.json({
      message: 'Attachment deleted successfully',
      ticket
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      message: 'Error deleting attachment',
      error: error.message
    });
  }
};

// Handle Attachment Error
exports.handleAttachmentError = (error, req, res, next) => {
  console.error('Attachment handling error:', error);
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: 'File upload error',
      error: error.message
    });
  }
  return res.status(500).json({
    message: 'Error handling attachment',
    error: error.message
  });
};

// Validate Ticket
exports.validateTicket = (req, res, next) => {
  const { title, description, status, priority } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (status && !['Open', 'In Progress', 'Closed'].includes(status)) {
    errors.push('Invalid status value');
  }

  if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
    errors.push('Invalid priority value');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors
    });
  }

  next();
};

// Clean up Temp Files
exports.cleanupTempFiles = async (req, res, next) => {
  if (req.files) {
    for (const file of req.files) {
      try {
        await fsPromises.unlink(file.path);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  }
  next();
};

// Utility function to ensure upload directory exists
exports.ensureUploadDir = async () => {
  const uploadDir = path.join(__dirname, '../uploads/tickets');
  try {
    await fsPromises.access(uploadDir);
  } catch {
    await fsPromises.mkdir(uploadDir, { recursive: true });
    await fsPromises.chmod(uploadDir, 0o755);
  }
  return uploadDir;
};

module.exports = exports;