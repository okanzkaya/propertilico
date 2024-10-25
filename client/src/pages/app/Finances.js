import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography, Grid, Box, Button, IconButton, Tabs, Tab, Table,
  TableHead, TableRow, TableCell, TableBody, Menu, MenuItem,
  Fade, useMediaQuery, Chip, CircularProgress, Snackbar, Alert, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon, Delete as DeleteIcon, TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon, AccountBalance as AccountBalanceIcon,
  Home as HomeIcon, Business as BusinessIcon,
  BarChart as BarChartIcon, PieChart as PieChartIcon,
  Timeline as TimelineIcon, AttachMoney as MoneyIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getFinancialSummary } from '../../api';
import './Finances.css';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

// Constants
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292'];
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];
const TRANSACTION_TYPES = {
  income: ['Rent', 'Late Fees', 'Parking', 'Other Income'],
  expense: ['Maintenance', 'Utilities', 'Property Management', 'Insurance', 'Property Tax', 'Mortgage', 'Other Expenses']
};

// Helper Functions
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD' 
}).format(value);

const getChartOptions = (theme) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { color: theme.palette.text.primary },
    },
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      titleColor: theme.palette.text.primary,
      bodyColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: theme.palette.text.primary },
      grid: { color: theme.palette.divider },
    },
    y: {
      ticks: {
        color: theme.palette.text.primary,
        callback: (value) => formatCurrency(value),
      },
      grid: { color: theme.palette.divider },
    },
  },
});

// Chart Component
const ChartComponent = React.memo(({ type, data, keys = [] }) => {
  const theme = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="body1" color="textSecondary">
          No data available
        </Typography>
      </Box>
    );
  }

  const getBarData = (data, keys) => ({
    labels: data.map(item => item.name),
    datasets: (keys && keys.length > 0) ? keys.map((key, index) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      data: data.map(item => item[key]),
      backgroundColor: COLORS[index % COLORS.length],
    })) : [{
      label: 'Value',
      data: data.map(item => item.value),
      backgroundColor: COLORS[0],
    }]
  });

  const getPieData = (data) => ({
    labels: data.map(item => item.id || item.name),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: COLORS,
    }]
  });

  const getLineData = (data) => ({
    labels: data.map(item => item.name),
    datasets: [{
      label: 'Net Profit',
      data: data.map(item => item.netProfit || item.value),
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.main,
      tension: 0.4,
    }]
  });

  const chartData = {
    bar: getBarData(data, keys),
    pie: getPieData(data),
    line: getLineData(data)
  };

  const ChartTypes = { 
    bar: Bar, 
    pie: Pie, 
    line: Line 
  };

  const SelectedChart = ChartTypes[type?.toLowerCase()] || ChartTypes.bar;
  
  return (
    <Box height="100%" width="100%" position="relative">
      <SelectedChart 
        data={chartData[type?.toLowerCase() || 'bar']} 
        options={getChartOptions(theme)} 
      />
    </Box>
  );
});


// Financial Insights Component
const InsightItem = React.memo(({ icon, label, value, theme }) => (
  <Box display="flex" alignItems="center" className="insight-item">
    <Box className="insight-icon" sx={{ mr: 1, color: theme.palette.primary.main }}>{icon}</Box>
    <Typography variant="body1">
      <strong>{label}:</strong> {value}
    </Typography>
  </Box>
));

const FinancialInsights = React.memo(({ financialSummary }) => {
  const theme = useTheme();
  const { 
    totalIncome = 0, 
    totalExpense = 0, 
    occupancyRate = 0, 
    averageRent = 0 
  } = financialSummary || {};

  const netOperatingIncome = totalIncome - totalExpense;
  const capRate = totalIncome > 0 ? ((netOperatingIncome / (totalIncome * 12)) * 100) : 0;

  return (
    <div className="insight-card">
      <Typography variant="h6" gutterBottom className="insight-title">
        Property Financial Insights
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <InsightItem 
          icon={<MoneyIcon />} 
          label="Net Operating Income" 
          value={formatCurrency(netOperatingIncome)}
          theme={theme}
        />
        <InsightItem 
          icon={<TrendingUpIcon />} 
          label="Cap Rate" 
          value={`${capRate.toFixed(2)}%`}
          theme={theme}
        />
        <InsightItem 
          icon={<HomeIcon />} 
          label="Occupancy Rate" 
          value={`${occupancyRate.toFixed(2)}%`}
          theme={theme}
        />
        <InsightItem 
          icon={<BusinessIcon />} 
          label="Average Rent" 
          value={formatCurrency(averageRent)}
          theme={theme}
        />
      </Box>
      <Tooltip title="Performance Indicator">
        <Typography variant="body2" className="insight-summary">
          <SavingsIcon sx={{ 
            mr: 1, 
            color: theme.palette[capRate > 8 ? 'success' : 'warning'].main 
          }} />
          {capRate > 8 
            ? 'Excellent cap rate! Your property is performing well.' 
            : 'Consider strategies to improve your cap rate for better returns.'
          }
        </Typography>
      </Tooltip>
      <Tooltip title="Occupancy Status">
        <Typography variant="body2" className="insight-summary">
          <AccountBalanceIcon sx={{ 
            mr: 1, 
            color: theme.palette[occupancyRate > 90 ? 'success' : 'warning'].main 
          }} />
          {occupancyRate > 90 
            ? 'High occupancy rate indicates strong demand.' 
            : 'There\'s room to improve occupancy. Consider marketing strategies.'
          }
        </Typography>
      </Tooltip>
    </div>
  );
});

