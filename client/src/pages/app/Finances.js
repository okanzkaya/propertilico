import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography, Grid, Box, Button, IconButton, Tooltip, Tabs, Tab, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, Menu, MenuItem,
  Fade, useMediaQuery, Chip, CircularProgress, Snackbar, Alert, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Add as AddIcon, FilterList as FilterListIcon,
  Sort as SortIcon, Search as SearchIcon, Info as InfoIcon,
  BarChart as BarChartIcon, PieChart as PieChartIcon,
  Timeline as TimelineIcon, AttachMoney as MoneyIcon, Edit as EditIcon,
  Delete as DeleteIcon, TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon, AccountBalance as AccountBalanceIcon,
  Home as HomeIcon, Business as BusinessIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getFinancialSummary } from '../../api';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

// Styled components
const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  color: theme.palette.text.primary,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const ChartCard = styled(StyledCard)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 'bold',
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const TableCard = styled(StyledCard)({
  overflow: 'hidden',
});

const StyledTableContainer = styled(Box)(({ theme }) => ({
  maxHeight: 400,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '0.4em',
    height: '0.4em',
  },
  '&::-webkit-scrollbar-track': {
    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
    webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: '10px',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  fontWeight: 'bold',
}));

const InsightCard = styled(StyledCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(145deg, #f3f4f6, #ffffff)'
    : 'linear-gradient(145deg, #2A283E, #1C1B29)',
}));

// Helper functions
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292'];

// ChartComponent
const ChartComponent = React.memo(({ type, data, keys }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return <Typography>No data available</Typography>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
        },
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
        ticks: {
          color: theme.palette.text.primary,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      y: {
        ticks: {
          color: theme.palette.text.primary,
          callback: (value) => formatCurrency(value),
        },
        grid: {
          color: theme.palette.divider,
        },
      },
    },
  };

  switch (type) {
    case 'bar':
      const barData = {
        labels: data.map(item => item.name),
        datasets: keys.map((key, index) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          data: data.map(item => item[key]),
          backgroundColor: COLORS[index % COLORS.length],
        })),
      };
      return <Bar data={barData} options={chartOptions} />;
    case 'pie':
      const pieData = {
        labels: data.map(item => item.id),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: COLORS,
        }],
      };
      return <Pie data={pieData} options={chartOptions} />;
    case 'line':
      const lineData = {
        labels: data.map(item => item.x),
        datasets: [{
          label: 'Net Operating Income',
          data: data.map(item => item.y),
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.main,
        }],
      };
      return <Line data={lineData} options={chartOptions} />;
    default:
      return <Typography>Invalid chart type</Typography>;
  }
});

// FinancialInsights Component
const FinancialInsights = React.memo(({ financialSummary }) => {
  const theme = useTheme();
  const { totalIncome = 0, totalExpense = 0, occupancyRate = 0, averageRent = 0 } = financialSummary || {};
  const netOperatingIncome = totalIncome - totalExpense;
  const capRate = totalIncome > 0 ? ((netOperatingIncome / (totalIncome * 12)) * 100) : 0;

  return (
    <InsightCard>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Property Financial Insights</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" alignItems="center">
          <MoneyIcon color="primary" sx={{ mr: 1 }} />
          <Typography><strong>Net Operating Income:</strong> {formatCurrency(netOperatingIncome)}</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <TrendingUpIcon color={capRate > 8 ? "success" : "warning"} sx={{ mr: 1 }} />
          <Typography><strong>Cap Rate:</strong> {capRate.toFixed(2)}%</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <HomeIcon color={occupancyRate > 90 ? "success" : "warning"} sx={{ mr: 1 }} />
          <Typography><strong>Occupancy Rate:</strong> {occupancyRate.toFixed(2)}%</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <BusinessIcon color="primary" sx={{ mr: 1 }} />
          <Typography><strong>Average Rent:</strong> {formatCurrency(averageRent)}</Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>
        {capRate > 8 
          ? <><SavingsIcon sx={{ mr: 1, color: 'success.main' }} /> Excellent cap rate! Your property is performing well.</>
          : <><SavingsIcon sx={{ mr: 1, color: 'warning.main' }} /> Consider strategies to improve your cap rate for better returns.</>
        }
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>
        {occupancyRate > 90 
          ? <><AccountBalanceIcon sx={{ mr: 1, color: 'success.main' }} /> High occupancy rate indicates strong demand.</>
          : <><AccountBalanceIcon sx={{ mr: 1, color: 'warning.main' }} /> There's room to improve occupancy. Consider marketing strategies.</>
        }
      </Typography>
    </InsightCard>
  );
});

