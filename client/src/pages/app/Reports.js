import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Typography, Grid, Box, Card, CardContent, Button, TextField,
  MenuItem, InputAdornment, Select, FormControl,
  InputLabel, Pagination, Snackbar, Alert, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Close as CloseIcon,
  CloudDownload as DownloadIcon,
  Image as ImageIcon
} from "@mui/icons-material";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CSVLink } from "react-csv";
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  color: theme.palette.text.primary,
}));

const ReportCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const REPORTS_PER_PAGE = 6;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const sampleReports = [
  {
    id: 1,
    title: "Property Overview",
    description: "Overview of property additions and changes",
    type: "PropertyOverview",
    chartType: "line",
    tags: ["property", "overview"],
    data: [
      { month: 'Jan', additions: 5, changes: 2 },
      { month: 'Feb', additions: 3, changes: 1 },
      { month: 'Mar', additions: 7, changes: 3 },
      { month: 'Apr', additions: 2, changes: 4 },
      { month: 'May', additions: 6, changes: 2 },
      { month: 'Jun', additions: 4, changes: 1 },
    ]
  },
  {
    id: 2,
    title: "Ticket Summary",
    description: "Breakdown of tickets created",
    type: "TicketSummary",
    chartType: "bar",
    tags: ["ticket", "summary"],
    data: [
      { month: 'Jan', tickets: 30 },
      { month: 'Feb', tickets: 25 },
      { month: 'Mar', tickets: 35 },
      { month: 'Apr', tickets: 28 },
      { month: 'May', tickets: 32 },
      { month: 'Jun', tickets: 40 },
    ]
  },
  {
    id: 3,
    title: "Financial Overview",
    description: "Overview of financial performance",
    type: "FinancialOverview",
    chartType: "bar",
    tags: ["financial", "overview"],
    data: [
      { month: 'Jan', revenue: 10000, expenses: 5000, profit: 5000 },
      { month: 'Feb', revenue: 12000, expenses: 6000, profit: 6000 },
      { month: 'Mar', revenue: 15000, expenses: 7000, profit: 8000 },
      { month: 'Apr', revenue: 13000, expenses: 6500, profit: 6500 },
      { month: 'May', revenue: 14000, expenses: 7000, profit: 7000 },
      { month: 'Jun', revenue: 16000, expenses: 7500, profit: 8500 },
    ]
  },
  {
    id: 4,
    title: "Ticket Status",
    description: "Current distribution of ticket statuses",
    type: "TicketStatus",
    chartType: "pie",
    tags: ["ticket", "status"],
    data: [
      { name: 'Open', value: 30 },
      { name: 'In Progress', value: 45 },
      { name: 'Closed', value: 25 },
    ]
  },
  {
    id: 5,
    title: "Expense Overview",
    description: "Breakdown of expenses over time",
    type: "ExpenseOverview",
    chartType: "area",
    tags: ["financial", "expenses"],
    data: [
      { month: 'Jan', maintenance: 2000, utilities: 1500, salaries: 3000 },
      { month: 'Feb', maintenance: 1800, utilities: 1600, salaries: 3000 },
      { month: 'Mar', maintenance: 2200, utilities: 1700, salaries: 3100 },
      { month: 'Apr', maintenance: 1900, utilities: 1550, salaries: 3000 },
      { month: 'May', maintenance: 2100, utilities: 1650, salaries: 3050 },
      { month: 'Jun', maintenance: 2300, utilities: 1750, salaries: 3100 },
    ]
  },
  {
    id: 6,
    title: "Revenue Overview",
    description: "Breakdown of revenue sources over time",
    type: "RevenueOverview",
    chartType: "area",
    tags: ["financial", "revenue"],
    data: [
      { month: 'Jan', rent: 8000, fees: 1500, other: 500 },
      { month: 'Feb', rent: 9000, fees: 2000, other: 1000 },
      { month: 'Mar', rent: 11000, fees: 2500, other: 1500 },
      { month: 'Apr', rent: 10000, fees: 2000, other: 1000 },
      { month: 'May', rent: 10500, fees: 2200, other: 1300 },
      { month: 'Jun', rent: 12000, fees: 2500, other: 1500 },
    ]
  },
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [frequency, setFrequency] = useState("monthly");
  const [chartType, setChartType] = useState("");

  const chartRef = useRef(null);

  const filteredReports = useMemo(() => {
    return sampleReports.filter((report) => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || report.type === filterType;
      const matchesTags = filterTags.length === 0 || filterTags.every((tag) => report.tags.includes(tag));
      return matchesSearch && matchesType && matchesTags;
    });
  }, [searchTerm, filterType, filterTags]);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const renderChart = useCallback((type, data, chartType) => {
    const labels = data.map(item => item.month);
    const datasets = Object.keys(data[0])
      .filter(key => key !== 'month')
      .map((key, index) => ({
        label: key,
        data: data.map(item => item[key]),
        backgroundColor: COLORS[index % COLORS.length],
        borderColor: COLORS[index % COLORS.length],
        fill: chartType === 'area',
      }));

    const chartData = { labels, datasets };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: type,
        },
      },
    };

    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
      case 'doughnut':
        const pieData = {
          labels: data.map(item => item.name),
          datasets: [{
            data: data.map(item => item.value),
            backgroundColor: COLORS,
          }],
        };
        return chartType === 'pie' ? <Pie data={pieData} options={options} /> : <Doughnut data={pieData} options={options} />;
      case 'area':
        return <Line data={chartData} options={{ ...options, fill: true }} />;
      default:
        return <Typography>Unsupported chart type</Typography>;
    }
  }, []);

  const handleDownload = async (format) => {
    if (!selectedReport) return;

    switch (format) {
      case 'csv':
        // CSV download logic is handled by CSVLink component
        break;
      case 'excel':
        const ws = XLSX.utils.json_to_sheet(selectedReport.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${selectedReport.title}.xlsx`);
        break;
      case 'pdf':
        const doc = new jsPDF();
        doc.text(selectedReport.title, 20, 10);
        doc.autoTable({
          head: [Object.keys(selectedReport.data[0])],
          body: selectedReport.data.map(Object.values),
        });
        doc.save(`${selectedReport.title}.pdf`);
        break;
      case 'png':
        if (chartRef.current) {
          const canvas = await html2canvas(chartRef.current);
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `${selectedReport.title}.png`;
          link.click();
        }
        break;
      default:
        console.error('Unsupported format');
    }

    setSnackbarMessage(`${format.toUpperCase()} downloaded successfully`);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleFrequencyChange = (event) => {
    setFrequency(event.target.value);
    setSnackbarMessage(`Frequency changed to ${event.target.value}`);
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
    setSnackbarMessage(`Chart type changed to ${event.target.value}`);
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Reports Dashboard</Typography>

      <Typography variant="body1" paragraph>
        Welcome to the Reports Dashboard. Here you can view and analyze various aspects of your property management business.
        Use the filters below to find specific reports, and click on a report to view more details.
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search Reports"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <FormControl fullWidth variant="outlined">
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter by Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="PropertyOverview">Property Overview</MenuItem>
              <MenuItem value="TicketSummary">Ticket Summary</MenuItem>
              <MenuItem value="FinancialOverview">Financial Overview</MenuItem>
              <MenuItem value="TicketStatus">Ticket Status</MenuItem>
              <MenuItem value="ExpenseOverview">Expense Overview</MenuItem>
              <MenuItem value="RevenueOverview">Revenue Overview</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Filter by Tags</InputLabel>
            <Select
              multiple
              value={filterTags}
              onChange={(e) => setFilterTags(e.target.value)}
              label="Filter by Tags"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {Array.from(new Set(sampleReports.flatMap(report => report.tags))).map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {paginatedReports.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <ReportCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>{report.title}</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>{report.description}</Typography>
                <Box mb={2}>
                  {report.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" style={{ marginRight: 4, marginBottom: 4 }} />
                  ))}
                </Box>
                <Box height={300}>
                  {renderChart(report.type, report.data, report.chartType)}
                </Box>
                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setSelectedReport(report)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </ReportCard>
          </Grid>
        ))}
      </Grid>

      {filteredReports.length > REPORTS_PER_PAGE && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(filteredReports.length / REPORTS_PER_PAGE)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        fullWidth
        maxWidth="md"
      >
        {selectedReport && (
          <>
            <DialogTitle>
              {selectedReport.title}
              <IconButton
                aria-label="close"
                onClick={() => setSelectedReport(null)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" paragraph>{selectedReport.description}</Typography>
              <Typography variant="subtitle1" gutterBottom>Report Type: {selectedReport.type}</Typography>
              <Box mb={2}>
                {selectedReport.tags.map((tag) => (
                  <Chip key={tag} label={tag} style={{ marginRight: 4, marginBottom: 4 }} />
                ))}
              </Box>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select value={frequency} onChange={handleFrequencyChange} label="Frequency">
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Chart Type</InputLabel>
                    <Select value={chartType || selectedReport.chartType} onChange={handleChartTypeChange} label="Chart Type">
                      <MenuItem value="bar">Bar Chart</MenuItem>
                      <MenuItem value="line">Line Chart</MenuItem>
                      <MenuItem value="pie">Pie Chart</MenuItem>
                      <MenuItem value="area">Area Chart</MenuItem>
                      <MenuItem value="doughnut">Doughnut Chart</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box ref={chartRef} height={400}>
                {renderChart(selectedReport.type, selectedReport.data, chartType || selectedReport.chartType)}
              </Box>
              <TableContainer component={Paper} style={{ marginTop: 20 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {Object.keys(selectedReport.data[0]).map((key) => (
                        <TableCell key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedReport.data.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <CSVLink
                data={selectedReport.data}
                filename={`${selectedReport.title}.csv`}
                className="hidden"
              >
                <Button startIcon={<DownloadIcon />} onClick={() => handleDownload('csv')}>
                  Download CSV
                </Button>
              </CSVLink>
              <Button onClick={() => handleDownload('excel')} startIcon={<ExcelIcon />}>
                Download Excel
              </Button>
              <Button onClick={() => handleDownload('pdf')} startIcon={<PdfIcon />}>
                Download PDF
              </Button>
              <Button onClick={() => handleDownload('png')} startIcon={<ImageIcon />}>
                Download PNG
              </Button>
              <Button onClick={() => setSelectedReport(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Reports;