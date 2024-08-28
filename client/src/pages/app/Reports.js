import React, { useState, useMemo } from "react";
import {
  Typography,
  Grid,
  Box,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  Info as InfoIcon,
  AddCircle as AddCircleIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ColorLens as ColorLensIcon,
  Label as TagIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import Chart from "react-apexcharts";
import jsPDF from "jspdf";
import { useTheme } from "@mui/material/styles";
import moment from "moment";

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: "2rem",
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: { padding: "1rem" },
}));

const ReportCard = styled(Card)(({ theme }) => ({
  padding: "1rem",
  marginBottom: "1rem",
  cursor: "pointer",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  transition: "all 0.3s ease",
  "&:hover": { boxShadow: theme.shadows[4], transform: "translateY(-3px)" },
}));

const REPORTS_PER_PAGE = 9;

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [addReportOpen, setAddReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [chartColor, setChartColor] = useState("#00E396");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const theme = useTheme();

  const commonChartOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, foreColor: theme.palette.text.primary, background: theme.palette.background.default },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], labels: { style: { colors: theme.palette.text.primary } } },
    yaxis: { labels: { style: { colors: theme.palette.text.primary } } },
    grid: { borderColor: theme.palette.divider },
    tooltip: { theme: theme.palette.mode },
    colors: [chartColor],
  };

  const reports = useMemo(() => [
    { id: 1, title: "Monthly Financial Report", description: "Detailed financial overview of the month.", type: "Financial", data: [45, 52, 38, 45, 19, 23, 2], chartType: "line", createdAt: moment().subtract(1, "months").format("YYYY-MM-DD"), tags: ["finance", "monthly"] },
    { id: 2, title: "Quarterly Expense Report", description: "Breakdown of expenses for the last quarter.", type: "Financial", data: [35, 41, 36, 26, 45, 48, 52], chartType: "bar", createdAt: moment().subtract(2, "months").format("YYYY-MM-DD"), tags: ["finance", "quarterly", "expense"] },
    { id: 3, title: "Quarterly Revenue Report", description: "Summary of revenue for the last quarter.", type: "Financial", data: [50, 60, 70, 80, 90, 100, 110], chartType: "bar", createdAt: moment().subtract(3, "months").format("YYYY-MM-DD"), tags: ["finance", "quarterly", "revenue"] },
    { id: 4, title: "Yearly Expense Report", description: "Annual breakdown of expenses.", type: "Financial", data: [300, 400, 500, 600, 700, 800, 900], chartType: "area", createdAt: moment().subtract(1, "years").format("YYYY-MM-DD"), tags: ["finance", "yearly", "expense"] },
    { id: 5, title: "Yearly Revenue Report", description: "Annual revenue summary.", type: "Financial", data: [400, 500, 600, 700, 800, 900, 1000], chartType: "area", createdAt: moment().subtract(1, "years").format("YYYY-MM-DD"), tags: ["finance", "yearly", "revenue"] },
    { id: 6, title: "Ticket Occurrence Report", description: "Summary of ticket occurrences over the last year.", type: "Quantitative", data: [15, 20, 18, 22, 19, 23, 25], chartType: "line", createdAt: moment().subtract(1, "months").format("YYYY-MM-DD"), tags: ["ticket", "occurrence"] },
    { id: 7, title: "Monthly Maintenance Report", description: "Overview of maintenance activities for the month.", type: "Quantitative", data: [3, 4, 3, 5, 4, 5, 6], chartType: "bar", createdAt: moment().subtract(1, "months").format("YYYY-MM-DD"), tags: ["maintenance", "monthly"] },
    { id: 8, title: "Yearly Occupancy Report", description: "Annual report on property occupancy.", type: "Quantitative", data: [87, 89, 85, 90, 92, 94, 95], chartType: "line", createdAt: moment().subtract(1, "years").format("YYYY-MM-DD"), tags: ["property", "occupancy", "yearly"] },
    { id: 9, title: "Monthly Tenant Feedback Report", description: "Summary of tenant feedback for the month.", type: "Qualitative", data: [4.5, 4.0, 4.2, 4.6, 4.7, 4.8, 5.0], chartType: "radar", createdAt: moment().subtract(1, "months").format("YYYY-MM-DD"), tags: ["tenant", "feedback", "monthly"] },
  ], []);

  const filteredReports = useMemo(() => reports
    .filter((report) => report.title.toLowerCase().includes(searchTerm.toLowerCase()) || report.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((report) => !filterType || report.type === filterType)
    .filter((report) => filterTags.length === 0 || filterTags.every((tag) => report.tags.includes(tag))), [searchTerm, filterType, filterTags, reports]);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [currentPage, filteredReports]);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const exportReport = (report) => {
    const doc = new jsPDF();
    doc.text(report.title, 10, 10);
    doc.text(report.description, 10, 20);
    doc.save(`${report.title}.pdf`);
  };

  const handleClose = () => {
    setSelectedReport(null);
    setAddReportOpen(false);
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Reports</Typography>

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="contained" color="primary" onClick={() => setAddReportOpen(true)} startIcon={<AddCircleIcon />} sx={{ whiteSpace: "nowrap" }}>Create New Report</Button>

          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Filter By Type</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} startAdornment={<InputAdornment position="start"><FilterListIcon /></InputAdornment>}>
              <MenuItem value=""><em>None</em></MenuItem>
              <MenuItem value="Financial">Financial</MenuItem>
              <MenuItem value="Quantitative">Quantitative</MenuItem>
              <MenuItem value="Qualitative">Qualitative</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Filter By Tags</InputLabel>
            <Select multiple value={filterTags} onChange={(e) => setFilterTags(e.target.value)} startAdornment={<InputAdornment position="start"><TagIcon /></InputAdornment>}>
              {["finance", "monthly", "quarterly", "yearly", "expense", "revenue", "ticket", "occurrence", "maintenance", "property", "tenant", "feedback"].map((tag) => (
                <MenuItem key={tag} value={tag}>{tag}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            variant="outlined"
            placeholder="Search Reports"
            sx={{ maxWidth: "300px", flexGrow: 1 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {selectedReport && <Button variant="contained" color="secondary" startIcon={<ExportIcon />} onClick={() => exportReport(selectedReport)}>Export Report</Button>}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {paginatedReports.map((report) => (
          <Grid item xs={12} md={6} key={report.id}>
            <ReportCard onClick={() => setSelectedReport(report)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{report.title}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">{report.description}</Typography>
              <Typography variant="body2" color="textSecondary">Created At: {report.createdAt}</Typography>
              <Chart options={commonChartOptions} series={[{ name: report.type, data: report.data }]} type={report.chartType} height={200} />
            </ReportCard>
          </Grid>
        ))}
      </Grid>

      {filteredReports.length > REPORTS_PER_PAGE && <Box display="flex" justifyContent="center" mt={2}><Pagination count={Math.ceil(filteredReports.length / REPORTS_PER_PAGE)} page={currentPage} onChange={handlePageChange} color="primary" /></Box>}

      {selectedReport && (
        <Dialog open={!!selectedReport} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedReport.title}</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>Details</Typography>
            <Typography variant="body1">{selectedReport.description}</Typography>
            <Chart options={commonChartOptions} series={[{ name: selectedReport.type, data: selectedReport.data }]} type={selectedReport.chartType} height={300} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Close</Button>
            <Button onClick={() => exportReport(selectedReport)} color="primary" startIcon={<ExportIcon />}>Export Report</Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={addReportOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create New Report</DialogTitle>
        <DialogContent>
          {["Report Title", "Description", "Data"].map((label, index) => (
            <TextField
              key={index}
              autoFocus={index === 0}
              margin="dense"
              label={label}
              fullWidth
              variant="outlined"
              InputProps={{ endAdornment: <Tooltip title={`Enter ${label.toLowerCase()}`} placement="top"><InfoIcon /></Tooltip> }}
              multiline={label === "Description" || label === "Data"}
              rows={label === "Description" ? 4 : 2}
            />
          ))}
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Report Type</InputLabel>
            <Select value={reportType} onChange={(e) => setReportType(e.target.value)} label="Report Type">
              <MenuItem value="Financial">Financial</MenuItem>
              <MenuItem value="Quantitative">Quantitative</MenuItem>
              <MenuItem value="Qualitative">Qualitative</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Chart Type</InputLabel>
            <Select label="Chart Type">
              <MenuItem value="line">Line</MenuItem>
              <MenuItem value="bar">Bar</MenuItem>
              <MenuItem value="area">Area</MenuItem>
              <MenuItem value="radar">Radar</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Chart Color"
            fullWidth
            variant="outlined"
            type="color"
            value={chartColor}
            onChange={(e) => setChartColor(e.target.value)}
            InputProps={{ endAdornment: <Tooltip title="Choose a custom color for the chart" placement="top"><ColorLensIcon /></Tooltip> }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleClose} color="primary">Create Report</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">Report created successfully!</Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Reports;
