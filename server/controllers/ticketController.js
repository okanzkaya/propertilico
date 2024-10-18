const { models, sequelize } = require('../config/db');

exports.createTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, description, status, priority, assigneeId, dueDate } = req.body;
    const newTicket = await models.Ticket.create({
      userId: req.user.id,
      title,
      description,
      status,
      priority,
      assigneeId,
      dueDate
    }, { transaction: t });

    await t.commit();
    res.status(201).json(newTicket);
  } catch (error) {
    await t.rollback();
    console.error('Error creating ticket:', error);
    res.status(400).json({ message: 'Error creating ticket', error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const tickets = await models.Ticket.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        { model: models.User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });

    const currentDate = new Date();
    const ticketsWithOverdueStatus = tickets.map(ticket => ({
      ...ticket.toJSON(),
      isOverdue: ticket.dueDate && new Date(ticket.dueDate) < currentDate
    }));

    res.json(ticketsWithOverdueStatus);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
};
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await models.Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: models.User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
};

// In ticketController.js
exports.updateTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    
    if (!id) {
      await t.rollback();
      return res.status(400).json({ message: 'Ticket ID is required' });
    }

    const ticket = await models.Ticket.findOne({
      where: { id, userId: req.user.id },
      transaction: t
    });

    if (!ticket) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found or you do not have permission to update it' });
    }

    // Remove id from req.body to prevent its modification
    const { id: removedId, ...updateData } = req.body;

    const [updatedRowsCount, [updatedTicket]] = await models.Ticket.update(updateData, {
      where: { id, userId: req.user.id },
      returning: true,
      transaction: t
    });

    if (updatedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found or no changes made' });
    }

    await t.commit();
    res.json(updatedTicket);
  } catch (error) {
    await t.rollback();
    console.error('Error updating ticket:', error);
    res.status(400).json({ message: 'Error updating ticket', error: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }

    const deletedRowsCount = await models.Ticket.destroy({
      where: { id, userId: req.user.id },
      transaction: t
    });

    if (deletedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found or you do not have permission to delete it' });
    }

    await t.commit();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
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

    const note = {
      content: req.body.content,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    ticket.notes = ticket.notes || [];
    ticket.notes.push(note);
    await ticket.save({ transaction: t });

    await t.commit();
    res.json(ticket);
  } catch (error) {
    await t.rollback();
    console.error('Error adding note to ticket:', error);
    res.status(400).json({ message: 'Error adding note to ticket', error: error.message });
  }
};