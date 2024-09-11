import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography, Grid, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Tooltip, Tabs, Tab, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, Menu, MenuItem,
  Fade, useMediaQuery, Chip
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Add as AddIcon, Remove as RemoveIcon, Receipt as ReceiptIcon,
  FilterList as FilterListIcon, Sort as SortIcon, Search as SearchIcon,
  Info as InfoIcon, BarChart as BarChartIcon, PieChart as PieChartIcon,
  Timeline as TimelineIcon, AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B'];

const financialData = [
  { name: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
  { name: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
  { name: 'Mar', revenue: 2000, expenses: 9800, profit: -7800 },
  { name: 'Apr', revenue: 2780, expenses: 3908, profit: -1128 },
  { name: 'May', revenue: 1890, expenses: 4800, profit: -2910 },
  { name: 'Jun', revenue: 2390, expenses: 3800, profit: -1410 },
];

const revenueBreakdown = [
  { name: 'Rent', value: 4000 },
  { name: 'Parking', value: 300 },
  { name: 'Laundry', value: 300 },
  { name: 'Pet Fees', value: 200 },
  { name: 'Late Fees', value: 100 },
];

const expenseBreakdown = [
  { name: 'Utilities', value: 400 },
  { name: 'Maintenance', value: 300 },
  { name: 'Insurance', value: 300 },
  { name: 'Property Tax', value: 200 },
  { name: 'Management', value: 100 },
];

const Finances = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [modalState, setModalState] = useState({
    addRevenue: false,
    addExpense: false,
    addInvoice: false,
  });
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState('all');

  const toggleModal = useCallback((modal, state) => {
    setModalState(prev => ({ ...prev, [modal]: state }));
  }, []);

  const handleTabChange = useCallback((_, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleSortClick = useCallback((event) => {
    setSortAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClick = useCallback((event) => {
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleSortClose = useCallback(() => {
    setSortAnchorEl(null);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
    handleSortClose();
  }, [handleSortClose]);

  const handleFilter = useCallback((filter) => {
    setFilterConfig(filter);
    handleFilterClose();
  }, [handleFilterClose]);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterConfig === 'all' || t.type === filterConfig)
    );

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [searchTerm, filterConfig, sortConfig]);

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(i => 
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterConfig === 'all' || i.status.toLowerCase() === filterConfig)
    );

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [searchTerm, filterConfig, sortConfig]);

  const renderChart = useCallback((title, ChartComponent, data) => (
    <ChartCard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <Tooltip title={`This chart shows ${title.toLowerCase()}`}>
          <IconButton size="small"><InfoIcon /></IconButton>
        </Tooltip>
      </Box>
      <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent data={data} />
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  ), []);

  const BarChartComponent = useCallback(({ data }) => (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <RechartsTooltip />
      <Legend />
      <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
      <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
    </BarChart>
  ), []);

  const LineChartComponent = useCallback(({ data }) => (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <RechartsTooltip />
      <Legend />
      <Line type="monotone" dataKey="profit" stroke="#8884d8" name="Profit" />
    </LineChart>
  ), []);

  const PieChartComponent = useCallback(({ data }) => (
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
  ), []);

  const renderTransactionsTable = useCallback(() => (
    <TableCard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recent Transactions</Typography>
        <Box display="flex" alignItems="center">
          <IconButton size="small" onClick={handleFilterClick}>
            <FilterListIcon />
          </IconButton>
          <IconButton size="small" onClick={handleSortClick}>
            <SortIcon />
          </IconButton>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" />,
            }}
          />
        </Box>
      </Box>
      <StyledTableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTransactions.map((transaction) => (
              <TableRow key={transaction.id} hover>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.name}</TableCell>
                <TableCell align="right" 
                  sx={{ color: transaction.type === 'credit' ? 'success.main' : 'error.main' }}>
                  {transaction.type === 'credit' ? '+' : '-'} ${transaction.amount}
                </TableCell>
                <TableCell align="right">
                  <StyledChip
                    label={transaction.type}
                    color={transaction.type === 'credit' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableCard>
  ), [filteredAndSortedTransactions, handleFilterClick, handleSortClick, handleSearchChange, searchTerm]);

  const renderInvoicesTable = useCallback(() => (
    <TableCard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Invoices</Typography>
        <Box display="flex" alignItems="center">
          <IconButton size="small" onClick={handleFilterClick}>
            <FilterListIcon />
          </IconButton>
          <IconButton size="small" onClick={handleSortClick}>
            <SortIcon />
          </IconButton>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" />,
            }}
          />
        </Box>
      </Box>
      <StyledTableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedInvoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell align="right">${invoice.amount}</TableCell>
                <TableCell align="right">
                  <StyledChip
                    label={invoice.status}
                    color={invoice.status === 'Paid' ? 'success' : invoice.status === 'Pending' ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableCard>
  ), [filteredAndSortedInvoices, handleFilterClick, handleSortClick, handleSearchChange, searchTerm]);

  const renderContent = useCallback(() => {
    switch (tabValue) {
      case 0: // Overview
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderChart('Revenue vs Expenses', BarChartComponent, financialData)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderChart('Profit Trend', LineChartComponent, financialData)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderChart('Revenue Breakdown', PieChartComponent, revenueBreakdown)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderChart('Expense Breakdown', PieChartComponent, expenseBreakdown)}
            </Grid>
            <Grid item xs={12}>
              {renderTransactionsTable()}
            </Grid>
          </Grid>
        );
      case 1: // Revenues
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderChart('Monthly Revenue', BarChartComponent, financialData.map(item => ({ name: item.name, revenue: item.revenue })))}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderChart('Revenue Breakdown', PieChartComponent, revenueBreakdown)}
            </Grid>
            <Grid item xs={12}>
              {renderTransactionsTable()}
            </Grid>
          </Grid>
        );
      case 2: // Expenses
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderChart('Monthly Expenses', BarChartComponent, financialData.map(item => ({ name: item.name, expenses: item.expenses })))}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderChart('Expense Breakdown', PieChartComponent, expenseBreakdown)}
            </Grid>
            <Grid item xs={12}>
              {renderTransactionsTable()}
            </Grid>
          </Grid>
        );
      case 3: // Transactions
        return renderTransactionsTable();
      case 4: // Invoices
        return renderInvoicesTable();
      default:
        return null;
    }
  }, [tabValue, renderChart, BarChartComponent, LineChartComponent, PieChartComponent, renderTransactionsTable, renderInvoicesTable]);

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
          onClick={() => toggleModal('addRevenue', true)}
        >
          Add Revenue
        </ActionButton>
        <ActionButton
          variant="contained"
          color="secondary"
          startIcon={<RemoveIcon />}
          onClick={() => toggleModal('addExpense', true)}
        >
          Add Expense
        </ActionButton>
        <ActionButton
          variant="contained"
          color="info"
          startIcon={<ReceiptIcon />}
          onClick={() => toggleModal('addInvoice', true)}
        >
          Create Invoice
        </ActionButton>
      </ButtonGroup>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab icon={<BarChartIcon />} label="Overview" />
        <Tab icon={<MoneyIcon />} label="Revenues" />
        <Tab icon={<PieChartIcon />} label="Expenses" />
        <Tab icon={<TimelineIcon />} label="Transactions" />
        <Tab icon={<ReceiptIcon />} label="Invoices" />
      </Tabs>
      <Fade in={true}>
        <Box>{renderContent()}</Box>
      </Fade>

      {/* Modals */}
      {['addRevenue', 'addExpense', 'addInvoice'].map((modal) => (
        <Dialog
          key={modal}
          open={modalState[modal]}
          onClose={() => toggleModal(modal, false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {modal === 'addRevenue' ? 'Add Revenue' : 
             modal === 'addExpense' ? 'Add Expense' : 'Create Invoice'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
            />
            <TextField
              margin="dense"
              label="Amount"
              fullWidth
              variant="outlined"
              type="number"
            />
            <TextField
              margin="dense"
              label="Date"
              fullWidth
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            {modal === 'addInvoice' && (
              <TextField
                margin="dense"
                label="Due Date"
                fullWidth
                variant="outlined"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => toggleModal(modal, false)}>Cancel</Button>
            <Button onClick={() => toggleModal(modal, false)} color="primary">Add</Button>
          </DialogActions>
        </Dialog>
      ))}

      {/* Menus */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={() => handleSort('date')}>Sort by Date</MenuItem>
        <MenuItem onClick={() => handleSort('amount')}>Sort by Amount</MenuItem>
      </Menu>
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleFilter('all')}>Show All</MenuItem>
        <MenuItem onClick={() => handleFilter('credit')}>Show Revenues</MenuItem>
        <MenuItem onClick={() => handleFilter('debit')}>Show Expenses</MenuItem>
      </Menu>
    </PageWrapper>
  );
};

// Sample data for demonstration purposes
const transactions = [
  { id: 1, name: 'Rent Payment', date: '2024-01-01', amount: 1000, type: 'credit' },
  { id: 2, name: 'Electricity Bill', date: '2024-01-05', amount: 150, type: 'debit' },
  { id: 3, name: 'Maintenance Fee', date: '2024-01-10', amount: 200, type: 'debit' },
  { id: 4, name: 'Tenant Deposit', date: '2024-01-15', amount: 500, type: 'credit' },
  { id: 5, name: 'Property Tax', date: '2024-01-20', amount: 300, type: 'debit' },
];

const invoices = [
  { id: 'INV-001', date: '2024-01-01', description: 'January Rent', amount: 1000, status: 'Paid' },
  { id: 'INV-002', date: '2024-02-01', description: 'February Rent', amount: 1000, status: 'Pending' },
  { id: 'INV-003', date: '2024-03-01', description: 'March Rent', amount: 1000, status: 'Overdue' },
];

export default Finances;