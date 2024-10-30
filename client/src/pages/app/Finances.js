import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Typography,
  Grid,
  Box,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Menu,
  MenuItem,
  useMediaQuery,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  CardHeader,
  useTheme,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  CompareArrows as CompareArrowsIcon,
  AccountBalanceWallet as WalletIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format, parseISO, isValid } from 'date-fns';
import styles from './Finances.module.css';

ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

const TRANSACTION_TYPES = {
  income: [
    'Rent',
    'Late Fees',
    'Parking',
    'Utilities Reimbursement',
    'Security Deposit',
    'Pet Rent',
    'Application Fees',
    'Other Income',
  ],
  expense: [
    'Maintenance',
    'Utilities',
    'Property Management',
    'Insurance',
    'Property Tax',
    'Mortgage',
    'Repairs',
    'Marketing',
    'Legal',
    'Cleaning',
    'Landscaping',
    'Other Expenses',
  ],
};

const CHART_COLORS = [
  '#6366F1',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#64748B',
];

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

const formatDate = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, 'MMM dd, yyyy') : '';
};

const getTransactions = async (filterConfig) => {
  try {
    const response = await fetch('http://localhost:5000/api/finances/transactions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return filterConfig === 'all' ? data : data.filter(t => t.type === filterConfig);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

const addTransaction = async (transaction) => {
  try {
    const response = await fetch('http://localhost:5000/api/finances/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(transaction)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

const updateTransaction = async (id, data) => {
  try {
    const response = await fetch(`http://localhost:5000/api/finances/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

const deleteTransaction = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/finances/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return id;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
const getFinancialSummary = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/finances/summary', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
};

const getChartOptions = (theme, title = '') => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        color: theme.palette.text.primary,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          family: theme.typography.fontFamily,
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      titleColor: theme.palette.text.primary,
      bodyColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        family: theme.typography.fontFamily,
        size: 14,
        weight: 600,
      },
      bodyFont: {
        family: theme.typography.fontFamily,
        size: 13,
      },
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = formatCurrency(context.raw);
          return label ? `${label}: ${value}` : value;
        },
      },
    },
    title: title ? {
      display: true,
      text: title,
      color: theme.palette.text.primary,
      font: {
        family: theme.typography.fontFamily,
        size: 16,
        weight: 600,
      },
      padding: 20,
    } : undefined,
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: theme.palette.text.secondary,
        font: {
          family: theme.typography.fontFamily,
          size: 12,
        },
      },
    },
    y: {
      grid: {
        color: theme.palette.divider,
        drawBorder: false,
      },
      ticks: {
        color: theme.palette.text.secondary,
        font: {
          family: theme.typography.fontFamily,
          size: 12,
        },
        callback: (value) => formatCurrency(value),
      },
    },
  },
  interaction: {
    mode: 'nearest',
    intersect: false,
    axis: 'x',
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart',
  },
});

const StatsCard = React.memo(({ title, value, trend, trendValue, icon: Icon, color = 'primary', delay = 0 }) => {
  return (
    <Zoom in style={{ transitionDelay: `${delay}ms` }}>
      <Card className={`stats-card stats-card-${color}`}>
        <CardContent>
          <Box className={styles.statsCardHeader}>
            <Box className={`stats-card-icon ${color}`}>
              <Icon />
            </Box>
            <Typography variant="h6" className={styles.statsCardTitle}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h3" className={styles.statsCardValue}>
            {value}
          </Typography>
          <Fade in timeout={800}>
            <Box className={`stats-card-trend ${trend}`}>
              {trend === 'up' ? (
                <KeyboardArrowUpIcon className={styles.trendIcon} />
              ) : (
                <KeyboardArrowDownIcon className={styles.trendIcon} />
              )}
              <Typography variant="body2">
                {trendValue}% vs last month
              </Typography>
            </Box>
          </Fade>
        </CardContent>
      </Card>
    </Zoom>
  );
});

const ChartCard = React.memo(({ title, subtitle, chart: Chart, data, type = 'bar', height = 400, action }) => {
  const theme = useTheme();

  return (
    <Card className={styles.chartCard}>
      <CardHeader
        title={title}
        subheader={subtitle}
        action={action}
        className={styles.chartHeader}
      />
      <CardContent>
        <Box height={height}>
          <Chart
            data={data}
            options={getChartOptions(theme)}
            type={type}
          />
        </Box>
      </CardContent>
    </Card>
  );
});

const TransactionRow = React.memo(({ 
  transaction, 
  onEdit, 
  onDelete, 
  index 
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(transaction);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(transaction.id);
  };

  return (
    <Fade in timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
      <TableRow hover className={styles.transactionRow}>
        <TableCell>
          <Box className={styles.transactionDate}>
            <Typography variant="body2" className={styles.dateMain}>
              {formatDate(transaction.date)}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box className={styles.transactionInfo}>
            <Typography variant="body2" className={styles.transactionDescription}>
              {transaction.description}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {transaction.category}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Typography
            variant="body2"
            className={`amount-cell ${transaction.type}`}
          >
            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={transaction.type}
            color={transaction.type === 'income' ? 'success' : 'error'}
            size="small"
            className={styles.statusChip}
          />
        </TableCell>
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={handleMenuClick}
            className={styles.actionButton}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            className={styles.actionMenu}
          >
            <MenuItem onClick={handleEdit}>
              <EditIcon fontSize="small" className={styles.menuIcon} />
              <Typography variant="body2">Edit</Typography>
            </MenuItem>
            <MenuItem onClick={handleDelete} className={styles.deleteMenuItem}>
              <DeleteIcon fontSize="small" className={styles.menuIcon} />
              <Typography variant="body2">Delete</Typography>
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
    </Fade>
  );
});

const TransactionsTable = React.memo(({
  transactions,
  onEdit,
  onDelete,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  searchTerm,
  onSearchChange,
  sortConfig,
  onSortChange,
  filterConfig,
  onFilterChange,
  compact = false,
}) => {
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);

  const handleFilterClick = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleSortClick = (event) => {
    setSortAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleSortClose = () => {
    setSortAnchor(null);
  };

  const handleFilterChange = (newFilter) => {
    onFilterChange(newFilter);
    handleFilterClose();
  };

  const handleSortChange = (newSort) => {
    onSortChange(newSort);
    handleSortClose();
  };

  return (
    <Card className={styles.transactionsCard}>
      <CardHeader
        title={
          <Box className={styles.tableHeader}>
            <Typography variant="h6">Transactions</Typography>
            {!compact && (
              <Typography variant="body2" color="textSecondary">
                {transactions.length} total transactions
              </Typography>
            )}
          </Box>
        }
        action={
          <Box className={styles.tableActions}>
            <TextField
              size="small"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{startAdornment: <SearchIcon fontSize="small" color="action" />,
              }}
              className={styles.searchField}
            />
            {!compact && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleFilterClick}
                  className={styles.filterButton}
                >
                  Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={handleSortClick}
                  className={styles.sortButton}
                >
                  Sort
                </Button>
              </>
            )}
          </Box>
        }
      />
      <Box className={styles.tableContainer}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  index={index}
                />
              ))}
          </TableBody>
        </Table>
      </Box>
      {!compact && (
        <Box className={styles.tablePagination}>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Select
                value={rowsPerPage}
                onChange={onRowsPerPageChange}
                size="small"
                className={styles.rowsPerPage}
              >
                {ROWS_PER_PAGE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option} rows
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </Box>
      )}

      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
        className={styles.filterMenu}
      >
        <MenuItem
          selected={filterConfig === 'all'}
          onClick={() => handleFilterChange('all')}
        >
          All Transactions
        </MenuItem>
        <MenuItem
          selected={filterConfig === 'income'}
          onClick={() => handleFilterChange('income')}
        >
          Income Only
        </MenuItem>
        <MenuItem
          selected={filterConfig === 'expense'}
          onClick={() => handleFilterChange('expense')}
        >
          Expenses Only
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={sortAnchor}
        open={Boolean(sortAnchor)}
        onClose={handleSortClose}
        className={styles.sortMenu}
      >
        <MenuItem onClick={() => handleSortChange({ key: 'date', direction: sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? 'desc' : 'asc') : 'desc' })}>
          <Box className={styles.sortMenuItem}>
            <Typography>Sort by Date</Typography>
            {sortConfig.key === 'date' && (
              <CompareArrowsIcon className={`sort-icon ${sortConfig.direction}`} />
            )}
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleSortChange({ key: 'amount', direction: sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? 'desc' : 'asc') : 'desc' })}>
          <Box className={styles.sortMenuItem}>
            <Typography>Sort by Amount</Typography>
            {sortConfig.key === 'amount' && (
              <CompareArrowsIcon className={`sort-icon ${sortConfig.direction}`} />
            )}
          </Box>
        </MenuItem>
      </Menu>
    </Card>
  );
});

const TransactionModal = React.memo(({
  open,
  onClose,
  transaction,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: new Date(transaction.date).toISOString().split('T')[0],
      });
    }
  }, [transaction]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { category: TRANSACTION_TYPES[value][0] } : {}),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.transactionModal}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle className={styles.modalTitle}>
          {transaction ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
        <DialogContent className={styles.modalContent}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                  required
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  required
                >
                  {TRANSACTION_TYPES[formData.type]?.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Box component="span" mr={1}>$</Box>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className={styles.modalActions}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : transaction ? (
              'Update Transaction'
            ) : (
              'Add Transaction'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const Finances = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalState, setModalState] = useState({
    open: false,
    transaction: null,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [transactionsData, summaryData] = await Promise.all([
        getTransactions(filterConfig),
        getFinancialSummary(),
      ]);
      setTransactions(transactionsData);
      setFinancialSummary(summaryData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filterConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModalOpen = useCallback((transaction = null) => {
    setModalState({
      open: true,
      transaction,
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState({
      open: false,
      transaction: null,
    });
  }, []);

  const handleTransactionSubmit = async (formData) => {
    setIsLoading(true);
    try {
      if (modalState.transaction) {
        await updateTransaction(modalState.transaction.id, formData);
      } else {
        await addTransaction(formData);
      }
      handleModalClose();
      await fetchData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setError('Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;

      if (sortConfig.key === 'date') {
        return (new Date(aValue) - new Date(bValue)) * modifier;
      }
      
      return (aValue - bValue) * modifier;
    });
  }, [transactions, searchTerm, sortConfig]);

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(financialSummary?.totalIncome || 0)}
              trend="up"
              trendValue={financialSummary?.trends?.income || 0}
              icon={MoneyIcon}
              color="primary"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Expenses"
              value={formatCurrency(financialSummary?.totalExpense || 0)}
              trend="down"
              trendValue={Math.abs(financialSummary?.trends?.expense || 0)}
              icon={AccountBalanceIcon}
              color="error"
              delay={400}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Net Profit"
              value={formatCurrency((financialSummary?.totalIncome || 0) - (financialSummary?.totalExpense || 0))}
              trend="up"
              trendValue={financialSummary?.trends?.profit || 0}
              icon={TrendingUpIcon}
              color="success"
              delay={600}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="ROI"
              value={formatPercent(financialSummary?.roi || 0)}
              trend="up"
              trendValue={financialSummary?.trends?.roi || 0}
              icon={WalletIcon}
              color="info"
              delay={800}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <ChartCard
          title="Revenue vs Expenses"
          subtitle="Monthly comparison"
          chart={Bar}
          data={{
            labels: financialSummary?.monthlyData?.map(d => d.month) || [],
            datasets: [
              {
                label: 'Revenue',
                data: financialSummary?.monthlyData?.map(d => d.income) || [],
                backgroundColor: theme.palette.primary.main,
                borderRadius: 4,
              },
              {
                label: 'Expenses',
                data: financialSummary?.monthlyData?.map(d => d.expense) || [],
                backgroundColor: theme.palette.error.main,
                borderRadius: 4,
              },
            ],
          }}
          height={400}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard
              title="Income Distribution"
              chart={Doughnut}
              data={{
                labels: financialSummary?.incomeBreakdown?.map(d => d.category) || [],
                datasets: [{
                  data: financialSummary?.incomeBreakdown?.map(d => d.value) || [],
                  backgroundColor: CHART_COLORS,
                  borderWidth: 0,
                }],
              }}
              height={200}
            />
          </Grid>
          <Grid item xs={12}>
            <ChartCard
              title="Expense Categories"
              chart={Doughnut}
              data={{
                labels: financialSummary?.expenseBreakdown?.map(d => d.category) || [],
                datasets: [{
                  data: financialSummary?.expenseBreakdown?.map(d => d.value) || [],
                  backgroundColor: CHART_COLORS,
                  borderWidth: 0,
                }],
              }}
              height={200}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <TransactionsTable
          transactions={filteredAndSortedTransactions.slice(0, 5)}
          onEdit={handleModalOpen}
          onDelete={handleDeleteTransaction}
          page={0}
          rowsPerPage={5}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
          filterConfig={filterConfig}
          onFilterChange={setFilterConfig}
          compact
        />
      </Grid>
    </Grid>
  );

  const renderTransactionsTab = () => (
    <TransactionsTable
      transactions={filteredAndSortedTransactions}
      onEdit={handleModalOpen}
      onDelete={handleDeleteTransaction}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      sortConfig={sortConfig}
      onSortChange={setSortConfig}
      filterConfig={filterConfig}
      onFilterChange={setFilterConfig}
    />
  );

  const renderError = () => {
    if (!error) return null;

    return (
      <Box sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 1,
        bgcolor: 'error.light',
        color: 'error.dark'
      }}>
        <Typography variant="body1">{error}</Typography>
      </Box>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box className={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return renderError();
    }

    switch (tabValue) {
      case 0:
        return renderOverviewTab();
      case 1:
        return renderTransactionsTab();
      default:
        return null;
    }
  };

  return (
    <div className={styles.financesWrapper}>
      <Box className={styles.financesHeader}>
        <Box className={styles.headerContent}>
          <Box>
            <Typography variant="h4" className={styles.pageTitle}>
              Financial Management
            </Typography>
            <Typography variant="body1" color="textSecondary" className={styles.subtitle}>
              Track, analyze, and manage your property finances
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleModalOpen()}
            className={styles.addTransactionButton}
          >
            Add Transaction
          </Button>
        </Box>
      </Box>

      {error && renderError()}

      <Paper className={styles.tabsContainer}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          className={styles.financeTabs}
        >
          <Tab
            icon={<BarChartIcon />}
            label="Overview"
            className={styles.financeTab}
          />
          <Tab
            icon={<TimelineIcon />}
            label="Transactions"
            className={styles.financeTab}
          />
        </Tabs>
      </Paper>

      <Box className={styles.contentContainer}>
        <Fade in timeout={500}>
          <Box>
            {renderContent()}
          </Box>
        </Fade>
      </Box>

      <TransactionModal
        open={modalState.open}
        onClose={handleModalClose}
        transaction={modalState.transaction}
        onSubmit={handleTransactionSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Finances;