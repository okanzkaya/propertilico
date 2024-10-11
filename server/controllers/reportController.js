const { models, sequelize } = require('../config/db');
const { getPropertyStats, getTicketStats, getFinancialStats, getOccupancyStats } = require('./statsController');
const AppError = require('../utils/appError');

exports.getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.Report.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where: req.query.active ? { isActive: true } : {}
    });

    res.json({
      reports: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalReports: count
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    next(new AppError('Error fetching reports', 500));
  }
};

exports.getReportData = async (req, res, next) => {
  try {
    const report = await models.Report.findByPk(req.params.id);
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

    res.json({ ...report.get({ plain: true }), data });
  } catch (error) {
    console.error('Error fetching report data:', error);
    next(new AppError('Error fetching report data', 500));
  }
};

exports.initializeReports = async () => {
  const t = await sequelize.transaction();

  try {
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

    await Promise.all(reports.map(report => 
      models.Report.findOrCreate({
        where: { title: report.title },
        defaults: report,
        transaction: t
      })
    ));

    await t.commit();
    console.log('Pre-defined reports initialized successfully');
  } catch (error) {
    await t.rollback();
    console.error('Error initializing pre-defined reports:', error);
    throw error;
  }
};

exports.createCustomReport = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { title, description, type, chartType, dataFetchFunction, tags } = req.body;

    const newReport = await models.Report.create({
      title,
      description,
      type,
      chartType,
      dataFetchFunction,
      tags,
      userId: req.user.id
    }, { transaction: t });

    await t.commit();
    res.status(201).json(newReport);
  } catch (error) {
    await t.rollback();
    console.error('Error creating custom report:', error);
    next(new AppError('Error creating custom report', 500));
  }
};

exports.updateReport = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { title, description, type, chartType, dataFetchFunction, tags } = req.body;

    const [updatedRowsCount, [updatedReport]] = await models.Report.update({
      title,
      description,
      type,
      chartType,
      dataFetchFunction,
      tags
    }, {
      where: { id, userId: req.user.id },
      returning: true,
      transaction: t
    });

    if (updatedRowsCount === 0) {
      await t.rollback();
      return next(new AppError('Report not found or you do not have permission to update it', 404));
    }

    await t.commit();
    res.json(updatedReport);
  } catch (error) {
    await t.rollback();
    console.error('Error updating report:', error);
    next(new AppError('Error updating report', 500));
  }
};

exports.deleteReport = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const deletedRowsCount = await models.Report.destroy({
      where: { id, userId: req.user.id },
      transaction: t
    });

    if (deletedRowsCount === 0) {
      await t.rollback();
      return next(new AppError('Report not found or you do not have permission to delete it', 404));
    }

    await t.commit();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting report:', error);
    next(new AppError('Error deleting report', 500));
  }
};