// Transaction Modal Component
const TransactionModal = React.memo(({ 
  isOpen, 
  onClose, 
  currentTransaction, 
  handleInputChange, 
  handleTransactionSubmit, 
  isEditing 
}) => {
  const theme = useTheme();
  const today = new Date().toISOString().split('T')[0];

  const renderFormField = (props) => (
    <Grid item xs={12}>
      <FormControl fullWidth margin="normal" sx={{ backgroundColor: theme.palette.background.paper }}>
        {props.type === 'select' ? (
          <>
            <InputLabel>{props.label}</InputLabel>
            <Select
              name={props.name}
              value={props.value}
              onChange={props.onChange}
              label={props.label}
            >
              {props.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </>
        ) : (
          <TextField
            {...props}
            fullWidth
            onChange={props.onChange}
          />
        )}
      </FormControl>
    </Grid>
  );

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { backgroundColor: theme.palette.background.paper }
      }}
    >
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {renderFormField({
            type: 'select',
            name: 'type',
            label: 'Type',
            value: currentTransaction?.type || '',
            onChange: handleInputChange,
            options: [
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' }
            ]
          })}
          {renderFormField({
            type: 'select',
            name: 'category',
            label: 'Category',
            value: currentTransaction?.category || '',
            onChange: handleInputChange,
            options: TRANSACTION_TYPES[currentTransaction?.type || 'expense']
              .map(cat => ({ value: cat, label: cat }))
          })}
          {renderFormField({
            name: 'amount',
            label: 'Amount',
            type: 'number',
            value: currentTransaction?.amount || '',
            onChange: handleInputChange,
            inputProps: { min: 0, step: 0.01 }
          })}
          {renderFormField({
            name: 'description',
            label: 'Description',
            value: currentTransaction?.description || '',
            onChange: handleInputChange
          })}
          {renderFormField({
            name: 'date',
            label: 'Date',
            type: 'date',
            value: currentTransaction?.date || today,
            onChange: handleInputChange,
            InputLabelProps: { shrink: true },
            inputProps: { max: today }
          })}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleTransactionSubmit} 
          variant="contained" 
          color="primary"
        >
          {isEditing ? 'Update' : 'Add'} Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
});
// Transactions Table Component
const TransactionsTable = React.memo(({ 
  transactions,
  onEdit,
  onDelete,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  searchTerm,
  onSearchChange
}) => {
  const theme = useTheme();

  return (
    <div className="table-card">
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" className="chart-title">
            Transactions
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Search transactions">
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ minWidth: { xs: 120, sm: 200 } }}
              />
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <Box className="table-container">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Type</TableCell>
              <TableCell align="right">
                <Tooltip title="Actions">
                  <span>Actions</span>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => (
                <TableRow key={transaction.id} hover className="transaction-row">
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell 
                    align="right" 
                    className={`amount-cell ${transaction.type}`}
                  >
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                      className="status-chip"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit transaction">
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(transaction)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete transaction">
                      <IconButton 
                        size="small" 
                        onClick={() => onDelete(transaction.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{ 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper 
        }}
      />
    </div>
  );
});

