const { models, sequelize } = require('../config/db');
const { Op } = require('sequelize');
const NodeCache = require('node-cache');
const AppError = require('../utils/appError');

const statsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const handleErrors = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  return { error: `Failed to ${operation}`, details: error.message };
};

const getCachedOrFetch = async (cacheKey, fetchFunction) => {
  const cachedData = statsCache.get(cacheKey);
  if (cachedData) {
    console.log(`Returning cached result for ${cacheKey}`);
    return cachedData;
  }
  
  console.log(`Fetching fresh data for ${cacheKey}`);
  const result = await fetchFunction();
  statsCache.set(cacheKey, result);
  return result;
};

exports.getPropertyStats = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    console.log(`Fetching property stats for user ${ownerId}`);

    const stats = await models.Property.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalProperties'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN \"occupancy_status\" = 'Vacant' THEN 1 ELSE 0 END")), 'vacantProperties'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN \"occupancy_status\" = 'Occupied' THEN 1 ELSE 0 END")), 'occupiedProperties']
      ],
      where: { ownerId },
      raw: true
    });

    const { totalProperties, vacantProperties, occupiedProperties } = stats[0] || { totalProperties: 0, vacantProperties: 0, occupiedProperties: 0 };
    const totalPropertiesInt = parseInt(totalProperties) || 0;
    const vacantPropertiesInt = parseInt(vacantProperties) || 0;
    const occupiedPropertiesInt = parseInt(occupiedProperties) || 0;

    const result = {
      totalProperties: totalPropertiesInt,
      occupiedProperties: occupiedPropertiesInt,
      vacantProperties: vacantPropertiesInt,
      occupancyRate: totalPropertiesInt > 0 ? (occupiedPropertiesInt / totalPropertiesInt) * 100 : 0
    };

    console.log('Property stats fetched successfully:', result);
    res.json(result);
  } catch (error) {
    console.error('Error in getPropertyStats:', error);
    next(new AppError('Error fetching property statistics', 500));
  }
};

exports.getTicketStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching ticket stats for user ${userId}`);

    const stats = await models.Ticket.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { userId },
      group: ['status'],
      raw: true
    });

    console.log('Raw ticket stats:', stats);

    const statObj = {
      openTickets: 0,
      inProgressTickets: 0,
      closedTickets: 0,
      totalTickets: 0
    };

    stats.forEach(stat => {
      switch(stat.status) {
        case 'Open':
          statObj.openTickets = parseInt(stat.count) || 0;
          break;
        case 'In Progress':
          statObj.inProgressTickets = parseInt(stat.count) || 0;
          break;
        case 'Closed':
          statObj.closedTickets = parseInt(stat.count) || 0;
          break;
      }
    });

    statObj.totalTickets = statObj.openTickets + statObj.inProgressTickets + statObj.closedTickets;

    console.log('Processed ticket stats:', statObj);
    res.json(statObj);
  } catch (error) {
    console.error('Error in getTicketStats:', error);
    next(new AppError('Error fetching ticket statistics', 500));
  }
};

exports.getFinancialStats = async (userId) => {
  const cacheKey = `financialStats-${userId}`;
  return getCachedOrFetch(cacheKey, async () => {
    try {
      console.log(`Fetching financial stats for user ${userId}`);
      const stats = await models.Transaction.findAll({
        attributes: [
          'type',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        where: { 
          userId,
          createdAt: {
            [Op.gte]: sequelize.literal('CURRENT_DATE - INTERVAL \'30 days\'')
          }
        },
        group: ['type']
      });

      const statObj = stats.reduce((acc, stat) => {
        acc[stat.type + 'Total'] = parseFloat(stat.dataValues.total) || 0;
        return acc;
      }, { incomeTotal: 0, expenseTotal: 0 });

      const result = {
        totalRevenue: statObj.incomeTotal,
        totalExpenses: statObj.expenseTotal,
        totalProfit: statObj.incomeTotal - statObj.expenseTotal
      };
      console.log('Financial stats fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in getFinancialStats:', error);
      return handleErrors(error, 'fetch financial statistics');
    }
  });
};

exports.getOccupancyStats = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const occupancyStats = await models.Property.findAll({
      where: { ownerId },
      attributes: [
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN \"occupancy_status\" = 'Occupied' THEN 1 ELSE 0 END")), 'occupied'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN \"occupancy_status\" = 'Vacant' THEN 1 ELSE 0 END")), 'vacant'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      raw: true
    });

    if (!occupancyStats || occupancyStats.length === 0) {
      return res.json([
        { name: 'Occupied', value: 0 },
        { name: 'Vacant', value: 0 }
      ]);
    }

    const { occupied, vacant, total } = occupancyStats[0];

    res.json([
      { name: 'Occupied', value: parseInt(occupied) || 0 },
      { name: 'Vacant', value: parseInt(vacant) || 0 }
    ]);
  } catch (error) {
    console.error('Error in getOccupancyStats:', error);
    next(new AppError('Error fetching occupancy statistics', 500));
  }
};

exports.getAllStats = async (req, res) => {
  try {
    console.log(`Fetching all stats for user ${req.user.id}`);
    const userId = req.user.id;
    const [propertyStats, ticketStats, financialStats, occupancyStats] = await Promise.all([
      exports.getPropertyStats(userId),
      exports.getTicketStats(userId),
      exports.getFinancialStats(userId),
      exports.getOccupancyStats(userId)
    ]);

    const result = {
      propertyStats,
      ticketStats,
      financialStats,
      occupancyStats
    };
    console.log('All stats fetched successfully');
    res.json(result);
  } catch (error) {
    console.error('Error fetching all stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

const createEndpoint = (statFunction) => async (req, res) => {
  try {
    console.log(`Endpoint called for ${statFunction.name}`);
    const stats = await statFunction(req.user.id);
    if (stats.error) {
      res.status(500).json(stats);
    } else {
      res.json(stats);
    }
  } catch (error) {
    console.error(`Endpoint error in ${statFunction.name}:`, error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
  }
};

exports.getPropertyStatsEndpoint = createEndpoint(exports.getPropertyStats);
exports.getTicketStatsEndpoint = createEndpoint(exports.getTicketStats);
exports.getFinancialStatsEndpoint = createEndpoint(exports.getFinancialStats);
exports.getOccupancyStatsEndpoint = createEndpoint(exports.getOccupancyStats);

// Helper function to clear cache (useful for testing or manual cache clearing)
exports.clearStatsCache = () => {
  statsCache.flushAll();
  console.log('Stats cache cleared');
};

// Helper function to get cache keys (useful for debugging)
exports.getCacheKeys = () => {
  return statsCache.keys();
};

module.exports = exports;