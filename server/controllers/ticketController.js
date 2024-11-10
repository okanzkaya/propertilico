const { models, sequelize } = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/tickets");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images and PDF files are allowed"));
  },
}).array("attachments", 5); // Maximum 5 files

exports.createTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    // Process file attachments
    const attachments = req.files?.map(file => ({
      id: require('uuid').v4(),
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

    // Convert the ticket to plain object and ensure arrays
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

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await models.Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: models.User,
          as: "assignee",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      message: "Error fetching ticket",
      error: error.message,
    });
  }
};

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
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Process new attachments
    if (req.files?.length > 0) {
      const newAttachments = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: file.filename,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
      }));

      ticket.attachments = [...(ticket.attachments || []), ...newAttachments];
    }

    // Update other fields
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
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating ticket:", error);
    res.status(400).json({
      message: "Error updating ticket",
      error: error.message,
    });
  }
};

exports.deleteTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      await t.rollback();
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await models.Ticket.findOne({
      where: { id, userId: req.user.id },
      transaction: t,
    });

    if (!ticket) {
      await t.rollback();
      return res.status(404).json({
        message: "Ticket not found or you do not have permission to delete it",
      });
    }

    // Delete associated files
    if (ticket.attachments?.length > 0) {
      for (const attachment of ticket.attachments) {
        try {
          await fs.unlink(
            path.join(__dirname, "../uploads/tickets", attachment.filePath)
          );
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
    }

    await ticket.destroy({ transaction: t });
    await t.commit();

    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      message: "Error deleting ticket",
      error: error.message,
    });
  }
};

exports.addNote = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const ticket = await models.Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t
    });

    if (!ticket) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Process attachments for the note
    const attachments = req.files?.map(file => ({
      id: require('uuid').v4(),
      fileName: file.originalname,
      filePath: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    })) || [];

    const note = {
      id: require('uuid').v4(),
      content: req.body.content,
      createdBy: req.user.id,
      createdAt: new Date(),
      attachments: attachments,
      userName: req.user.name
    };

    // Ensure notes is an array
    ticket.notes = Array.isArray(ticket.notes) ? ticket.notes : [];
    ticket.notes.push(note);

    await ticket.save({ transaction: t });

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

    const ticketToSend = updatedTicket.toJSON();
    ticketToSend.notes = ticket.notes;

    res.json({
      message: 'Note added successfully',
      ticket: ticketToSend
    });
  } catch (error) {
    await t.rollback();
    console.error('Error adding note to ticket:', error);
    res.status(400).json({
      message: 'Error adding note to ticket',
      error: error.message
    });
  }
};
// In ticketController.js, update the addNote method:

exports.addNote = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const ticket = await models.Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id },
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
      id: require('uuid').v4(),
      fileName: file.originalname,
      filePath: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    })) || [];

    const note = {
      id: require('uuid').v4(),
      content: req.body.content,
      createdBy: req.user.id,
      createdAt: new Date(),
      attachments: attachments,
      userName: ticket.user.name // Get the user name from the included User model
    };

    // Initialize notes array if it doesn't exist
    const currentNotes = ticket.notes || [];
    ticket.notes = [...currentNotes, note];

    await ticket.save({ transaction: t });

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

    res.json({
      message: 'Note added successfully',
      ticket: {
        ...updatedTicket.toJSON(),
        notes: ticket.notes,
        attachments: ticket.attachments
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Error adding note to ticket:', error);
    res.status(400).json({
      message: 'Error adding note to ticket',
      error: error.message
    });
  }
};
// In server/controllers/ticketController.js

exports.downloadAttachment = async (req, res) => {
  try {
    const ticket = await models.Ticket.findOne({
      where: { id: req.params.ticketId, userId: req.user.id }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const attachment = ticket.attachments.find(att => att.id === req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '../uploads/tickets', attachment.filePath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set headers for download
    res.setHeader('Content-Type', attachment.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
};
exports.deleteAttachment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id, fileId } = req.params;

    const ticket = await models.Ticket.findOne({
      where: { id, userId: req.user.id },
      transaction: t,
    });

    if (!ticket) {
      await t.rollback();
      return res.status(404).json({ message: "Ticket not found" });
    }

    const attachmentIndex = ticket.attachments.findIndex(
      (att) => att.filePath === fileId
    );
    if (attachmentIndex === -1) {
      await t.rollback();
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(
        path.join(
          __dirname,
          "../uploads/tickets",
          ticket.attachments[attachmentIndex].filePath
        )
      );
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    // Remove attachment from ticket
    ticket.attachments.splice(attachmentIndex, 1);
    await ticket.save({ transaction: t });

    await t.commit();
    res.json({
      message: "Attachment deleted successfully",
      ticket,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting attachment:", error);
    res.status(500).json({
      message: "Error deleting attachment",
      error: error.message,
    });
  }
};

module.exports = exports;
