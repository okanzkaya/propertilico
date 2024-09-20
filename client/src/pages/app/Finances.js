import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography, Grid, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Tooltip, Tabs, Tab, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, Menu, MenuItem,
  Fade, useMediaQuery, Chip, CircularProgress, Snackbar, Alert, Select, FormControl, InputLabel
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Add as AddIcon, FilterList as FilterListIcon, 
  Sort as SortIcon, Search as SearchIcon, Info as InfoIcon, 
  BarChart as BarChartIcon, PieChart as PieChartIcon,
  Timeline as TimelineIcon, AttachMoney as MoneyIcon, Edit as EditIcon,
  Delete as DeleteIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../../api';

// Suppress warnings from Recharts
const error = console.error;
console.error = (...args) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)',
  },
}));

const ChartCard = styled(StyledCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

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
}));

const TableCard = styled(StyledCard)(({ theme }) => ({
  overflow: 'hidden',
}));

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
    backgroundColor: 'rgba(0,0,0,.1)',
    borderRadius: '10px',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const InsightCard = styled(StyledCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const InsightItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B'];
const incomeCategories = ['Salary', 'Investments', 'Freelance', 'Gifts', 'Other'];
const expenseCategories = ['Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 'Healthcare', 'Personal', 'Entertainment', 'Other'];

const FinancialInsights = ({ financialSummary }) => {
  const { totalIncome, totalExpense, balance } = financialSummary;
  const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
  const expenseRatio = (totalExpense / totalIncome) * 100;

  return (
    <InsightCard>
      <Typography variant="h6" gutterBottom>Financial Insights</Typography>
      <InsightItem>
        <MoneyIcon color="primary" sx={{ mr: 1 }} />
        <Typography>Net Income: ${balance.toFixed(2)}</Typography>
      </InsightItem>
      <InsightItem>
        <TrendingUpIcon color={savingsRate > 20 ? "success" : "warning"} sx={{ mr: 1 }} />
        <Typography>Savings Rate: {savingsRate.toFixed(2)}%</Typography>
      </InsightItem>
      <InsightItem>
        <TrendingDownIcon color={expenseRatio < 70 ? "success" : "error"} sx={{ mr: 1 }} />
        <Typography>Expense Ratio: {expenseRatio.toFixed(2)}%</Typography>
      </InsightItem>
      <Typography variant="body2" sx={{ mt: 2 }}>
        {savingsRate > 20 
          ? "Great job on your savings! Keep it up!" 
          : "Try to increase your savings rate to at least 20% for better financial health."}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {expenseRatio < 70 
          ? "Your expense ratio is well-managed." 
          : "Consider reducing your expenses to improve your financial stability."}
      </Typography>
    </InsightCard>
  );
};

const Finances = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    isEditing: false, 
    currentTransaction: { 
      type: 'income', 
      category: '', 
      amount: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    } 
  });
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const queryClient = useQueryClient();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery('transactions', getTransactions);

  const addTransactionMutation = useMutation(addTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries('transactions');
      setSnackbar({ open: true, message: 'Transaction added successfully', severity: 'success' });
      setModalState({ isOpen: false, isEditing: false, currentTransaction: null });
    },
    onError: (error) => setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' }),
  });

  const updateTransactionMutation = useMutation(
    ({ id, ...data }) => updateTransaction(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('transactions');
        setSnackbar({ open: true, message: 'Transaction updated successfully', severity: 'success' });
        setModalState({ isOpen: false, isEditing: false, currentTransaction: null });
      },
      onError: (error) => setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' }),
    }
  );

  const deleteTransactionMutation = useMutation(deleteTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries('transactions');
      setSnackbar({ open: true, message: 'Transaction deleted successfully', severity: 'success' });
    },
    onError: (error) => setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' }),
  });

  const handleModalOpen = useCallback((transaction = null) => {
    setModalState({ 
      isOpen: true, 
      isEditing: !!transaction, 
      currentTransaction: transaction 
        ? {...transaction, date: new Date(transaction.date).toISOString().split('T')[0]}
        : { type: 'income', category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] }
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState({ isOpen: false, isEditing: false, currentTransaction: null });
  }, []);

  const handleTransactionSubmit = useCallback(() => {
    const { isEditing, currentTransaction } = modalState;
    
    if (!currentTransaction.type || !currentTransaction.amount || !currentTransaction.description || !currentTransaction.date) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }
  
    const transactionToSubmit = {
      ...currentTransaction,
      category: currentTransaction.category || 'Other'
    };
  
    if (isEditing) {
      const { _id, ...transactionData } = transactionToSubmit;
      updateTransactionMutation.mutate({ id: _id, ...transactionData });
    } else {
      addTransactionMutation.mutate(transactionToSubmit);
    }
  }, [modalState, updateTransactionMutation, addTransactionMutation]);

  const handleTransactionDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(id);
    }
  }, [deleteTransactionMutation]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      currentTransaction: { ...prev.currentTransaction, [name]: value }
    }));
  }, []);

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

  const financialSummary = useMemo(() => {
    if (!transactions || transactions.length === 0) return { totalIncome: 0, totalExpense: 0, balance: 0, monthlyData: [], incomeBreakdown: [], expenseBreakdown: [] };
  
    const summary = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount);
      const date = new Date(transaction.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;
  
      if (transaction.type === 'income') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpense += amount;
      }
  
      const monthIndex = acc.monthlyData.findIndex(item => item.name === monthYear);
      if (monthIndex > -1) {
        acc.monthlyData[monthIndex][transaction.type] += amount;
      } else {
        acc.monthlyData.push({ 
          name: monthYear, 
          income: transaction.type === 'income' ? amount : 0, 
          expense: transaction.type === 'expense' ? amount : 0
        });
      }
  
      const breakdownKey = `${transaction.type}Breakdown`;
      const categoryIndex = acc[breakdownKey].findIndex(item => item.name === transaction.category);
      if (categoryIndex > -1) {
        acc[breakdownKey][categoryIndex].value += amount;
      } else {
        acc[breakdownKey].push({ name: transaction.category, value: amount });
      }
  
      return acc;
    }, { totalIncome: 0, totalExpense: 0, monthlyData: [], incomeBreakdown: [], expenseBreakdown: [] });
  
    summary.balance = summary.totalIncome - summary.totalExpense;
  
    summary.monthlyData.forEach(month => {
      month.profit = month.income - month.expense;
    });

    summary.monthlyData.sort((a, b) => {
      const [monthA, yearA] = a.name.split(' ');
      const [monthB, yearB] = b.name.split(' ');
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (yearA !== yearB) return yearA - yearB;
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
    });
  
    return summary;
  }, [transactions]);

  const BarChartComponent = useCallback(({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <RechartsTooltip />
        <Legend />
        <Bar dataKey="income" fill="#8884d8" name="Income" />
        <Bar dataKey="expense" fill="#82ca9d" name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  ), []);
  
  const LineChartComponent = useCallback(({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <RechartsTooltip />
        <Legend />
        <Line type="monotone" dataKey="profit" stroke="#8884d8" name="Profit" />
      </LineChart>
    </ResponsiveContainer>
  ), []);
  
  const PieChartComponent = useCallback(({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip />
      </PieChart>
    </ResponsiveContainer>
  ), []);

  const renderChart = useCallback((title, ChartComponent, data) => (
    <ChartCard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <Tooltip title={`This chart shows ${title.toLowerCase()}`}>
          <IconButton size="small"><InfoIcon /></IconButton>
        </Tooltip>
      </Box>
      <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
        {data && data.length > 0 ? (
          <ChartComponent data={data} />
        ) : (
          <Typography>No data available for {title}</Typography>
        )}
      </Box>
    </ChartCard>
  ), []);

  const renderTransactionsTable = useCallback(() => (
    <TableCard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recent Transactions</Typography>
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
            {filteredAndSortedTransactions.map((transaction) => (
              <TableRow key={transaction._id} hover>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell align="right" sx={{ color: transaction.type === 'income' ? 'success.main' : 'error.main' }}>
                  {transaction.type === 'income' ? '+' : '-'} ${Number(transaction.amount).toFixed(2)}
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
                  <IconButton size="small" onClick={() => handleTransactionDelete(transaction._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableCard>
  ), [filteredAndSortedTransactions, handleModalOpen, handleTransactionDelete, searchTerm]);

  const renderContent = useCallback(() => {
    if (isLoadingTransactions) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      );
    }
  
    if (!transactions || transactions.length === 0) {
      return (
        <Typography variant="h6" align="center">
          No financial data available. Please add some transactions.
        </Typography>
      );
    }
  
    const { monthlyData, incomeBreakdown, expenseBreakdown } = financialSummary;
    
    const formatPieChartData = (data) => data.map(item => ({ name: item.name, value: parseFloat(item.value) }));
  
    switch (tabValue) {
      case 0: // Overview
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FinancialInsights financialSummary={financialSummary} />
            </Grid>
            <Grid item xs={12} md={6}>{renderChart('Income vs Expenses', BarChartComponent, monthlyData)}</Grid>
            <Grid item xs={12} md={6}>{renderChart('Profit Trend', LineChartComponent, monthlyData)}</Grid>
            <Grid item xs={12} md={6}>{renderChart('Income Breakdown', PieChartComponent, formatPieChartData(incomeBreakdown))}</Grid>
            <Grid item xs={12} md={6}>{renderChart('Expense Breakdown', PieChartComponent, formatPieChartData(expenseBreakdown))}</Grid>
            <Grid item xs={12}>{renderTransactionsTable()}</Grid>
          </Grid>
        );
      case 1: // Income
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>{renderChart('Monthly Income', BarChartComponent, monthlyData.map(item => ({ name: item.name, income: item.income })))}</Grid>
            <Grid item xs={12} md={6}>{renderChart('Income Breakdown', PieChartComponent, formatPieChartData(incomeBreakdown))}</Grid>
            <Grid item xs={12}>{renderTransactionsTable()}</Grid>
          </Grid>
        );
      case 2: // Expenses
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>{renderChart('Monthly Expenses', BarChartComponent, monthlyData.map(item => ({ name: item.name, expense: item.expense })))}</Grid>
            <Grid item xs={12} md={6}>{renderChart('Expense Breakdown', PieChartComponent, formatPieChartData(expenseBreakdown))}</Grid>
            <Grid item xs={12}>{renderTransactionsTable()}</Grid>
          </Grid>
        );
      case 3: // Transactions
        return renderTransactionsTable();
      default:
        return <Typography variant="h6" align="center">Invalid tab selected.</Typography>;
    }
  }, [tabValue, renderChart, BarChartComponent, LineChartComponent, PieChartComponent, renderTransactionsTable, financialSummary, transactions, isLoadingTransactions]);

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        Financial Dashboard
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

      {/* Transaction Modal */}
      <Dialog open={modalState.isOpen} onClose={handleModalClose} fullWidth maxWidth="sm">
        <DialogTitle>{modalState.isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={modalState.currentTransaction?.type || ''}
              onChange={handleInputChange}
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={modalState.currentTransaction?.category || ''}
              onChange={handleInputChange}
            >
              {modalState.currentTransaction?.type === 'income' 
                ? incomeCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)
                : expenseCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)
              }
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            value={modalState.currentTransaction?.description || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="amount"
            label="Amount"
            fullWidth
            type="number"
            value={modalState.currentTransaction?.amount || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={modalState.currentTransaction?.date || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button onClick={handleTransactionSubmit} color="primary">
            {modalState.isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menus */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem onClick={() => { setSortConfig({ key: 'date', direction: 'desc' }); setSortAnchorEl(null); }}>
          Sort by Date (Newest First)
        </MenuItem>
        <MenuItem onClick={() => { setSortConfig({ key: 'date', direction: 'asc' }); setSortAnchorEl(null); }}>
          Sort by Date (Oldest First)
        </MenuItem>
        <MenuItem onClick={() => { setSortConfig({ key: 'amount', direction: 'desc' }); setSortAnchorEl(null); }}>
          Sort by Amount (Highest First)
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

      {/* Snackbar for notifications */}
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