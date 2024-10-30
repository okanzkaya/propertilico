import styles from './Reports.module.css';
import React, { useState, useMemo, useCallback, useRef } from "react";
import PropTypes from 'prop-types';
import {
  Typography, Grid, Box, Card, CardContent, Button, TextField,
  MenuItem, InputAdornment, Select, FormControl, InputLabel, 
  Pagination, Snackbar, Alert, Chip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Close as CloseIcon,
  CloudDownload as DownloadIcon,
  Image as ImageIcon
} from "@mui/icons-material";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
         PointElement, LineElement, ArcElement, Title, Tooltip, 
         Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CSVLink } from "react-csv";
import html2canvas from 'html2canvas';

// Chart Registration
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, 
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

// Constants
const REPORTS_PER_PAGE = 6;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Sample Data
const sampleReports = [
  {
    id: 1,
    title: "Property Overview",
    description: "Overview of property performance and occupancy rates",
    type: "PropertyOverview",
    chartType: "line",
    tags: ["property", "overview", "occupancy"],
    data: [
      { month: 'Jan', occupancy: 92, revenue: 45000, maintenance: 5000 },
      { month: 'Feb', occupancy: 94, revenue: 48000, maintenance: 4800 },
      { month: 'Mar', occupancy: 96, revenue: 52000, maintenance: 5200 },
      { month: 'Apr', occupancy: 95, revenue: 50000, maintenance: 4900 },
      { month: 'May', occupancy: 97, revenue: 54000, maintenance: 5100 },
      { month: 'Jun', occupancy: 98, revenue: 56000, maintenance: 5300 }
    ]
  },
  {
    id: 2,
    title: "Maintenance Requests",
    description: "Analysis of maintenance requests and resolution times",
    type: "MaintenanceOverview",
    chartType: "bar",
    tags: ["maintenance", "requests", "resolution"],
    data: [
      { month: 'Jan', urgent: 12, routine: 45, completed: 52 },
      { month: 'Feb', urgent: 8, routine: 38, completed: 43 },
      { month: 'Mar', urgent: 15, routine: 42, completed: 54 },
      { month: 'Apr', urgent: 10, routine: 40, completed: 48 },
      { month: 'May', urgent: 9, routine: 44, completed: 50 },
      { month: 'Jun', urgent: 11, routine: 41, completed: 49 }
    ]
  },
  {
    id: 3,
    title: "Financial Performance",
    description: "Monthly financial metrics and trends",
    type: "FinancialOverview",
    chartType: "area",
    tags: ["financial", "revenue", "expenses"],
    data: [
      { month: 'Jan', revenue: 85000, expenses: 35000, profit: 50000 },
      { month: 'Feb', revenue: 88000, expenses: 36000, profit: 52000 },
      { month: 'Mar', revenue: 92000, expenses: 37000, profit: 55000 },
      { month: 'Apr', revenue: 90000, expenses: 36500, profit: 53500 },
      { month: 'May', revenue: 94000, expenses: 37500, profit: 56500 },
      { month: 'Jun', revenue: 96000, expenses: 38000, profit: 58000 }
    ]
  },
  {
    id: 4,
    title: "Tenant Satisfaction",
    description: "Tenant satisfaction metrics and feedback analysis",
    type: "TenantOverview",
    chartType: "pie",
    tags: ["tenant", "satisfaction", "feedback"],
    data: [
      { name: 'Very Satisfied', value: 45 },
      { name: 'Satisfied', value: 35 },
      { name: 'Neutral', value: 15 },
      { name: 'Dissatisfied', value: 5 }
    ]
  },
  {
    id: 5,
    title: "Lease Analytics",
    description: "Lease renewal rates and vacancy analysis",
    type: "LeaseOverview",
    chartType: "doughnut",
    tags: ["lease", "renewals", "vacancy"],
    data: [
      { name: 'Renewed', value: 75 },
      { name: 'New Leases', value: 15 },
      { name: 'Pending', value: 7 },
      { name: 'Vacant', value: 3 }
    ]
  },
  {
    id: 6,
    title: "Utility Costs",
    description: "Monthly utility consumption and cost analysis",
    type: "UtilityOverview",
    chartType: "bar",
    tags: ["utilities", "costs", "consumption"],
    data: [
      { month: 'Jan', electricity: 5200, water: 2800, gas: 1800 },
      { month: 'Feb', electricity: 4800, water: 2600, gas: 2000 },
      { month: 'Mar', electricity: 4500, water: 2700, gas: 1900 },
      { month: 'Apr', electricity: 4200, water: 2900, gas: 1700 },
      { month: 'May', electricity: 4600, water: 3000, gas: 1600 },
      { month: 'Jun', electricity: 5000, water: 3200, gas: 1500 }
    ]
  }
];

