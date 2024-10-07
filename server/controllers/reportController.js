const Report = require('../models/Report');
const { getPropertyStats, getTicketStats, getFinancialStats, getOccupancyStats } = require('./statsController');
const AppError = require('../utils/appError');

exports.getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Report.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      ...req.query.active && { where: { isActive: true } }
    });

    res.json({
      reports: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalReports: count
    });
  } catch (error) {
    next(new AppError('Error fetching reports', 500));
  }
};

exports.getReportData = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return next(new AppError('Report not found', 404));
    }

    let data;
    switch (report.dataFetchFunction) {
      case 'getPropertyStats':
        data = await getPropertyStats(req.user.id);
        break;
      case 'getTicketStats':
        data = await getTicketStats(req.user.id);
        break;
      case 'getFinancialStats':
        data = await getFinancialStats(req.user.id);
        break;
      case 'getOccupancyStats':
        data = await getOccupancyStats(req.user.id);
        break;
      default:
        return next(new AppError('Invalid data fetch function', 400));
    }

    res.json({ ...report.toJSON(), data });
  } catch (error) {
    next(new AppError('Error fetching report data', 500));
  }
};

exports.initializeReports = async () => {
  const reports = [
    {
      title: 'Property Overview',
      description: 'Overview of all properties',
      type: 'PropertyOverview',
      chartType: 'pie',
      dataFetchFunction: 'getPropertyStats',
      tags: ['property', 'overview']
    },
    {
      title: 'Ticket Summary',
      description: 'Summary of all tickets',
      type: 'TicketSummary',
      chartType: 'bar',
      dataFetchFunction: 'getTicketStats',
      tags: ['ticket', 'summary']
    },
    {
      title: 'Financial Overview',
      description: 'Overview of finances',
      type: 'FinancialOverview',
      chartType: 'bar',
      dataFetchFunction: 'getFinancialStats',
      tags: ['financial', 'overview']
    },
    {
      title: 'Occupancy Trend',
      description: 'Trend of property occupancy',
      type: 'OccupancyTrend',
      chartType: 'line',
      dataFetchFunction: 'getOccupancyStats',
      tags: ['occupancy', 'trend']
    }
  ];

  try {
    await Promise.all(reports.map(report => 
      Report.findOrCreate({
        where: { title: report.title },
        defaults: report
      })
    ));
    console.log('Pre-defined reports initialized successfully');
  } catch (error) {
    console.error('Error initializing pre-defined reports:', error);
    throw error;
  }
};