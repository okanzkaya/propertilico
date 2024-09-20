const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['PropertyOverview', 'TicketSummary', 'FinancialOverview', 'OccupancyTrend'],
    required: true
  },
  chartType: {
    type: String,
    enum: ['bar', 'line', 'pie'],
    required: true
  },
  dataFetchFunction: {
    type: String,
    required: true
  },
  tags: [String]
});

module.exports = mongoose.model('Report', reportSchema);