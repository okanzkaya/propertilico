const Report = require('../models/Report');
const { getPropertyStats, getTicketStats, getFinancialStats, getOccupancyStats } = require('./statsController');

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    console.error('Error in getReports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

exports.getReportData = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    let data;
    switch (report.dataFetchFunction) {
      case 'getPropertyStats':
        data = await getPropertyStats(req, res);
        break;
      case 'getTicketStats':
        data = await getTicketStats(req, res);
        break;
      case 'getFinancialStats':
        data = await getFinancialStats(req, res);
        break;
      case 'getOccupancyStats':
        data = await getOccupancyStats(req, res);
        break;
      default:
        return res.status(400).json({ message: 'Invalid data fetch function' });
    }

    res.json({ ...report.toObject(), data });
  } catch (error) {
    console.error('Error in getReportData:', error);
    res.status(500).json({ message: 'Error fetching report data', error: error.message });
  }
};

// Function to initialize pre-defined reports
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
    for (const report of reports) {
      await Report.findOneAndUpdate(
        { title: report.title },
        report,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log('Pre-defined reports initialized successfully');
  } catch (error) {
    console.error('Error initializing pre-defined reports:', error);
  }
};