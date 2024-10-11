const { models, sequelize } = require('../config/db');
const { Op } = require('sequelize');

exports.getPropertyStats = async (userId) => {
  try {
    const stats = await models.Property.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalProperties'],
        [sequelize.fn('SUM', sequelize.cast(sequelize.col('availableNow'), 'int')), 'vacantProperties']
      ],
      where: { ownerId: userId }
    });

    const { totalProperties, vacantProperties } = stats[0].dataValues;
    const totalPropertiesInt = parseInt(totalProperties) || 0;
    const vacantPropertiesInt = parseInt(vacantProperties) || 0;

    return {
      totalProperties: totalPropertiesInt,
      occupiedProperties: totalPropertiesInt - vacantPropertiesInt,
      vacantProperties: vacantPropertiesInt
    };
  } catch (error) {
    console.error('Error fetching property stats:', error);
    throw new Error('Failed to fetch property statistics');
  }
};

exports.getTicketStats = async (userId) => {
  try {
    const stats = await models.Ticket.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { userId },
      group: ['status']
    });

    const statObj = stats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase() + 'Tickets'] = parseInt(stat.dataValues.count) || 0;
      return acc;
    }, {
      openTickets: 0,
      inProgressTickets: 0,
      closedTickets: 0
    });

    return statObj;
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    throw new Error('Failed to fetch ticket statistics');
  }
};

exports.getFinancialStats = async (userId) => {
  try {
    const stats = await models.Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: { userId },
      group: ['type']
    });

    const statObj = stats.reduce((acc, stat) => {
      acc[stat.type + 'Total'] = parseFloat(stat.dataValues.total) || 0;
      return acc;
    }, { incomeTotal: 0, expenseTotal: 0 });

    return {
      totalRevenue: statObj.incomeTotal,
      totalExpenses: statObj.expenseTotal,
      totalProfit: statObj.incomeTotal - statObj.expenseTotal
    };
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    throw new Error('Failed to fetch financial statistics');
  }
};

exports.getOccupancyStats = async (req, res) => {
  try {
    const stats = await models.Property.findAll({
      attributes: [
        'availableNow',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { ownerId: req.user.id },
      group: ['availableNow']
    });

    const occupiedCount = parseInt(stats.find(stat => !stat.availableNow)?.dataValues.count) || 0;
    const vacantCount = parseInt(stats.find(stat => stat.availableNow)?.dataValues.count) || 0;
    const totalCount = occupiedCount + vacantCount;

    res.json([
      { name: 'Occupied', value: occupiedCount },
      { name: 'Vacant', value: vacantCount },
      { name: 'Total', value: totalCount }
    ]);
  } catch (error) {
    console.error('Error fetching occupancy stats:', error);
    res.status(500).json({ message: 'Failed to fetch occupancy statistics', error: error.message });
  }
};

exports.getAllStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [propertyStats, ticketStats, financialStats, occupancyStats] = await Promise.all([
      exports.getPropertyStats(userId),
      exports.getTicketStats(userId),
      exports.getFinancialStats(userId),
      exports.getOccupancyStats(userId)
    ]);

    res.json({
      propertyStats,
      ticketStats,
      financialStats,
      occupancyStats
    });
  } catch (error) {
    console.error('Error fetching all stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

exports.getPropertyStatsEndpoint = async (req, res) => {
  try {
    const stats = await exports.getPropertyStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketStatsEndpoint = async (req, res) => {
  try {
    const stats = await exports.getTicketStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFinancialStatsEndpoint = async (req, res) => {
  try {
    const stats = await exports.getFinancialStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOccupancyStatsEndpoint = async (req, res) => {
  try {
    const stats = await exports.getOccupancyStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};