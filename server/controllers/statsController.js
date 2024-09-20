const Property = require('../models/Property');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction');

exports.getPropertyStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ owner: req.user._id });
    const occupiedProperties = await Property.countDocuments({ owner: req.user._id, availableNow: false });
    const vacantProperties = await Property.countDocuments({ owner: req.user._id, availableNow: true });

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
    const openTickets = await Ticket.countDocuments({ user: req.user._id, status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ user: req.user._id, status: 'In Progress' });
    const closedTickets = await Ticket.countDocuments({ user: req.user._id, status: 'Closed' });

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
    const totalRevenue = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;

    res.json({
      totalRevenue: revenue,
      totalExpenses: expenses,
      totalProfit: revenue - expenses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial stats', error: error.message });
  }
};

exports.getOccupancyStats = async (req, res) => {
  try {
    const occupancyData = await Property.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: '$availableNow', count: { $sum: 1 } } }
    ]);

    const occupiedCount = occupancyData.find(item => !item._id)?.count || 0;
    const vacantCount = occupancyData.find(item => item._id)?.count || 0;
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