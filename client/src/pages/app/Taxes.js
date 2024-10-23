import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography, Grid, Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel,
  Select, MenuItem, IconButton, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Snackbar, TablePagination, Chip, Tooltip,
  LinearProgress, Card, CardContent, Alert, useMediaQuery, useTheme
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon,
  Archive as ArchiveIcon, Unarchive as UnarchiveIcon, Calculate as CalculateIcon,
  Add as AddIcon, Search as SearchIcon, CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon, Warning as WarningIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { taxApi } from '../../api';
import { format, isAfter, subDays } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Taxes = () => {
  const [tax, setTax] = useState({
    name: '', rate: '', type: 'Property Tax', status: 'active', category: 'Residential',
    effectiveDate: '', expirationDate: '', description: ''
  });
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 });
  const [openDialogs, setOpenDialogs] = useState({ addEdit: false, delete: false, import: false, calculator: false, details: false, importHelp: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingId, setEditingId] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [calculatorInput, setCalculatorInput] = useState({ propertyValue: '', taxId: '' });
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedTaxDetails, setSelectedTaxDetails] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  const taxTypes = useMemo(() => ['Property Tax', 'Income Tax', 'Sales Tax', 'Transfer Tax', 'Capital Gains Tax'], []);
  const taxCategories = useMemo(() => ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed-Use'], []);

  const { data: taxes, isLoading, isError, error } = useQuery('taxes', taxApi.getTaxes);

  const addTaxMutation = useMutation(taxApi.addTax, {
    onSuccess: () => {
      queryClient.invalidateQueries('taxes');
      showSnackbar('Tax added successfully!', 'success');
      setOpenDialogs({ ...openDialogs, addEdit: false });
      resetTaxForm();
    },
    onError: (error) => {
      showSnackbar(`Failed to add tax: ${error.message}`, 'error');
    }
  });

  const updateTaxMutation = useMutation(taxApi.updateTax, {
    onSuccess: () => {
      queryClient.invalidateQueries('taxes');
      showSnackbar('Tax updated successfully!', 'success');
      setOpenDialogs({ ...openDialogs, addEdit: false });
      resetTaxForm();
    },
    onError: (error) => {
      showSnackbar(`Failed to update tax: ${error.message}`, 'error');
    }
  });

  const deleteTaxMutation = useMutation(taxApi.deleteTax, {
    onSuccess: () => {
      queryClient.invalidateQueries('taxes');
      showSnackbar('Tax deleted successfully!', 'success');
      setOpenDialogs({ ...openDialogs, delete: false });
    },
    onError: (error) => {
      showSnackbar(`Failed to delete tax: ${error.message}`, 'error');
    }
  });

  const importTaxesMutation = useMutation(taxApi.importTaxes, {
    onSuccess: () => {
      queryClient.invalidateQueries('taxes');
      showSnackbar('Taxes imported successfully!', 'success');
      setOpenDialogs({ ...openDialogs, import: false });
      setImportFile(null);
    },
    onError: (error) => {
      showSnackbar(`Failed to import taxes: ${error.message}`, 'error');
    }
  });

  const handleAddEditTax = () => {
    if (!tax.name || !tax.rate) {
      showSnackbar('Please fill in all required fields.', 'error');
      return;
    }

    if (editingId) {
      updateTaxMutation.mutate({ id: editingId, ...tax });
    } else {
      addTaxMutation.mutate(tax);
    }
  };

  const handleDeleteTax = () => {
    if (editingId) {
      deleteTaxMutation.mutate(editingId);
    }
  };

  const handleArchiveTax = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateTaxMutation.mutate({ id, status: newStatus });
  };

  const handleCalculateTax = () => {
    if (!calculatorInput.propertyValue || !calculatorInput.taxId) {
      showSnackbar('Please enter a property value and select a tax to calculate.', 'error');
      return;
    }

    const selectedTax = taxes.find(t => t.id === calculatorInput.taxId);
    if (!selectedTax) {
      showSnackbar('Invalid tax selection.', 'error');
      return;
    }

    const taxAmount = (parseFloat(calculatorInput.propertyValue) * selectedTax.rate) / 100;
    setCalculationResult({
      taxName: selectedTax.name,
      propertyValue: parseFloat(calculatorInput.propertyValue).toFixed(2),
      taxRate: selectedTax.rate,
      taxAmount: taxAmount.toFixed(2)
    });
    setOpenDialogs({ ...openDialogs, calculator: true });
  };

  const handleImportTaxes = () => {
    if (!importFile) {
      showSnackbar('Please select a file to import.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);
    importTaxesMutation.mutate(formData);
  };

  const resetTaxForm = () => {
    setTax({
      name: '', rate: '', type: 'Property Tax', status: 'active', category: 'Residential',
      effectiveDate: '', expirationDate: '', description: ''
    });
    setEditingId(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredTaxes = useMemo(() => {
    if (!taxes) return [];
    return taxes.filter((t) => {
      const matchesStatus = filters.status ? t.status === filters.status : true;
      const matchesType = filters.type ? t.type === filters.type : true;
      const matchesSearch = t.name.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [taxes, filters]);

  const paginatedTaxes = useMemo(() => {
    const { page, rowsPerPage } = pagination;
    return filteredTaxes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTaxes, pagination]);

  const taxDistributionData = useMemo(() => {
    if (!taxes) return [];
    return taxTypes
      .map(type => ({
        name: type,
        value: taxes.filter(t => t.type === type && t.status === 'active').length
      }))
      .filter(item => item.value > 0);
  }, [taxes, taxTypes]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MM/dd/yyyy');
  };

  const isExpiringSoon = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    return isAfter(expDate, today) && isAfter(expDate, subDays(today, 30));
  }, []);

  const renderMobileView = () => (
    <Box>
      {paginatedTaxes.map((tax) => (
        <Card key={tax.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">{tax.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {`${tax.type} | ${tax.rate}% | ${tax.status}`}
            </Typography>
            <Typography variant="body2">
              Effective: {formatDate(tax.effectiveDate)}
            </Typography>
            {isExpiringSoon(tax.expirationDate) && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 1 }}>
                Expiring on {formatDate(tax.expirationDate)}
              </Alert>
            )}
            <Box mt={1}>
              <IconButton size="small" onClick={() => { setTax(tax); setEditingId(tax.id); setOpenDialogs({ ...openDialogs, addEdit: true }) }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => { setEditingId(tax.id); setOpenDialogs({ ...openDialogs, delete: true }) }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleArchiveTax(tax.id, tax.status)}>
                {tax.status === 'active' ? <ArchiveIcon fontSize="small" /> : <UnarchiveIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={() => { setSelectedTaxDetails(tax); setOpenDialogs({ ...openDialogs, details: true }) }}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Effective Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTaxes.map((tax) => (
            <TableRow key={tax.id}>
              <TableCell>{tax.name}</TableCell>
              <TableCell>{tax.type}</TableCell>
              <TableCell>{tax.rate}%</TableCell>
              <TableCell>
                <Chip label={tax.status} color={tax.status === 'active' ? 'success' : 'default'} size="small" />
              </TableCell>
              <TableCell>{formatDate(tax.effectiveDate)}</TableCell>
              <TableCell>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => { setTax(tax); setEditingId(tax.id); setOpenDialogs({ ...openDialogs, addEdit: true }) }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => { setEditingId(tax.id); setOpenDialogs({ ...openDialogs, delete: true }) }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={tax.status === 'active' ? 'Archive' : 'Activate'}>
                  <IconButton size="small" onClick={() => handleArchiveTax(tax.id, tax.status)}>
                    {tax.status === 'active' ? <ArchiveIcon fontSize="small" /> : <UnarchiveIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Details">
                  <IconButton size="small" onClick={() => { setSelectedTaxDetails(tax); setOpenDialogs({ ...openDialogs, details: true }) }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderChart = () => {
    const chartData = {
      labels: taxDistributionData.map(item => item.name),
      datasets: [
        {
          data: taxDistributionData.map(item => item.value),
          backgroundColor: COLORS,
          borderColor: COLORS.map(color => `${color}88`),
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    };

    return (
      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6" gutterBottom align="center">Tax Distribution</Typography>
        {taxDistributionData.length > 0 ? (
          <Box height={200} width="100%">
            <Pie data={chartData} options={options} />
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" align="center">
            No active taxes to display.
          </Typography>
        )}
      </Box>
    );
  };

  if (isLoading) return <LinearProgress />;
  if (isError) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Tax Management</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Manage Taxes</Typography>
                <Box>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetTaxForm(); setOpenDialogs({ ...openDialogs, addEdit: true }) }} size="small" sx={{ mr: 1 }}>
                    Add New Tax
                  </Button>
                  <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setOpenDialogs({ ...openDialogs, import: true })} size="small">
                    Import
                  </Button>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <TextField
                  label="Search Taxes"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ width: '30%' }}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" fontSize="small" />
                  }}
                />
                <Box>
                  <FormControl variant="outlined" size="small" sx={{ mr: 1, minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      label="Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      {taxTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {isMobile ? renderMobileView() : renderDesktopView()}

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredTaxes.length}
                rowsPerPage={pagination.rowsPerPage}
                page={pagination.page}
                onPageChange={(_, newPage) => setPagination({ ...pagination, page: newPage })}
                onRowsPerPageChange={(e) => setPagination({ page: 0, rowsPerPage: parseInt(e.target.value, 10) })}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom align="center">Tax Calculator</Typography>
              <TextField
                label="Property Value"
                type="number"
                value={calculatorInput.propertyValue}
                onChange={(e) => setCalculatorInput({ ...calculatorInput, propertyValue: e.target.value })}
                fullWidth
                margin="normal"
                size="small"
              />
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Select Tax</InputLabel>
                <Select
                  value={calculatorInput.taxId}
                  onChange={(e) => setCalculatorInput({ ...calculatorInput, taxId: e.target.value })}
                  label="Select Tax"
                >
                  {taxes.filter(t => t.status === 'active').map((tax) => (
                    <MenuItem key={tax.id} value={tax.id}>{tax.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={handleCalculateTax}
                fullWidth
                sx={{ mt: 2 }}
                size="small"
              >
                Calculate Tax
              </Button>

              {renderChart()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Tax Dialog */}
      <Dialog open={openDialogs.addEdit} onClose={() => setOpenDialogs({ ...openDialogs, addEdit: false })}>
        <DialogTitle>{editingId ? 'Edit Tax' : 'Add New Tax'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Tax Name"
            value={tax.name}
            onChange={(e) => setTax({ ...tax, name: e.target.value })}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label="Tax Rate (%)"
            type="number"
            value={tax.rate}
            onChange={(e) => setTax({ ...tax, rate: e.target.value })}
            fullWidth
            margin="normal"
            size="small"
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Tax Type</InputLabel>
            <Select
              value={tax.type}
              onChange={(e) => setTax({ ...tax, type: e.target.value })}
              label="Tax Type"
            >
              {taxTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={tax.category}
              onChange={(e) => setTax({ ...tax, category: e.target.value })}
              label="Category"
            >
              {taxCategories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Effective Date"
            type="date"
            value={tax.effectiveDate}
            onChange={(e) => setTax({ ...tax, effectiveDate: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Expiration Date"
            type="date"
            value={tax.expirationDate}
            onChange={(e) => setTax({ ...tax, expirationDate: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Description"
            value={tax.description}
            onChange={(e) => setTax({ ...tax, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogs({ ...openDialogs, addEdit: false })}>Cancel</Button>
          <Button onClick={handleAddEditTax} variant="contained">
            {editingId ? 'Update' : 'Add'} Tax
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialogs.delete} onClose={() => setOpenDialogs({ ...openDialogs, delete: false })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this tax? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogs({ ...openDialogs, delete: false })}>Cancel</Button>
          <Button onClick={handleDeleteTax} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={openDialogs.import} onClose={() => setOpenDialogs({ ...openDialogs, import: false })}>
        <DialogTitle>Import Taxes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Upload a JSON file containing tax data to import. The file should contain an array of tax objects.
          </DialogContentText>
          <Button onClick={() => setOpenDialogs({ ...openDialogs, importHelp: true })} sx={{ mt: 1 }}>
            View Import Format
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={(e) => setImportFile(e.target.files[0])}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogs({ ...openDialogs, import: false })}>Cancel</Button>
          <Button onClick={handleImportTaxes} variant="contained">Import</Button>
        </DialogActions>
      </Dialog>

      {/* Import Help Dialog */}
      <Dialog open={openDialogs.importHelp} onClose={() => setOpenDialogs({ ...openDialogs, importHelp: false })}>
        <DialogTitle>Tax Import Format</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The JSON file should contain an array of tax objects with the following structure:
          </DialogContentText>
          <pre>
            {JSON.stringify([
              {
                name: "Example Tax",
                rate: 5.5,
                type: "Property Tax",
                category: "Residential",
                status: "active",
                effectiveDate: "2023-01-01",
                expirationDate: "2023-12-31",
                description: "Example description"
              }
            ], null, 2)}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogs({ ...openDialogs, importHelp: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Tax Details Dialog */}
      <Dialog open={openDialogs.details} onClose={() => setOpenDialogs({ ...openDialogs, details: false })}>
        <DialogTitle>Tax Details</DialogTitle>
        <DialogContent>
          {selectedTaxDetails && (
            <Box>
              <Typography><strong>Name:</strong> {selectedTaxDetails.name}</Typography>
              <Typography><strong>Type:</strong> {selectedTaxDetails.type}</Typography>
              <Typography><strong>Category:</strong> {selectedTaxDetails.category}</Typography>
              <Typography><strong>Rate:</strong> {selectedTaxDetails.rate}%</Typography>
              <Typography><strong>Status:</strong> {selectedTaxDetails.status}</Typography>
              <Typography><strong>Effective Date:</strong> {formatDate(selectedTaxDetails.effectiveDate)}</Typography>
              <Typography><strong>Expiration Date:</strong> {formatDate(selectedTaxDetails.expirationDate)}</Typography>
              <Typography><strong>Description:</strong> {selectedTaxDetails.description}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogs({ ...openDialogs, details: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Tax Calculation Result Dialog */}
      <Dialog open={openDialogs.calculator} onClose={() => setOpenDialogs({ ...openDialogs, calculator: false })}>
        <DialogTitle>Tax Calculation Result</DialogTitle>
        <DialogContent>
          {calculationResult && (
            <Box>
              <Typography><strong>Tax Name:</strong> {calculationResult.taxName}</Typography>
              <Typography><strong>Property Value:</strong> ${calculationResult.propertyValue}</Typography>
              <Typography><strong>Tax Rate:</strong> {calculationResult.taxRate}%</Typography>
              <Typography><strong>Tax Amount:</strong> ${calculationResult.taxAmount}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogs({ ...openDialogs, calculator: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Taxes;