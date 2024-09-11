import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, Grid, Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel,
  Select, MenuItem, IconButton, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Snackbar, TablePagination, Chip, Tooltip,
  LinearProgress, Card, CardContent, Alert, Drawer, List, ListItem, ListItemText,
  useMediaQuery, useTheme, Fab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Delete as DeleteIcon, Edit as EditIcon, FileCopy as FileCopyIcon,
  Archive as ArchiveIcon, Unarchive as UnarchiveIcon, Calculate as CalculateIcon,
  Add as AddIcon, Search as SearchIcon, CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon, FilterList as FilterListIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.drawer + 2,
}));

const Taxes = () => {
  const [taxes, setTaxes] = useState([]);
  const [tax, setTax] = useState({
    name: '', rate: '', type: 'Property Tax', status: 'active', category: 'Residential',
    thresholds: [], applicableProperties: [], effectiveDate: '', expirationDate: '', description: '',
  });
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 });
  const [calculatorInput, setCalculatorInput] = useState({ amount: '', property: '', currency: 'USD' });
  const [calculatedTax, setCalculatedTax] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialogs, setOpenDialogs] = useState({ addEdit: false, delete: false, import: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [importFile, setImportFile] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const taxTypes = useMemo(() => [
    'Property Tax', 'Income Tax', 'Sales Tax', 'Corporate Tax', 'Custom Tax',
  ], []);
  const taxCategories = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Luxury', 'Mixed-Use'];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  const properties = [
    { id: 1, name: 'Sunset Apartments' },
    { id: 2, name: 'Downtown Office Complex' },
    { id: 3, name: 'Greenview Residential Park' },
  ];

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = () => {
    setLoading(true);
    setTimeout(() => {
      const mockTaxes = [
        { 
          id: 1, name: 'Standard Property Tax', rate: '1.5', type: 'Property Tax', status: 'active', 
          category: 'Residential', effectiveDate: '2024-01-01', expirationDate: '2024-12-31', 
          description: 'Standard tax rate for residential properties', applicableProperties: [1, 3] 
        },
        { 
          id: 2, name: 'Commercial Property Tax', rate: '2.0', type: 'Property Tax', status: 'active', 
          category: 'Commercial', effectiveDate: '2024-01-01', expirationDate: '2024-12-31', 
          description: 'Tax rate for commercial properties', applicableProperties: [2] 
        },
        { 
          id: 3, name: 'Luxury Property Tax', rate: '3.0', type: 'Property Tax', status: 'inactive', 
          category: 'Luxury', effectiveDate: '2024-06-01', expirationDate: '2024-12-31', 
          description: 'Higher tax rate for luxury properties', applicableProperties: [] 
        },
      ];
      setTaxes(mockTaxes);
      setLoading(false);
    }, 1000);
  };

  const handleAddEditTax = () => {
    if (!tax.name || !tax.rate) {
      showSnackbar('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const updatedTaxes = editingIndex !== null
        ? taxes.map((t, i) => (i === editingIndex ? {...tax, id: t.id} : t))
        : [...taxes, {...tax, id: taxes.length + 1}];
      setTaxes(updatedTaxes);
      resetTaxForm();
      showSnackbar(editingIndex !== null ? 'Tax updated successfully!' : 'Tax added successfully!');
      setOpenDialogs({ ...openDialogs, addEdit: false });
      setLoading(false);
    }, 500);
  };

  const resetTaxForm = () => {
    setTax({
      name: '', rate: '', type: 'Property Tax', status: 'active', category: 'Residential',
      thresholds: [], applicableProperties: [], effectiveDate: '', expirationDate: '', description: '',
    });
    setEditingIndex(null);
  };

  const handleDeleteTax = () => {
    setLoading(true);
    setTimeout(() => {
      setTaxes(taxes.filter((_, i) => i !== editingIndex));
      resetTaxForm();
      setOpenDialogs({ ...openDialogs, delete: false });
      showSnackbar('Tax deleted successfully!');
      setLoading(false);
    }, 500);
  };

  const handleArchiveTax = (index) => {
    setLoading(true);
    setTimeout(() => {
      const updatedTaxes = [...taxes];
      updatedTaxes[index].status = updatedTaxes[index].status === 'active' ? 'inactive' : 'active';
      setTaxes(updatedTaxes);
      showSnackbar(`Tax ${updatedTaxes[index].status === 'active' ? 'activated' : 'archived'} successfully!`);
      setLoading(false);
    }, 500);
  };

  const handleDuplicateTax = (index) => {
    setLoading(true);
    setTimeout(() => {
      const taxToDuplicate = { ...taxes[index], name: `${taxes[index].name} (Copy)`, id: taxes.length + 1 };
      setTaxes([...taxes, taxToDuplicate]);
      showSnackbar('Tax duplicated successfully!');
      setLoading(false);
    }, 500);
  };

  const handleCalculateTax = () => {
    if (!calculatorInput.amount || !calculatorInput.property) {
      showSnackbar('Please enter an amount and select a property to calculate tax.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let totalTax = 0;
      taxes.forEach((t) => {
        if (t.status === 'active' && t.applicableProperties.includes(parseInt(calculatorInput.property))) {
          totalTax += (parseFloat(calculatorInput.amount) * parseFloat(t.rate)) / 100;
        }
      });
      setCalculatedTax(totalTax);
      setLoading(false);
    }, 500);
  };

  const handleImportTaxes = () => {
    if (!importFile) {
      showSnackbar('Please select a file to import.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      showSnackbar('Taxes imported successfully!');
      setOpenDialogs({ ...openDialogs, import: false });
      setImportFile(null);
      setLoading(false);
      fetchTaxes();
    }, 1500);
  };

  const handleExportTaxes = () => {
    setLoading(true);
    setTimeout(() => {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(taxes))}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = 'taxes_export.json';
      link.click();
      showSnackbar('Taxes exported successfully!');
      setLoading(false);
    }, 1000);
  };

  const filteredTaxes = useMemo(() => {
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

  const showSnackbar = (message) => {
    setSnackbar({ open: true, message });
  };

const taxDistributionData = useMemo(() => {
  return taxTypes
    .map(type => ({
      name: type,
      value: taxes.filter(t => t.type === type && t.status === 'active').length
    }))
    .filter(item => item.value > 0); // Only include non-zero values
}, [taxes, taxTypes]);
  const renderMobileView = () => (
    <List>
      {paginatedTaxes.map((tax, index) => (
        <ListItem key={tax.id} divider>
          <ListItemText
            primary={tax.name}
            secondary={`${tax.type} | ${tax.category} | ${tax.rate}% | ${tax.status}`}
          />
          <Box>
            <IconButton onClick={() => {setTax(tax); setEditingIndex(index); setOpenDialogs({ ...openDialogs, addEdit: true })}}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => {setEditingIndex(index); setOpenDialogs({ ...openDialogs, delete: true })}}>
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={() => handleArchiveTax(index)}>
              {tax.status === 'active' ? <ArchiveIcon /> : <UnarchiveIcon />}
            </IconButton>
          </Box>
        </ListItem>
      ))}
    </List>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Effective Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTaxes.map((tax, index) => (
            <TableRow key={tax.id}>
              <TableCell>{tax.name}</TableCell>
              <TableCell>{tax.type}</TableCell>
              <TableCell>{tax.category}</TableCell>
              <TableCell>{tax.rate}%</TableCell>
              <TableCell>
                <Chip label={tax.status} color={tax.status === 'active' ? 'success' : 'default'} />
              </TableCell>
              <TableCell>{tax.effectiveDate}</TableCell>
              <TableCell>
                <Tooltip title="Edit">
                  <IconButton onClick={() => {setTax(tax); setEditingIndex(index); setOpenDialogs({ ...openDialogs, addEdit: true })}}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => {setEditingIndex(index); setOpenDialogs({ ...openDialogs, delete: true })}}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicate">
                  <IconButton onClick={() => handleDuplicateTax(index)}>
                    <FileCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={tax.status === 'active' ? 'Archive' : 'Activate'}>
                  <IconButton onClick={() => handleArchiveTax(index)}>
                    {tax.status === 'active' ? <ArchiveIcon /> : <UnarchiveIcon />}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Tax Management</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom={isMobile}>Manage Taxes</Typography>
                <Box>
                  <StyledButton variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialogs({ ...openDialogs, addEdit: true })}>
                    Add New Tax
                  </StyledButton>
                  <StyledButton variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setOpenDialogs({ ...openDialogs, import: true })}>
                    Import
                  </StyledButton>
                  <StyledButton variant="outlined" startIcon={<CloudDownloadIcon />} onClick={handleExportTaxes}>
                    Export
                  </StyledButton>
                </Box>
              </Box>

              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" mb={2}>
              <StyledTextField
  label="Search Taxes"
  value={filters.search}
  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
  variant="outlined"
  size="small"
  fullWidth={isMobile}
  sx={{ mb: isMobile ? 2 : 0, width: isMobile ? '100%' : '40%' }}
  InputProps={{
    startAdornment: <SearchIcon color="action" />
  }}
/>
                <Box display="flex" justifyContent={isMobile ? 'space-between' : 'flex-end'} width={isMobile ? '100%' : 'auto'}>
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
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>Tax Calculator & Distribution</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Property</InputLabel>
                <Select
                  value={calculatorInput.property}
                  onChange={(e) => setCalculatorInput({ ...calculatorInput, property: e.target.value })}
                  label="Select Property"
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>{property.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  label="Amount"
                  type="number"
                  value={calculatorInput.amount}
                  onChange={(e) => setCalculatorInput({ ...calculatorInput, amount: e.target.value })}
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <FormControl sx={{ minWidth: 80 }}>
                  <Select
                    value={calculatorInput.currency}
                    onChange={(e) => setCalculatorInput({ ...calculatorInput, currency: e.target.value })}
                  >
                    {currencies.map((curr) => (
                      <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <StyledButton
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={handleCalculateTax}
                fullWidth
              >
                Calculate Tax
              </StyledButton>
              {calculatedTax !== null && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Calculated Tax: {calculatorInput.currency} {calculatedTax.toFixed(2)}
                </Alert>
              )}
              
              <Box mt={4}>
  <Typography variant="subtitle1" gutterBottom>Tax Distribution</Typography>
  {taxDistributionData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={taxDistributionData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {taxDistributionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(value) => [`${value} active taxes`, 'Count']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ) : (
    <Typography variant="body1" color="textSecondary" align="center">
      No active taxes to display.
    </Typography>
  )}
</Box>

            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Add/Edit Tax Dialog */}
      <Dialog open={openDialogs.addEdit} onClose={() => setOpenDialogs({ ...openDialogs, addEdit: false })}>
        <DialogTitle>{editingIndex !== null ? 'Edit Tax' : 'Add New Tax'}</DialogTitle>
        <DialogContent>
          <StyledTextField
            label="Tax Name"
            value={tax.name}
            onChange={(e) => setTax({ ...tax, name: e.target.value })}
            fullWidth
          />
          <StyledTextField
            label="Tax Rate (%)"
            type="number"
            value={tax.rate}
            onChange={(e) => setTax({ ...tax, rate: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
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
          <FormControl fullWidth sx={{ mb: 2 }}>
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
          <StyledTextField
            label="Effective Date"
            type="date"
            value={tax.effectiveDate}
            onChange={(e) => setTax({ ...tax, effectiveDate: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <StyledTextField
            label="Expiration Date"
            type="date"
            value={tax.expirationDate}
            onChange={(e) => setTax({ ...tax, expirationDate: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <StyledTextField
            label="Description"
            value={tax.description}
            onChange={(e) => setTax({ ...tax, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Applicable Properties</InputLabel>
            <Select
              multiple
              value={tax.applicableProperties}
              onChange={(e) => setTax({ ...tax, applicableProperties: e.target.value })}
              label="Applicable Properties"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={properties.find(p => p.id === value)?.name} />
                  ))}
                </Box>
              )}
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogs({ ...openDialogs, addEdit: false })}>Cancel</Button>
          <Button onClick={handleAddEditTax} variant="contained">
            {editingIndex !== null ? 'Update' : 'Add'} Tax
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
            Upload a JSON file containing tax data to import.
          </DialogContentText>
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />

      {/* Floating Action Button for mobile */}
      {isMobile && (
        <FloatingActionButton color="primary" aria-label="add" onClick={() => setOpenDialogs({ ...openDialogs, addEdit: true })}>
          <AddIcon />
        </FloatingActionButton>
      )}

      {/* Drawer for mobile filters */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: '80%', maxWidth: 300 },
        }}
      >
        <Box
          sx={{ width: '100%', pt: 8 }} // Add top padding to account for the topbar
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <List>
            <ListItem>
              <FormControl fullWidth>
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
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
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
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Filter button for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="filter"
          onClick={() => setDrawerOpen(true)}
          sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: theme.zIndex.drawer + 1 }}
        >
          <FilterListIcon />
        </Fab>
      )}
    </Box>
  );
};

export default Taxes;