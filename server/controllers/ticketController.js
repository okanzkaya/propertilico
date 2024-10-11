const { models, sequelize } = require('../config/db');

exports.createTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, description, status, priority, assignee, dueDate } = req.body;
    const newTicket = await models.Ticket.create({
      userId: req.user.id,
      title,
      description,
      status,
      priority,
      assignee,
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
      order: [['createdAt', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await models.Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id }
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

exports.updateTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const [updatedRowsCount, updatedTickets] = await models.Ticket.update(req.body, {
      where: { id: req.params.id, userId: req.user.id },
      returning: true,
      transaction: t
    });

    if (updatedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await t.commit();
    res.json(updatedTickets[0]);
  } catch (error) {
    await t.rollback();
    console.error('Error updating ticket:', error);
    res.status(400).json({ message: 'Error updating ticket', error: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const deletedRowsCount = await models.Ticket.destroy({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t
    });

    if (deletedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Ticket not found' });
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

    ticket.notes = ticket.notes || [];
    ticket.notes.push(req.body);
    await ticket.save({ transaction: t });

    await t.commit();
    res.json(ticket);
  } catch (error) {
    await t.rollback();
    console.error('Error adding note to ticket:', error);
    res.status(400).json({ message: 'Error adding note to ticket', error: error.message });
  }
};