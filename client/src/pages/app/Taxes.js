import styles from './Taxes.module.css';
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
import './Taxes.css';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const TAX_TYPES = ['Property Tax', 'Income Tax', 'Sales Tax', 'Transfer Tax', 'Capital Gains Tax'];
const TAX_CATEGORIES = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed-Use'];

const initialTaxState = {
  name: '',
  rate: '',
  type: 'Property Tax',
  status: 'active',
  category: 'Residential',
  effectiveDate: '',
  expirationDate: '',
  description: ''
};

const Taxes = () => {
  const [tax, setTax] = useState(initialTaxState);
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 });
  const [openDialogs, setOpenDialogs] = useState({
    addEdit: false,
    delete: false,
    import: false,
    calculator: false,
    details: false,
    importHelp: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingId, setEditingId] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [calculatorInput, setCalculatorInput] = useState({ propertyValue: '', taxId: '' });
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedTaxDetails, setSelectedTaxDetails] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  const { data: taxes, isLoading, isError, error } = useQuery('taxes', taxApi.getTaxes);

  // Mutations
  const addTaxMutation = useMutation(taxApi.addTax, {
    onSuccess: () => handleMutationSuccess('Tax added successfully!', 'addEdit'),
    onError: (error) => handleMutationError('Failed to add tax:', error)
  });

  const updateTaxMutation = useMutation(taxApi.updateTax, {
    onSuccess: () => handleMutationSuccess('Tax updated successfully!', 'addEdit'),
    onError: (error) => handleMutationError('Failed to update tax:', error)
  });

  const deleteTaxMutation = useMutation(taxApi.deleteTax, {
    onSuccess: () => handleMutationSuccess('Tax deleted successfully!', 'delete'),
    onError: (error) => handleMutationError('Failed to delete tax:', error)
  });

  const importTaxesMutation = useMutation(taxApi.importTaxes, {
    onSuccess: () => {
      handleMutationSuccess('Taxes imported successfully!', 'import');
      setImportFile(null);
    },
    onError: (error) => handleMutationError('Failed to import taxes:', error)
  });

  // Helper functions
  const handleMutationSuccess = (message, dialogKey) => {
    queryClient.invalidateQueries('taxes');
    showSnackbar(message, 'success');
    setOpenDialogs(prev => ({ ...prev, [dialogKey]: false }));
    if (dialogKey === 'addEdit') resetTaxForm();
  };

  const handleMutationError = (prefix, error) => {
    showSnackbar(`${prefix} ${error.message}`, 'error');
  };

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
    if (editingId) deleteTaxMutation.mutate(editingId);
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
    setOpenDialogs(prev => ({ ...prev, calculator: true }));
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
    setTax(initialTaxState);
    setEditingId(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Memoized values and functions
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
    return TAX_TYPES
      .map(type => ({
        name: type,
        value: taxes.filter(t => t.type === type && t.status === 'active').length
      }))
      .filter(item => item.value > 0);
  }, [taxes]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MM/dd/yyyy');
  }, []);

  const isExpiringSoon = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    return isAfter(expDate, today) && isAfter(expDate, subDays(today, 30));
  }, []);

  // Render functions (components moved to separate files for better organization)
  const renderMobileView = () => (
    <div className={styles.mobileView}>
      {paginatedTaxes.map((tax) => (
        <Card key={tax.id} className={styles.mobileCard}>
          <CardContent>
            <Typography variant="subtitle1">{tax.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {`${tax.type} | ${tax.rate}% | ${tax.status}`}
            </Typography>
            <Typography variant="body2">
              Effective: {formatDate(tax.effectiveDate)}
            </Typography>
            {isExpiringSoon(tax.expirationDate) && (
              <Alert severity="warning" icon={<WarningIcon />} className={styles.expirationAlert}>
                Expiring on {formatDate(tax.expirationDate)}
              </Alert>
            )}
            <div className={styles.actionButtons}>
              <IconButton size="small" onClick={() => { setTax(tax); setEditingId(tax.id); setOpenDialogs(prev => ({ ...prev, addEdit: true })) }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => { setEditingId(tax.id); setOpenDialogs(prev => ({ ...prev, delete: true })) }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleArchiveTax(tax.id, tax.status)}>
                {tax.status === 'active' ? <ArchiveIcon fontSize="small" /> : <UnarchiveIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={() => { setSelectedTaxDetails(tax); setOpenDialogs(prev => ({ ...prev, details: true })) }}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Main render
  if (isLoading) return <LinearProgress />;
  if (isError) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box className={styles.taxesContainer}>
      <Typography variant="h4" gutterBottom>Tax Management</Typography>
      
      {/* Main content grid */}
      <Grid container spacing={3}>
        {/* Left column - Tax list */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Header actions */}
              <div className={styles.headerActions}>
                <Typography variant="h6">Manage Taxes</Typography>
                <div className={styles.headerButtons}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { resetTaxForm(); setOpenDialogs(prev => ({ ...prev, addEdit: true })) }}
                    size="small"
                    className={styles.addButton}
                  >
                    Add New Tax
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setOpenDialogs(prev => ({ ...prev, import: true }))}
                    size="small"
                  >
                    Import
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className={styles.filtersContainer}>
                <TextField
                  label="Search Taxes"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  variant="outlined"
                  size="small"
                  className={styles.searchField}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" fontSize="small" />
                  }}
                />
                <div className={styles.filterSelects}>
                  <FormControl variant="outlined" size="small" className={styles.filterSelect}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl variant="outlined" size="small" className={styles.filterSelect}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      label="Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      {TAX_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* Tax list */}
              {isMobile ? renderMobileView() : (
                <TableContainer component={Paper} className={styles.tableContainer}>
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
                            <Chip
                              label={tax.status}
                              color={tax.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(tax.effectiveDate)}</TableCell>
                          <TableCell className={styles.actionCell}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setTax(tax);
                                  setEditingId(tax.id);
                                  setOpenDialogs(prev => ({ ...prev, addEdit: true }));
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton></Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingId(tax.id);
                                    setOpenDialogs(prev => ({ ...prev, delete: true }));
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={tax.status === 'active' ? 'Archive' : 'Activate'}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleArchiveTax(tax.id, tax.status)}
                                >
                                  {tax.status === 'active' ? <ArchiveIcon fontSize="small" /> : <UnarchiveIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedTaxDetails(tax);
                                    setOpenDialogs(prev => ({ ...prev, details: true }));
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
  
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredTaxes.length}
                  rowsPerPage={pagination.rowsPerPage}
                  page={pagination.page}
                  onPageChange={(_, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                  onRowsPerPageChange={(e) => setPagination({ page: 0, rowsPerPage: parseInt(e.target.value, 10) })}
                />
              </CardContent>
            </Card>
          </Grid>
  
          {/* Right column - Calculator and Chart */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">Tax Calculator</Typography>
                <TextField
                  label="Property Value"
                  type="number"
                  value={calculatorInput.propertyValue}
                  onChange={(e) => setCalculatorInput(prev => ({ ...prev, propertyValue: e.target.value }))}
                  fullWidth
                  margin="normal"
                  size="small"
                />
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Select Tax</InputLabel>
                  <Select
                    value={calculatorInput.taxId}
                    onChange={(e) => setCalculatorInput(prev => ({ ...prev, taxId: e.target.value }))}
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
                  className={styles.calculatorButton}
                  size="small"
                >
                  Calculate Tax
                </Button>
  
                <div className={styles.chartContainer}>
                  <Typography variant="h6" gutterBottom align="center">Tax Distribution</Typography>
                  {taxDistributionData.length > 0 ? (
                    <div className={styles.pieChart}>
                      <Pie
                        data={{
                          labels: taxDistributionData.map(item => item.name),
                          datasets: [{
                            data: taxDistributionData.map(item => item.value),
                            backgroundColor: COLORS,
                            borderColor: COLORS.map(color => `${color}88`),
                            borderWidth: 1,
                          }],
                        }}
                        options={{
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
                        }}
                      />
                    </div>
                  ) : (
                    <Typography variant="body2" color="textSecondary" align="center">
                      No active taxes to display.
                    </Typography>
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
  
        {/* Dialogs */}
        {/* Add/Edit Tax Dialog */}
        <Dialog open={openDialogs.addEdit} onClose={() => setOpenDialogs(prev => ({ ...prev, addEdit: false }))}>
          <DialogTitle>{editingId ? 'Edit Tax' : 'Add New Tax'}</DialogTitle>
          <DialogContent>
            <TextField
              label="Tax Name"
              value={tax.name}
              onChange={(e) => setTax(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              margin="normal"
              size="small"
            />
            <TextField
              label="Tax Rate (%)"
              type="number"
              value={tax.rate}
              onChange={(e) => setTax(prev => ({ ...prev, rate: e.target.value }))}
              fullWidth
              margin="normal"
              size="small"
            />
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Tax Type</InputLabel>
              <Select
                value={tax.type}
                onChange={(e) => setTax(prev => ({ ...prev, type: e.target.value }))}
                label="Tax Type"
              >
                {TAX_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={tax.category}
                onChange={(e) => setTax(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                {TAX_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Effective Date"
              type="date"
              value={tax.effectiveDate}
              onChange={(e) => setTax(prev => ({ ...prev, effectiveDate: e.target.value }))}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Expiration Date"
              type="date"
              value={tax.expirationDate}
              onChange={(e) => setTax(prev => ({ ...prev, expirationDate: e.target.value }))}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Description"
              value={tax.description}
              onChange={(e) => setTax(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              size="small"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogs(prev => ({ ...prev, addEdit: false }))}>Cancel</Button>
            <Button onClick={handleAddEditTax} variant="contained">
              {editingId ? 'Update' : 'Add'} Tax
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Delete Confirmation Dialog */}
        <Dialog open={openDialogs.delete} onClose={() => setOpenDialogs(prev => ({ ...prev, delete: false }))}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this tax? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogs(prev => ({ ...prev, delete: false }))}>Cancel</Button>
            <Button onClick={handleDeleteTax} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
  
        {/* Import Dialog */}
        <Dialog open={openDialogs.import} onClose={() => setOpenDialogs(prev => ({ ...prev, import: false }))}>
          <DialogTitle>Import Taxes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Upload a JSON file containing tax data to import. The file should contain an array of tax objects.
            </DialogContentText>
            <Button onClick={() => setOpenDialogs(prev => ({ ...prev, importHelp: true }))} className={styles.helpButton}>
              View Import Format
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files[0])}
              className={styles.fileInput}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogs(prev => ({ ...prev, import: false }))}>Cancel</Button>
            <Button onClick={handleImportTaxes} variant="contained">Import</Button>
          </DialogActions>
        </Dialog>
  
        {/* Import Help Dialog */}
        <Dialog open={openDialogs.importHelp} onClose={() => setOpenDialogs(prev => ({ ...prev, importHelp: false }))}>
          <DialogTitle>Tax Import Format</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The JSON file should contain an array of tax objects with the following structure:
            </DialogContentText>
            <pre className={styles.jsonExample}>
              {JSON.stringify([{
                name: "Example Tax",
                rate: 5.5,
                type: "Property Tax",
                category: "Residential",
                status: "active",
                effectiveDate: "2023-01-01",
                expirationDate: "2023-12-31",
                description: "Example description"
              }], null, 2)}
            </pre>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogs(prev => ({ ...prev, importHelp: false }))}>Close</Button>
          </DialogActions>
        </Dialog>
  
        {/* Tax Details Dialog */}
        <Dialog open={openDialogs.details} onClose={() => setOpenDialogs(prev => ({ ...prev, details: false }))}>
          <DialogTitle>Tax Details</DialogTitle>
          <DialogContent>
            {selectedTaxDetails && (
              <div className={styles.taxDetails}>
                <Typography><strong>Name:</strong> {selectedTaxDetails.name}</Typography>
                <Typography><strong>Type:</strong> {selectedTaxDetails.type}</Typography>
                <Typography><strong>Category:</strong> {selectedTaxDetails.category}</Typography>
                <Typography><strong>Rate:</strong> {selectedTaxDetails.rate}%</Typography>
                <Typography><strong>Status:</strong> {selectedTaxDetails.status}</Typography>
                <Typography><strong>Effective Date:</strong> {formatDate(selectedTaxDetails.effectiveDate)}</Typography>
                <Typography><strong>Expiration Date:</strong> {formatDate(selectedTaxDetails.expirationDate)}</Typography>
                <Typography><strong>Description:</strong> {selectedTaxDetails.description}</Typography>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogs(prev => ({ ...prev, details: false }))}>Close</Button>
          </DialogActions>
        </Dialog>
  
        {/* Tax Calculation Result Dialog */}
        <Dialog open={openDialogs.calculator} onClose={() => setOpenDialogs(prev => ({ ...prev, calculator: false }))}>
          <DialogTitle>Tax Calculation Result</DialogTitle>
          <DialogContent>
            {calculationResult && (
              <div className={styles.calculationResult}>
                <Typography><strong>Tax Name:</strong> {calculationResult.taxName}</Typography>
                <Typography><strong>Property Value:</strong> ${calculationResult.propertyValue}</Typography>
                <Typography><strong>Tax Rate:</strong> {calculationResult.taxRate}%</Typography>
                <Typography><strong>Tax Amount:</strong> ${calculationResult.taxAmount}</Typography>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogs(prev => ({ ...prev, calculator: false }))}>Close</Button>
          </DialogActions>
        </Dialog>
  
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            className={styles.snackbarAlert}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  };
  
  export default Taxes;