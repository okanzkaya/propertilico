const { Property } = require('../models/Property');
const { Ticket } = require('../models/Ticket');
const { Transaction } = require('../models/Transaction');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

exports.getPropertyStats = async (req, res) => {
  try {
    const totalProperties = await Property.count({ where: { ownerId: req.user.id } });
    const occupiedProperties = await Property.count({ where: { ownerId: req.user.id, availableNow: false } });
    const vacantProperties = await Property.count({ where: { ownerId: req.user.id, availableNow: true } });

    res.json({
      totalProperties,
      occupiedProperties,
      vacantProperties
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property stats', error: error.message });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const openTickets = await Ticket.count({ where: { userId: req.user.id, status: 'Open' } });
    const inProgressTickets = await Ticket.count({ where: { userId: req.user.id, status: 'In Progress' } });
    const closedTickets = await Ticket.count({ where: { userId: req.user.id, status: 'Closed' } });

    res.json({
      openTickets,
      inProgressTickets,
      closedTickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket stats', error: error.message });
  }
};

exports.getFinancialStats = async (req, res) => {
  try {
    const totalRevenue = await Transaction.sum('amount', {
      where: { userId: req.user.id, type: 'income' }
    });

    const totalExpenses = await Transaction.sum('amount', {
      where: { userId: req.user.id, type: 'expense' }
    });

    res.json({
      totalRevenue: totalRevenue || 0,
      totalExpenses: totalExpenses || 0,
      totalProfit: (totalRevenue || 0) - (totalExpenses || 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial stats', error: error.message });
  }
};

exports.getOccupancyStats = async (req, res) => {
  try {
    const occupancyData = await Property.findAll({
      attributes: [
        'availableNow',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { ownerId: req.user.id },
      group: ['availableNow']
    });

    const occupiedCount = occupancyData.find(item => !item.availableNow)?.count || 0;
    const vacantCount = occupancyData.find(item => item.availableNow)?.count || 0;
    const totalCount = occupiedCount + vacantCount;

    res.json([
      { name: 'Occupied', value: occupiedCount },
      { name: 'Vacant', value: vacantCount },
      { name: 'Total', value: totalCount }
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching occupancy stats', error: error.message });
  }
};