// Utility Functions
const generateChart = (chartType, chartConfig) => {
  switch (chartType) {
    case 'bar':
      return <Bar data={chartConfig} options={chartConfig.options} />;
    case 'line':
      return <Line data={chartConfig} options={chartConfig.options} />;
    case 'pie':
      return <Pie data={chartConfig} options={chartConfig.options} />;
    case 'doughnut':
      return <Doughnut data={chartConfig} options={chartConfig.options} />;
    case 'area':
      return <Line data={chartConfig} options={{ ...chartConfig.options, fill: true }} />;
    default:
      return null;
  }
};

const downloadReport = async (format, report, chartRef) => {
  switch (format) {
    case 'csv':
      // CSV download is handled by CSVLink component
      break;
    case 'excel':
      const ws = XLSX.utils.json_to_sheet(report.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${report.title}.xlsx`);
      break;
    case 'pdf':
      const doc = new jsPDF();
      doc.text(report.title, 20, 10);
      doc.autoTable({
        head: [Object.keys(report.data[0])],
        body: report.data.map(Object.values),
      });
      doc.save(`${report.title}.pdf`);
      break;
    case 'png':
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${report.title}.png`;
        link.click();
      }
      break;
    default:
      throw new Error('Unsupported format');
  }
};

// Component Sections
const FilterSection = ({ searchTerm, setSearchTerm, filterType, setFilterType, filterTags, setFilterTags }) => (
  <Grid container spacing={2} className={styles.filterSection}>
    <Grid item xs={12} sm={4}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search Reports"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <FormControl fullWidth variant="outlined" className={styles.formControl}>
        <InputLabel>Filter by Type</InputLabel>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          label="Filter by Type"
        >
          <MenuItem value="">All Types</MenuItem>
          {Array.from(new Set(sampleReports.map(report => report.type))).map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} sm={4}>
      <FormControl fullWidth variant="outlined" className={styles.formControl}>
        <InputLabel>Filter by Tags</InputLabel>
        <Select
          multiple
          value={filterTags}
          onChange={(e) => setFilterTags(e.target.value)}
          label="Filter by Tags"
          renderValue={(selected) => (
            <Box className={styles.selectedTags}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" className={styles.tagChip} />
              ))}
            </Box>
          )}
        >
          {Array.from(new Set(sampleReports.flatMap(report => report.tags))).map((tag) => (
            <MenuItem key={tag} value={tag}>{tag}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  </Grid>
);

const ReportsGrid = ({ reports, renderChart, onReportSelect }) => (
  <Grid container spacing={3} className={styles.reportsGrid}>
    {reports.map((report) => (
      <Grid item xs={12} sm={6} md={4} key={report.id}>
        <Card className={styles.reportCard}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{report.title}</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {report.description}
            </Typography>
            <Box className={styles.tagsContainer}>
              {report.tags.map((tag) => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  size="small" 
                  className={styles.tagChip}
                />
              ))}
            </Box>
            <Box className={styles.chartContainer}>
              {renderChart(report.type, report.data, report.chartType)}
            </Box>
            <Box className={styles.cardActions}>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => onReportSelect(report)}
                className={styles.viewButton}
              >
                View Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const PaginationSection = ({ count, page, onChange }) => (
  <Box className={styles.paginationContainer}>
    <Pagination 
      count={count} 
      page={page} 
      onChange={onChange} 
      color="primary" 
      className={styles.pagination}
    />
  </Box>
);

const ReportDialog = ({ 
  report, 
  onClose, 
  frequency, 
  chartType, 
  onFrequencyChange, 
  onChartTypeChange, 
  renderChart, 
  onDownload, 
  chartRef 
}) => (
  <Dialog
    open={!!report}
    onClose={onClose}
    fullWidth
    maxWidth="md"
    className={styles.reportDialog}
  >
    {report && (
      <>
        <DialogTitle className={styles.dialogTitle}>
          {report.title}
          <IconButton
            onClick={onClose}
            className={styles.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className={styles.dialogContent}>
          <Typography variant="body1" paragraph>{report.description}</Typography>
          <Typography variant="subtitle1" gutterBottom>Report Type: {report.type}</Typography>
          <Box className={styles.dialogTags}>
            {report.tags.map((tag) => (
              <Chip key={tag} label={tag} className={styles.dialogTagChip} />
            ))}
          </Box>
          <Grid container spacing={2} className={styles.controlsContainer}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className={styles.formControl}>
                <InputLabel>Frequency</InputLabel>
                <Select value={frequency} onChange={onFrequencyChange} label="Frequency">
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className={styles.formControl}>
                <InputLabel>Chart Type</InputLabel>
                <Select 
                  value={chartType || report.chartType} 
                  onChange={onChartTypeChange} 
                  label="Chart Type"
                >
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                  <MenuItem value="area">Area Chart</MenuItem>
                  <MenuItem value="doughnut">Doughnut Chart</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box ref={chartRef} className={styles.detailChartContainer}>
            {renderChart(report.type, report.data, chartType || report.chartType)}
          </Box>
          <TableContainer component={Paper} className={styles.dataTable}>
            <Table>
              <TableHead>
                <TableRow>
                  {Object.keys(report.data[0]).map((key) => (
                    <TableCell key={key} className={styles.tableHeader}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {report.data.map((row, index) => (
                  <TableRow key={index} className={styles.tableRow}>
                    {Object.values(row).map((value, cellIndex) => (
                      <TableCell key={cellIndex} className={styles.tableCell}>
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <CSVLink
            data={report.data}
            filename={`${report.title}.csv`}
            className={`${styles.downloadButton} ${styles.hidden}`}
          >
            <Button startIcon={<DownloadIcon />} onClick={() => onDownload('csv')}>
              Download CSV
            </Button>
          </CSVLink>
          <Button 
            onClick={() => onDownload('excel')} 
            startIcon={<ExcelIcon />}
            className={styles.downloadButton}
          >
            Download Excel
          </Button>
          <Button 
            onClick={() => onDownload('pdf')} 
            startIcon={<PdfIcon />}
            className={styles.downloadButton}
          >
            Download PDF
          </Button>
          <Button 
            onClick={() => onDownload('png')} 
            startIcon={<ImageIcon />}
            className={styles.downloadButton}
          >
            Download PNG
          </Button>
          <Button onClick={onClose} className={styles.closeButton}>Close</Button>
        </DialogActions>
      </>
    )}
  </Dialog>
);

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [frequency, setFrequency] = useState("monthly");
  const [chartType, setChartType] = useState("");
  const chartRef = useRef(null);

  const filteredReports = useMemo(() => {
    return sampleReports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || report.type === filterType;
      const matchesTags = filterTags.length === 0 || 
        filterTags.every(tag => report.tags.includes(tag));
      return matchesSearch && matchesType && matchesTags;
    });
  }, [searchTerm, filterType, filterTags]);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const renderChart = useCallback((type, data, chartType) => {
    const labels = data.map(item => item.month || item.name);
    const datasets = item => item.month 
      ? Object.keys(data[0])
          .filter(key => key !== 'month')
          .map((key, index) => ({
            label: key,
            data: data.map(item => item[key]),
            backgroundColor: COLORS[index % COLORS.length],
            borderColor: COLORS[index % COLORS.length],
            fill: chartType === 'area',
          }))
      : [{
          data: data.map(item => item.value),
          backgroundColor: COLORS,
          borderColor: COLORS,
        }];

    const chartConfig = {
      labels,
      datasets: datasets(data[0]),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: type }
        }
      }
    };

    return generateChart(chartType, chartConfig);
  }, []);

  const handleDownload = async (format) => {
    if (!selectedReport) return;
    
    try {
      await downloadReport(format, selectedReport, chartRef);
      showSnackbar(`${format.toUpperCase()} downloaded successfully`, "success");
    } catch (error) {
      showSnackbar(`Failed to download ${format.toUpperCase()}`, "error");
      console.error('Download error:', error);
    }
  };

  const handleFrequencyChange = (event) => {
    setFrequency(event.target.value);
    showSnackbar(`Frequency changed to ${event.target.value}`, "info");
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
    showSnackbar(`Chart type changed to ${event.target.value}`, "info");
  };

  const showSnackbar = (message, severity) => {
    setSnackbarState({ open: true, message, severity });
  };

  return (
    <Box className={styles.pageWrapper}>
      <Typography variant="h4" gutterBottom>Reports Dashboard</Typography>
      <Typography variant="body1" paragraph className={styles.dashboardDescription}>
        Welcome to the Reports Dashboard. Here you can view and analyze various aspects 
        of your property management business.
      </Typography>

      <FilterSection 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterTags={filterTags}
        setFilterTags={setFilterTags}
      />

      <ReportsGrid 
        reports={paginatedReports}
        renderChart={renderChart}
        onReportSelect={setSelectedReport}
      />

      {filteredReports.length > REPORTS_PER_PAGE && (
        <PaginationSection 
          count={Math.ceil(filteredReports.length / REPORTS_PER_PAGE)}
          page={currentPage}
          onChange={(_, value) => setCurrentPage(value)}
        />
      )}

      <ReportDialog 
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        frequency={frequency}
        chartType={chartType}
        onFrequencyChange={handleFrequencyChange}
        onChartTypeChange={handleChartTypeChange}
        renderChart={renderChart}
        onDownload={handleDownload}
        chartRef={chartRef}
      />

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))} 
          severity={snackbarState.severity}
          sx={{ width: '100%' }}
          className={styles.alert}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

FilterSection.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  filterType: PropTypes.string.isRequired,
  setFilterType: PropTypes.func.isRequired,
  filterTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  setFilterTags: PropTypes.func.isRequired
};

ReportsGrid.propTypes = {
  reports: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    chartType: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired
  })).isRequired,
  renderChart: PropTypes.func.isRequired,
  onReportSelect: PropTypes.func.isRequired
};

PaginationSection.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

ReportDialog.propTypes = {
  report: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  frequency: PropTypes.string.isRequired,
  chartType: PropTypes.string.isRequired,
  onFrequencyChange: PropTypes.func.isRequired,
  onChartTypeChange: PropTypes.func.isRequired,
  renderChart: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  chartRef: PropTypes.object.isRequired
};

export default Reports;