// Main Finances Component
const Finances = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalState, setModalState] = useState({
    isOpen: false,
    isEditing: false,
    currentTransaction: null
  });

  // Queries
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions 
  } = useQuery('transactions', getTransactions, {
    onError: (error) => {
      console.error('Error fetching transactions:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch transactions',
        severity: 'error'
      });
    }
  });

  const { 
    data: financialSummary, 
    isLoading: isLoadingFinancialSummary,
    isError: isErrorFinancialSummary 
  } = useQuery('financialSummary', getFinancialSummary, {
    onError: (error) => {
      console.error('Error fetching financial summary:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch financial summary',
        severity: 'error'
      });
    }
  });

  // Mutations
  const addTransactionMutation = useMutation(addTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions', 'financialSummary']);
      setSnackbar({
        open: true,
        message: 'Transaction added successfully',
        severity: 'success'
      });
      handleModalClose();
    },
    onError: (error) => {
      console.error('Error adding transaction:', error);
      setSnackbar({
        open: true,
        message: `Failed to add transaction: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const updateTransactionMutation = useMutation(
    ({ id, ...data }) => updateTransaction(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['transactions', 'financialSummary']);
        setSnackbar({
          open: true,
          message: 'Transaction updated successfully',
          severity: 'success'
        });
        handleModalClose();
      },
      onError: (error) => {
        console.error('Error updating transaction:', error);
        setSnackbar({
          open: true,
          message: `Failed to update transaction: ${error.message}`,
          severity: 'error'
        });
      }
    }
  );

  const deleteTransactionMutation = useMutation(deleteTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions', 'financialSummary']);
      setSnackbar({
        open: true,
        message: 'Transaction deleted successfully',
        severity: 'success'
      });
    },
    onError: (error) => {
      console.error('Error deleting transaction:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete transaction: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // Memoized Values
  const filteredAndSortedTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    let filtered = transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterConfig === 'all' || t.type === filterConfig;
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (aValue - bValue) * modifier;
    });
  }, [transactions, searchTerm, filterConfig, sortConfig]);

  // Handlers
  const handleModalOpen = useCallback((transaction = null) => {
    setModalState({
      isOpen: true,
      isEditing: !!transaction,
      currentTransaction: transaction || {
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      }
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      currentTransaction: { ...prev.currentTransaction, [name]: value }
    }));
  }, []);

  const handleTransactionSubmit = useCallback(() => {
    const { isEditing, currentTransaction } = modalState;
    
    if (!currentTransaction.type || !currentTransaction.amount || 
        !currentTransaction.description || !currentTransaction.date) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    const transactionDate = new Date(currentTransaction.date);
    const currentDate = new Date();
    if (transactionDate > currentDate) {
      setSnackbar({
        open: true,
        message: 'Transaction date cannot be in the future',
        severity: 'error'
      });
      return;
    }

    if (isEditing) {
      updateTransactionMutation.mutate(currentTransaction);
    } else {
      addTransactionMutation.mutate(currentTransaction);
    }
  }, [modalState, updateTransactionMutation, addTransactionMutation]);

  const handleTransactionDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(id);
    }
  }, [deleteTransactionMutation]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setSortAnchorEl(null);
  }, []);

  const handleFilter = useCallback((type) => {
    setFilterConfig(type);
    setFilterAnchorEl(null);
    setPage(0);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(0);
  }, []);

  // Chart Rendering
  const renderChart = useCallback((title, type, data, keys = []) => (
    <div className="chart-card">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" className="chart-title">{title}</Typography>
        <Tooltip title={`This chart shows ${title.toLowerCase()}`}>
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <div className="chart-container">
        {data && data.length > 0 ? (
          <ChartComponent type={type} data={data} keys={keys} />
        ) : (
          <Typography>No data available for {title}</Typography>
        )}
      </div>
    </div>
  ), []);

  // Content Rendering
  const renderContent = useCallback(() => {
    if (isLoadingTransactions || isLoadingFinancialSummary) {
      return (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      );
    }

    if (isErrorTransactions || isErrorFinancialSummary) {
      return (
        <Typography variant="h6" className="error-container">
          Error loading data. Please try again later.
        </Typography>
      );
    }

    if (!transactions?.length || !financialSummary) {
      return (
        <Typography variant="h6" align="center">
          No financial data available. Please add some transactions.
        </Typography>
      );
    }

    const { 
      monthlyData = [], 
      incomeBreakdown = [], 
      expenseBreakdown = [], 
      yearlyData = [] 
    } = financialSummary;

    const formatPieChartData = (data) => 
      data.map(item => ({ 
        id: item.category || item.name, 
        value: parseFloat(item.value) 
      }));

    const filteredTransactions = filteredAndSortedTransactions.filter(transaction => {
      if (tabValue === 1) return transaction.type === 'income';
      if (tabValue === 2) return transaction.type === 'expense';
      return true;
    });

    const tabContent = {
      0: ( // Overview
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FinancialInsights financialSummary={financialSummary} />
          </Grid>
          <Grid item xs={12} md={6}>
            {renderChart('Income vs Expenses', 'bar', monthlyData, ['income', 'expense'])}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderChart('Monthly Net Profit', 'bar', monthlyData, ['netProfit'])}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderChart('Yearly Net Profit', 'line', yearlyData, ['netProfit'])}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderChart('Income Breakdown', 'pie', formatPieChartData(incomeBreakdown))}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderChart('Expense Breakdown', 'pie', formatPieChartData(expenseBreakdown))}
          </Grid>
          <Grid item xs={12}>
            <TransactionsTable
              transactions={filteredTransactions}
              onEdit={handleModalOpen}
              onDelete={handleTransactionDelete}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
            />
          </Grid>
        </Grid>
      ),
      1: ( // Income
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderChart('Monthly Income', 'bar', monthlyData, ['income'])}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderChart('Income Breakdown', 'pie', formatPieChartData(incomeBreakdown))}
          </Grid>
          <Grid item xs={12}>
            <TransactionsTable
              transactions={filteredTransactions}
              onEdit={handleModalOpen}
              onDelete={handleTransactionDelete}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
            />
          </Grid>
        </Grid>
      ),
      2: ( // Expenses
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderChart('Monthly Expenses', 'bar', monthlyData, ['expense'])}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderChart('Expense Breakdown', 'pie', formatPieChartData(expenseBreakdown))}
          </Grid>
          <Grid item xs={12}>
            <TransactionsTable
              transactions={filteredTransactions}
              onEdit={handleModalOpen}
              onDelete={handleTransactionDelete}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
            />
          </Grid>
        </Grid>
      ),
      3: ( // Transactions
        <TransactionsTable
          transactions={filteredTransactions}
          onEdit={handleModalOpen}
          onDelete={handleTransactionDelete}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
        />
      )
    };

    return tabContent[tabValue] || <Typography>Invalid tab selected</Typography>;
  }, [
    tabValue,
    transactions,
    financialSummary,
    filteredAndSortedTransactions,
    isLoadingTransactions,
    isLoadingFinancialSummary,
    isErrorTransactions,
    isErrorFinancialSummary,
    handleModalOpen,
    handleTransactionDelete,
    renderChart,
    page,
    rowsPerPage,
    searchTerm,
    handleSearch
  ]);

  // Main Render
  return (
    <div className="page-wrapper">
      <Typography variant="h4" gutterBottom className="page-title">
        Property Financial Dashboard
      </Typography>
      
      <div className="button-group">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleModalOpen()}
          className="action-button"
        >
          Add Transaction
        </Button>
      </div>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        className="finance-tabs"
      >
        <Tab icon={<BarChartIcon />} label="Overview" />
        <Tab icon={<MoneyIcon />} label="Income" />
        <Tab icon={<PieChartIcon />} label="Expenses" />
        <Tab icon={<TimelineIcon />} label="Transactions" />
      </Tabs>

      <Fade in={true}>
        <Box>{renderContent()}</Box>
      </Fade>

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        currentTransaction={modalState.currentTransaction}
        handleInputChange={handleInputChange}
        handleTransactionSubmit={handleTransactionSubmit}
        isEditing={modalState.isEditing}
      />

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
        className="filter-sort-menu"
      >
        <MenuItem onClick={() => handleSort('date')}>
          <Tooltip title="Sort by transaction date">
            <Box>Sort by Date {sortConfig.key === 'date' && `(${sortConfig.direction})`}</Box>
          </Tooltip>
        </MenuItem>
        <MenuItem onClick={() => handleSort('amount')}>
          <Tooltip title="Sort by transaction amount">
            <Box>Sort by Amount {sortConfig.key === 'amount' && `(${sortConfig.direction})`}</Box>
          </Tooltip>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        className="filter-sort-menu"
      >
        <MenuItem onClick={() => handleFilter('all')}>
          <Tooltip title="Show all transactions">
            <Box>Show All</Box>
          </Tooltip>
        </MenuItem>
        <MenuItem onClick={() => handleFilter('income')}>
          <Tooltip title="Show only income transactions">
            <Box>Show Income</Box>
          </Tooltip>
        </MenuItem>
        <MenuItem onClick={() => handleFilter('expense')}>
          <Tooltip title="Show only expense transactions">
            <Box>Show Expenses</Box>
          </Tooltip>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Finances;