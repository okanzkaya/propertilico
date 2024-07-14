import React, { useState } from 'react';
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
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { styled } from '@mui/system';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Chart from 'react-apexcharts';
import jsPDF from 'jspdf';

const PageWrapper = styled(Box)({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});

const ReportCard = styled(Card)({
  padding: '1rem',
  marginBottom: '1rem',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-5px)',
  },
});

const reports = [
  {
    id: 1,
    title: 'Monthly Financial Report',
    description: 'Detailed financial overview of the month.',
    type: 'Financial',
    data: [45, 52, 38, 45, 19, 23, 2],
    chartType: 'line',
  },
  {
    id: 2,
    title: 'Quarterly Expense Report',
    description: 'Breakdown of expenses for the last quarter.',
    type: 'Financial',
    data: [35, 41, 36, 26, 45, 48, 52],
    chartType: 'bar',
  },
  {
    id: 3,
    title: 'Yearly Revenue Report',
    description: 'Annual revenue summary.',
    type: 'Financial',
    data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
    chartType: 'area',
  },
  {
    id: 4,
    title: 'Maintenance Report',
    description: 'Overview of all maintenance activities.',
    type: 'Quantitative',
    data: [3, 4, 3, 5, 4, 5, 6],
    chartType: 'bar',
  },
  {
    id: 5,
    title: 'Property Occupancy Report',
    description: 'Occupancy rates over the last year.',
    type: 'Quantitative',
    data: [87, 89, 85, 90, 92, 94, 95],
    chartType: 'line',
  },
  {
    id: 6,
    title: 'Tenant Satisfaction Report',
    description: 'Feedback and satisfaction rates from tenants.',
    type: 'Qualitative',
    data: [4.5, 4.0, 4.2, 4.6, 4.7, 4.8, 5.0],
    chartType: 'radar',
  },
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [addReportOpen, setAddReportOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleReportClick = (report) => setSelectedReport(report);
  const handleClose = () => {
    setSelectedReport(null);
    setAddReportOpen(false);
  };
  const handleAddReportOpen = () => setAddReportOpen(true);

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) || report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const commonChartOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
  };

  const downloadReport = (report) => {
    const doc = new jsPDF();
    doc.text(report.title, 10, 10);
    doc.text(report.description, 10, 20);
    doc.save(`${report.title}.pdf`);
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="contained" color="primary" onClick={handleAddReportOpen} startIcon={<AddCircleIcon />}>
          Create New Report
        </Button>
      </Box>
      <TextField
        variant="outlined"
        placeholder="Search Reports"
        fullWidth
        InputProps={{ startAdornment: <InfoIcon position="start" /> }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Grid container spacing={3} mt={2}>
        {filteredReports.map((report) => (
          <Grid item xs={12} md={6} key={report.id}>
            <ReportCard onClick={() => handleReportClick(report)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{report.title}</Typography>
                <Box>
                  <Tooltip title="Download Report">
                    <IconButton onClick={(e) => { e.stopPropagation(); downloadReport(report); }}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">{report.description}</Typography>
              <Chart
                options={commonChartOptions}
                series={[{ name: report.type, data: report.data }]}
                type={report.chartType}
                height={200}
              />
            </ReportCard>
          </Grid>
        ))}
      </Grid>

      {selectedReport && (
        <Dialog open={!!selectedReport} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedReport.title}</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>Details</Typography>
            <Typography variant="body1">{selectedReport.description}</Typography>
            <Chart
              options={commonChartOptions}
              series={[{ name: selectedReport.type, data: selectedReport.data }]}
              type={selectedReport.chartType}
              height={300}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Close</Button>
            <Button onClick={() => downloadReport(selectedReport)} color="primary" startIcon={<DownloadIcon />}>
              Download Report
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={addReportOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create New Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Report Title"
            fullWidth
            variant="outlined"
            InputProps={{ endAdornment: <Tooltip title="Enter the report title" placement="top"><InfoIcon /></Tooltip> }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            InputProps={{ endAdornment: <Tooltip title="Enter a brief description of the report" placement="top"><InfoIcon /></Tooltip> }}
          />
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Report Type</InputLabel>
            <Select value={reportType} onChange={(e) => setReportType(e.target.value)} label="Report Type">
              <MenuItem value="Financial">Financial</MenuItem>
              <MenuItem value="Quantitative">Quantitative</MenuItem>
              <MenuItem value="Qualitative">Qualitative</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Data"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            InputProps={{ endAdornment: <Tooltip title="Enter the data for the report" placement="top"><InfoIcon /></Tooltip> }}
          />
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Chart Type</InputLabel>
            <Select label="Chart Type">
              <MenuItem value="line">Line</MenuItem>
              <MenuItem value="bar">Bar</MenuItem>
              <MenuItem value="area">Area</MenuItem>
              <MenuItem value="radar">Radar</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleClose} color="primary">Create Report</Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

export default Reports;