// TransactionModal Component
const TransactionModal = ({ 
  isOpen, 
  onClose, 
  currentTransaction, 
  handleInputChange, 
  handleTransactionSubmit,
  isEditing
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={currentTransaction?.type || ''}
                onChange={handleInputChange}
                label="Type"
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={currentTransaction?.category || ''}
                onChange={handleInputChange}
                label="Category"
              >
                {currentTransaction?.type === 'income' 
                  ? ['Rent', 'Late Fees', 'Parking', 'Other Income'].map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))
                  : ['Maintenance', 'Utilities', 'Property Management', 'Insurance', 'Property Tax', 'Mortgage', 'Other Expenses'].map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))
                }
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="normal"
              name="amount"
              label="Amount"
              type="number"
              value={currentTransaction?.amount || ''}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth margin="normal"
              name="description"
              label="Description"
              value={currentTransaction?.description || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="normal"
              name="date"
              label="Date"
              type="date"
              value={currentTransaction?.date || today}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleTransactionSubmit} color="primary">
          {isEditing ? 'Update' : 'Add'} Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Finances Component
const Finances = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState({
    isOpen: false,
    isEditing: false,
    currentTransaction: null
  });

  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
  } = useQuery('transactions', getTransactions, {
    onError: (error) => {
      console.error('Error fetching transactions:', error);
      setSnackbar({ open: true, message: 'Failed to fetch transactions. Please try again.', severity: 'error' });
    }});

    const { 
      data: financialSummary, 
      isLoading: isLoadingFinancialSummary,
      isError: isErrorFinancialSummary,
    } = useQuery('financialSummary', getFinancialSummary, {
      onError: (error) => {
        console.error('Error fetching financial summary:', error);
        setSnackbar({ open: true, message: 'Failed to fetch financial summary. Please try again.', severity: 'error' });
      }
    });
  
    const addTransactionMutation = useMutation(addTransaction, {
      onSuccess: () => {
        queryClient.invalidateQueries('transactions');
        queryClient.invalidateQueries('financialSummary');
        setSnackbar({ open: true, message: 'Transaction added successfully', severity: 'success' });
        handleModalClose();
      },
      onError: (error) => {
        console.error('Error adding transaction:', error);
        setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      },
    });
  
    const updateTransactionMutation = useMutation(
      ({ id, ...data }) => updateTransaction(id, data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries('transactions');
          queryClient.invalidateQueries('financialSummary');
          setSnackbar({ open: true, message: 'Transaction updated successfully', severity: 'success' });
          handleModalClose();
        },
        onError: (error) => {
          console.error('Error updating transaction:', error);
          setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
        },
      }
    );
  
    const deleteTransactionMutation = useMutation(deleteTransaction, {
      onSuccess: () => {
        queryClient.invalidateQueries('transactions');
        queryClient.invalidateQueries('financialSummary');
        setSnackbar({ open: true, message: 'Transaction deleted successfully', severity: 'success' });
      },
      onError: (error) => {
        console.error('Error deleting transaction:', error);
        setSnackbar({ open: true, message: `Error: ${error.response?.data?.message || error.message}`, severity: 'error' });
      },
    });
  
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
      
      if (!currentTransaction.type || !currentTransaction.amount || !currentTransaction.description || !currentTransaction.date) {
        setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
        return;
      }
  
      const transactionDate = new Date(currentTransaction.date);
      const currentDate = new Date();
      currentDate.setHours(23, 59, 59, 999); // Set to end of the current day
  
      if (transactionDate > currentDate) {
        setSnackbar({ open: true, message: 'Transaction date cannot be in the future', severity: 'error' });
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
  
    const filteredAndSortedTransactions = useMemo(() => {
      if (!transactions) return [];
      
      let filtered = transactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterConfig === 'all' || t.type === filterConfig)
      );
  
      return filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }, [transactions, searchTerm, filterConfig, sortConfig]);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    const renderChart = useCallback((title, type, data, keys) => (
      <ChartCard>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{title}</Typography>
          <Tooltip title={`This chart shows ${title.toLowerCase()}`}>
            <IconButton size="small"><InfoIcon /></IconButton>
          </Tooltip>
        </Box>
        <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center" height={400}>
          {data && data.length > 0 ? (
            <ChartComponent type={type} data={data} keys={keys} />
          ) : (
            <Typography>No data available for {title}</Typography>
          )}
        </Box>
      </ChartCard>
    ), [theme.palette.primary.main]);
  
    const renderTransactionsTable = useCallback((transactions) => (
      <TableCard>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Transactions</Typography>
          <Box display="flex" alignItems="center">
            <IconButton size="small" onClick={(e) => setFilterAnchorEl(e.currentTarget)}><FilterListIcon /></IconButton>
            <IconButton size="small" onClick={(e) => setSortAnchorEl(e.currentTarget)}><SortIcon /></IconButton>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
            />
          </Box>
        </Box>
        <StyledTableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell align="right" sx={{ color: transaction.type === 'income' ? 'success.main' : 'error.main' }}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell align="right">
                    <StyledChip
                      label={transaction.type}
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleModalOpen(transaction)}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleTransactionDelete(transaction.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableCard>
    ), [theme.palette.primary.main, searchTerm, page, rowsPerPage, handleModalOpen, handleTransactionDelete]);
  
    const renderContent = useCallback(() => {
      if (isLoadingTransactions || isLoadingFinancialSummary) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        );
      }
  
      if (isErrorTransactions || isErrorFinancialSummary) {
        return (
          <Typography variant="h6" align="center" color="error">
            Error loading data. Please try again later.
          </Typography>
        );
      }
    
      if (!transactions || transactions.length === 0 || !financialSummary) {
        return (
          <Typography variant="h6" align="center">
            No financial data available. Please add some transactions.
          </Typography>
        );
      }
    
      const { monthlyData = [], incomeBreakdown = [], expenseBreakdown = [] } = financialSummary || {};
      
      const formatPieChartData = (data) => data.map(item => ({ id: item.category || item.name, value: parseFloat(item.value) }));
    
      const filteredTransactions = filteredAndSortedTransactions.filter(transaction => {
        if (tabValue === 1) return transaction.type === 'income';
        if (tabValue === 2) return transaction.type === 'expense';
        return true;
      });
  
      switch (tabValue) {
        case 0: // Overview
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FinancialInsights financialSummary={financialSummary} />
              </Grid>
              <Grid item xs={12} md={6}>{renderChart('Income vs Expenses', 'bar', monthlyData, ['income', 'expense'])}</Grid>
              <Grid item xs={12} md={6}>{renderChart('Net Operating Income Trend', 'line', monthlyData.map(item => ({ x: item.month, y: item.income - item.expense })), ['netOperatingIncome'])}</Grid>
              <Grid item xs={12} md={6}>{renderChart('Income Breakdown', 'pie', formatPieChartData(incomeBreakdown))}</Grid>
              <Grid item xs={12} md={6}>{renderChart('Expense Breakdown', 'pie', formatPieChartData(expenseBreakdown))}</Grid>
              <Grid item xs={12}>{renderTransactionsTable(filteredTransactions)}</Grid>
            </Grid>
          );
        case 1: // Income
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>{renderChart('Monthly Income', 'bar', monthlyData.map(item => ({ name: item.month, income: item.income })), ['income'])}</Grid>
              <Grid item xs={12} md={6}>{renderChart('Income Breakdown', 'pie', formatPieChartData(incomeBreakdown))}</Grid>
              <Grid item xs={12}>{renderTransactionsTable(filteredTransactions)}</Grid>
            </Grid>
          );
        case 2: // Expenses
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>{renderChart('Monthly Expenses', 'bar', monthlyData.map(item => ({ name: item.month, expense: item.expense })), ['expense'])}</Grid>
              <Grid item xs={12} md={6}>{renderChart('Expense Breakdown', 'pie', formatPieChartData(expenseBreakdown))}</Grid>
              <Grid item xs={12}>{renderTransactionsTable(filteredTransactions)}</Grid>
            </Grid>
          );
        case 3: // Transactions
        return renderTransactionsTable(filteredTransactions);
        default:
          return <Typography variant="h6" align="center">Invalid tab selected.</Typography>;
      }
    }, [tabValue, renderChart, renderTransactionsTable, financialSummary, transactions, isLoadingTransactions, isLoadingFinancialSummary, isErrorTransactions, isErrorFinancialSummary, filteredAndSortedTransactions]);
  
    return (
      <PageWrapper>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, textShadow: `2px 2px 4px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}` }}>
          Property Financial Dashboard
        </Typography>
        <ButtonGroup>
          <ActionButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleModalOpen()}
          >
            Add Transaction
          </ActionButton>
        </ButtonGroup>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{ mb: 3 }}
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
        >
          <MenuItem onClick={() => { setSortConfig({ key: 'date', direction: 'desc' }); setSortAnchorEl(null); }}>
          Sort by Date (Newest First)
        </MenuItem>
        <MenuItem onClick={() => { setSortConfig({ key: 'amount', direction: 'asc' }); setSortAnchorEl(null); }}>
          Sort by Amount (Lowest First)
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => { setFilterConfig('all'); setFilterAnchorEl(null); }}>Show All</MenuItem>
        <MenuItem onClick={() => { setFilterConfig('income'); setFilterAnchorEl(null); }}>Show Income</MenuItem>
        <MenuItem onClick={() => { setFilterConfig('expense'); setFilterAnchorEl(null); }}>Show Expenses</MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Finances;