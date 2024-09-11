import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Typography,
  Grid,
  Box,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Pagination,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  useMediaQuery,
  Autocomplete,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import ReportChart from './ReportChart';

const formatDate = (date) => date.toISOString().split('T')[0];
const subMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - months);
  return newDate;
};

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const ReportCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  cursor: "pointer",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  "&:hover": { 
    boxShadow: theme.shadows[4], 
    transform: "translateY(-3px)",
    borderColor: theme.palette.primary.main,
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const REPORTS_PER_PAGE = 6;

const FilterBox = ({ filterType, setFilterType, filterTags, setFilterTags, reports, isMobile }) => (
  <Box display="flex" flexDirection={isMobile ? "column" : "row"} alignItems="stretch" gap={2}>
    <FormControl variant="outlined" fullWidth={isMobile}>
      <InputLabel>Filter By Type</InputLabel>
      <Select 
        value={filterType} 
        onChange={(e) => setFilterType(e.target.value)} 
        label="Filter By Type"
        startAdornment={<InputAdornment position="start"><FilterListIcon /></InputAdornment>}
      >
        <MenuItem value=""><em>None</em></MenuItem>
        <MenuItem value="Financial">Financial</MenuItem>
        <MenuItem value="Quantitative">Quantitative</MenuItem>
      </Select>
    </FormControl>
    <Autocomplete
      multiple
      options={Array.from(new Set(reports.flatMap(report => report.tags)))}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Filter By Tags"
          placeholder="Select tags"
        />
      )}
      value={filterTags}
      onChange={(_, newValue) => setFilterTags(newValue)}
      fullWidth={isMobile}
    />
  </Box>
);

const SearchBox = ({ searchTerm, setSearchTerm, startDate, setStartDate, endDate, setEndDate, isMobile }) => (
  <Box display="flex" flexDirection={isMobile ? "column" : "row"} alignItems="stretch" gap={2}>
    <TextField
      variant="outlined"
      placeholder="Search Reports"
      fullWidth={isMobile}
      InputProps={{
        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
      }}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <TextField
      type="date"
      label="Start Date"
      InputLabelProps={{ shrink: true }}
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      fullWidth={isMobile}
    />
    <TextField
      type="date"
      label="End Date"
      InputLabelProps={{ shrink: true }}
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      fullWidth={isMobile}
    />
  </Box>
);

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [startDate, setStartDate] = useState(formatDate(subMonths(new Date(), 12)));
  const [endDate, setEndDate] = useState(formatDate(new Date()));

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const generateRandomData = useCallback((length = 7) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 100) + 1);
  }, []);

  const refreshReport = useCallback((event, report) => {
    event.stopPropagation();
    const updatedReport = { ...report, data: { ...report.data, values: generateRandomData() }};
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    setSnackbarOpen(true);
  }, [generateRandomData]);

  const [reports, setReports] = useState(() => [
    { id: 1, title: "Monthly Profit Report", description: "Monthly profit overview.", type: "Financial", data: { label: 'Profit', values: generateRandomData() }, chartType: "line", tags: ["finance", "monthly", "profit"] },
    { id: 2, title: "Quarterly Profit Report", description: "Quarterly profit summary.", type: "Financial", data: { label: 'Profit', values: generateRandomData() }, chartType: "bar", tags: ["finance", "quarterly", "profit"] },
    { id: 3, title: "Yearly Profit Report", description: "Annual profit analysis.", type: "Financial", data: { label: 'Profit', values: generateRandomData() }, chartType: "line", tags: ["finance", "yearly", "profit"] },
    { id: 4, title: "Revenue Report", description: "Comprehensive revenue breakdown.", type: "Financial", data: { label: 'Revenue', values: generateRandomData() }, chartType: "bar", tags: ["finance", "revenue"] },
    { id: 5, title: "Expenses Report", description: "Detailed expense analysis.", type: "Financial", data: { label: 'Expenses', values: generateRandomData() }, chartType: "bar", tags: ["finance", "expenses"] },
    { id: 6, title: "Maintenance Trends", description: "Analysis of maintenance patterns.", type: "Quantitative", data: { label: 'Maintenance', values: generateRandomData() }, chartType: "line", tags: ["maintenance", "trends"] },
  ]);

  const filteredReports = useMemo(() => reports
    .filter((report) => report.title.toLowerCase().includes(searchTerm.toLowerCase()) || report.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((report) => !filterType || report.type === filterType)
    .filter((report) => filterTags.length === 0 || filterTags.every((tag) => report.tags.includes(tag))), [searchTerm, filterType, filterTags, reports]);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [currentPage, filteredReports]);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const exportReport = useCallback((report) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(report.title, 20, 20);
    doc.setFontSize(12);
    doc.text(report.description, 20, 30);
    doc.text(`Type: ${report.type}`, 20, 40);
    doc.text(`Tags: ${report.tags.join(", ")}`, 20, 50);
    doc.text("Chart image would be inserted here", 20, 70);
    doc.save(`${report.title}.pdf`);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedReport(null);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterTags, startDate, endDate]);

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Reports Dashboard</Typography>

      <Box mb={3} display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "stretch" : "center"} gap={2}>
        <FilterBox
          filterType={filterType}
          setFilterType={setFilterType}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
          reports={reports}
          isMobile={isMobile}
        />
        <SearchBox
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          isMobile={isMobile}
        />
      </Box>

      <Grid container spacing={3}>
        {paginatedReports.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <ReportCard onClick={() => setSelectedReport(report)}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" noWrap>{report.title}</Typography>
                <IconButton onClick={(e) => refreshReport(e, report)} size="small">
                  <RefreshIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="textSecondary" mb={2}>{report.description}</Typography>
              <Box mb={2}>
                {report.tags.map((tag) => (
                  <StyledChip key={tag} label={tag} size="small" />
                ))}
              </Box>
              <ReportChart
                type={report.chartType}
                data={report.data}
                options={{}}
              />
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

      {selectedReport && (
        <Dialog open={!!selectedReport} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedReport.title}</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>Details</Typography>
            <Typography variant="body1" paragraph>{selectedReport.description}</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>Type: {selectedReport.type}</Typography>
            <Box mb={2}>
              {selectedReport.tags.map((tag) => (
                <StyledChip key={tag} label={tag} />
              ))}
            </Box>
            <ReportChart
              type={selectedReport.chartType}
              data={selectedReport.data}
              options={{}}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Close</Button>
            <Button onClick={() => exportReport(selectedReport)} color="primary" startIcon={<ExportIcon />}>
              Export Report
            </Button>
            <Button onClick={(e) => refreshReport(e, selectedReport)} color="primary" startIcon={<RefreshIcon />}>
              Refresh Data
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Report data refreshed successfully!
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Reports;