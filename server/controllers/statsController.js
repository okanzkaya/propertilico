const { Property } = require('../models/Property');
const { Ticket } = require('../models/Ticket');
const { Transaction } = require('../models/Transaction');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

exports.getPropertyStats = async (userId) => {
  try {
    const stats = await Property.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalProperties'],
        [sequelize.fn('SUM', sequelize.cast(sequelize.col('availableNow'), 'int')), 'vacantProperties']
      ],
      where: { ownerId: userId }
    });

    const { totalProperties, vacantProperties } = stats[0].dataValues;
    return {
      totalProperties: parseInt(totalProperties) || 0,
      occupiedProperties: parseInt(totalProperties) - parseInt(vacantProperties) || 0,
      vacantProperties: parseInt(vacantProperties) || 0
    };
  } catch (error) {
    console.error('Error fetching property stats:', error);
    throw new Error('Error fetching property stats');
  }
};

exports.getTicketStats = async (userId) => {
  try {
    const stats = await Ticket.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { userId },
      group: ['status']
    });

    const statObj = stats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase() + 'Tickets'] = parseInt(stat.dataValues.count);
      return acc;
    }, {});

    return {
      openTickets: statObj.opentickets || 0,
      inProgressTickets: statObj.inprogresstickets || 0,
      closedTickets: statObj.closedtickets || 0
    };
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    throw new Error('Error fetching ticket stats');
  }
};

exports.getFinancialStats = async (userId) => {
  try {
    const stats = await Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: { userId },
      group: ['type']
    });

    const statObj = stats.reduce((acc, stat) => {
      acc[stat.type + 'Total'] = parseFloat(stat.dataValues.total);
      return acc;
    }, {});

    const totalRevenue = statObj.incomeTotal || 0;
    const totalExpenses = statObj.expenseTotal || 0;

    return {
      totalRevenue,
      totalExpenses,
      totalProfit: totalRevenue - totalExpenses
    };
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    throw new Error('Error fetching financial stats');
  }
};

exports.getOccupancyStats = async (userId) => {
  try {
    const stats = await Property.findAll({
      attributes: [
        'availableNow',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { ownerId: userId },
      group: ['availableNow']
    });

    const occupiedCount = stats.find(stat => !stat.availableNow)?.dataValues.count || 0;
    const vacantCount = stats.find(stat => stat.availableNow)?.dataValues.count || 0;
    const totalCount = parseInt(occupiedCount) + parseInt(vacantCount);

    return [
      { name: 'Occupied', value: parseInt(occupiedCount) },
      { name: 'Vacant', value: parseInt(vacantCount) },
      { name: 'Total', value: totalCount }
    ];
  } catch (error) {
    console.error('Error fetching occupancy stats:', error);
    throw new Error('Error fetching occupancy stats');
  }
};