import React, { useState, useMemo } from 'react';
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
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Menu,
  MenuItem as MenuListItem,
} from '@mui/material';
import { styled, useTheme } from '@mui/system';
import Chart from 'react-apexcharts';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const ChartCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.spacing(1),
  height: '100%',
}));

const ButtonWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const IconGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const commonChartOptions = {
  chart: { toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent' },
  stroke: { curve: 'smooth' },
  tooltip: { x: { format: 'dd/MM/yy HH:mm' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    labels: { style: { fontSize: '12px' }, rotate: -45 },
  },
  grid: { padding: { bottom: 10 } },
};

const Finances = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [modalState, setModalState] = useState({
    revenueModalOpen: false,
    expenseModalOpen: false,
    addRevenueOpen: false,
    addExpenseOpen: false,
    transactionsModalOpen: false,
    addInvoiceOpen: false,
  });
  const [tabValue, setTabValue] = useState(0);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleModal = (modal, state) => setModalState((prev) => ({ ...prev, [modal]: state }));

  const handleTabChange = (_, newValue) => setTabValue(newValue);

  const handleSortClick = (event) => setSortAnchorEl(event.currentTarget);
  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);

  const handleSortClose = () => setSortAnchorEl(null);
  const handleFilterClose = () => setFilterAnchorEl(null);

  const handleSortOption = (option) => {
    // Handle sort logic here
    console.log('Sort by:', option);
    setSortAnchorEl(null);
  };

  const handleFilterOption = (option) => {
    // Handle filter logic here
    console.log('Filter by:', option);
    setFilterAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTransactions = useMemo(
    () => recentTransactions.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const revenueSeries = [{ name: 'Revenues', data: [65, 59, 80, 81, 56, 55, 40, 70, 60, 75, 85, 90] }];
  const expensesSeries = [{ name: 'Expenses', data: [28, 48, 40, 19, 86, 27, 90, 45, 55, 65, 30, 50] }];
  const profitSeries = [{ name: 'Profit', data: [37, 11, 40, 62, -30, 28, -50, 25, 5, 25, 55, 40] }];
  const monthlyGoalSeries = [{ name: 'Monthly Goal Progress', data: [70] }];
  const annualGoalSeries = [{ name: 'Annual Goal Progress', data: [40] }];
  const invoices = [
    { id: 1, name: 'Invoice #001', date: '2024-01-01', amount: 1000, status: 'Paid' },
    { id: 2, name: 'Invoice #002', date: '2024-01-10', amount: 200, status: 'Pending' },
  ];

  const chartComponent = (title, series, chartType = 'line') => (
    <ChartCard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <Tooltip title={`This chart shows the monthly ${title.toLowerCase()}.`} placement="top">
          <IconButton><InfoIcon /></IconButton>
        </Tooltip>
      </Box>
      <Chart
        options={{
          ...commonChartOptions,
          chart: { ...commonChartOptions.chart, type: chartType },
          theme: { mode: isDarkMode ? 'dark' : 'light' },
        }}
        series={series}
        type={chartType}
        height={300}
      />
    </ChartCard>
  );

  const progressChartComponent = (title, series) => (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <Typography variant="h6" mb={2}>{title}</Typography>
      <Chart
        options={{
          chart: { type: 'radialBar', background: 'transparent' },
          plotOptions: {
            radialBar: {
              dataLabels: {
                name: { fontSize: '18px', offsetY: -10, color: isDarkMode ? '#FFFFFF' : '#333333' },
                value: { fontSize: '16px', offsetY: 5, color: isDarkMode ? '#FFFFFF' : '#333333' },
              },
              hollow: { size: '60%' },
              track: {
                background: isDarkMode ? '#4E4E4E' : '#f2f2f2',
                strokeWidth: '97%',
                margin: 5,
                dropShadow: {
                  enabled: true,
                  top: 2,
                  left: 0,
                  blur: 4,
                  opacity: 0.15,
                },
              },
            },
          },
          theme: { mode: isDarkMode ? 'dark' : 'light' },
        }}
        series={series[0].data}
        type="radialBar"
        height={200}
      />
    </Box>
  );

  return (
    <PageWrapper>
      <Typography variant="h5" gutterBottom>Finances & Accounting</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {['Overview', 'Revenues', 'Expenses', 'Transactions', 'Invoices'].map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>{chartComponent('Revenues', revenueSeries)}</Grid>
          <Grid item xs={12} md={6}>{chartComponent('Expenses', expensesSeries)}</Grid>
          <Grid item xs={12} md={6}>{chartComponent('Profit', profitSeries)}</Grid>
          <Grid item xs={12} md={6}>
            <ChartCard>
              {progressChartComponent('Monthly Goal Progress', monthlyGoalSeries)}
              {progressChartComponent('Annual Goal Progress', annualGoalSeries)}
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ButtonWrapper>
              <Button variant="contained" color="primary" startIcon={<AddCircleIcon />} fullWidth
                onClick={() => toggleModal('addRevenueOpen', true)}>
                Record Revenue
              </Button>
            </ButtonWrapper>
          </Grid>
          <Grid item xs={12}>
            <ChartCard>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Revenues</Typography>
                <IconGroup>
                  <IconButton size="small" onClick={handleFilterClick}>
                    <FilterListIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleSortClick}>
                    <SortIcon />
                  </IconButton>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search Revenues"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginLeft: 2 }}
                    InputProps={{
                      startAdornment: <SearchIcon position="start" />,
                    }}
                  />
                </IconGroup>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions
                      .filter((t) => t.type === 'credit')
                      .map((transaction) => (
                        <TableRow key={transaction.id} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.name}</TableCell>
                          <TableCell align="right">+ ${transaction.amount}</TableCell>
                          <TableCell align="right">{transaction.type}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ButtonWrapper>
              <Button variant="contained" color="primary" startIcon={<RemoveCircleIcon />} fullWidth
                onClick={() => toggleModal('addExpenseOpen', true)}>
                Record Expense
              </Button>
            </ButtonWrapper>
          </Grid>
          <Grid item xs={12}>
            <ChartCard>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Expenses</Typography>
                <IconGroup>
                  <IconButton size="small" onClick={handleFilterClick}>
                    <FilterListIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleSortClick}>
                    <SortIcon />
                  </IconButton>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search Expenses"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginLeft: 2 }}
                    InputProps={{
                      startAdornment: <SearchIcon position="start" />,
                    }}
                  />
                </IconGroup>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions
                      .filter((t) => t.type === 'debit')
                      .map((transaction) => (
                        <TableRow key={transaction.id} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.name}</TableCell>
                          <TableCell align="right">- ${transaction.amount}</TableCell>
                          <TableCell align="right">{transaction.type}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Transactions</Typography>
                <IconGroup>
                  <IconButton size="small" onClick={handleFilterClick}>
                    <FilterListIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleSortClick}>
                    <SortIcon />
                  </IconButton>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search Transactions"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginLeft: 2 }}
                    InputProps={{
                      startAdornment: <SearchIcon position="start" />,
                    }}
                  />
                </IconGroup>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.name}</TableCell>
                        <TableCell align="right">{transaction.type === 'credit' ? `+ $${transaction.amount}` : `- $${transaction.amount}`}</TableCell>
                        <TableCell align="right">{transaction.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ButtonWrapper>
              <Button variant="contained" color="primary" startIcon={<ReceiptIcon />} fullWidth
                onClick={() => toggleModal('addInvoiceOpen', true)}>
                Create Invoice
              </Button>
            </ButtonWrapper>
          </Grid>
          <Grid item xs={12}>
            <ChartCard>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Invoices</Typography>
                <IconGroup>
                  <IconButton size="small" onClick={handleFilterClick}>
                    <FilterListIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleSortClick}>
                    <SortIcon />
                  </IconButton>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search Invoices"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginLeft: 2 }}
                    InputProps={{
                      startAdornment: <SearchIcon position="start" />,
                    }}
                  />
                </IconGroup>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.name}</TableCell>
                        <TableCell align="right">${invoice.amount}</TableCell>
                        <TableCell align="right" color={invoice.status === 'Paid' ? 'success.main' : 'warning.main'}>
                          {invoice.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {/* Modals */}
      {['revenueModalOpen', 'expenseModalOpen', 'addRevenueOpen', 'addExpenseOpen', 'transactionsModalOpen', 'addInvoiceOpen'].map((modal) => (
        <Dialog
          key={modal}
          open={modalState[modal]}
          onClose={() => toggleModal(modal, false)}
          fullWidth
          maxWidth={modal.includes('add') ? 'sm' : 'md'}
        >
          <DialogTitle>{modal.includes('revenue') ? 'Detailed Revenues' : modal.includes('expense') ? 'Detailed Expenses' : modal.includes('transactions') ? 'All Transactions' : 'Create Invoice'}</DialogTitle>
          <DialogContent>
            {modal.includes('revenue') || modal.includes('expense') ? (
              <Chart
                options={{
                  ...commonChartOptions,
                  chart: { ...commonChartOptions.chart, toolbar: { show: true, tools: { download: true } } },
                  theme: { mode: isDarkMode ? 'dark' : 'light' },
                }}
                series={modal.includes('revenue') ? revenueSeries : expensesSeries}
                type="line"
                height={500}
              />
            ) : modal.includes('add') ? (
              <>
                <TextField autoFocus margin="dense" label={modal.includes('Revenue') ? 'Revenue Name' : 'Expense Name'} fullWidth variant="outlined" />
                <TextField margin="dense" label="Amount" fullWidth variant="outlined" type="number" />
                <TextField margin="dense" label="Date" fullWidth variant="outlined" type="date" InputLabelProps={{ shrink: true }} />
              </>
            ) : (
              filteredTransactions.map((transaction) => (
                <Box key={transaction.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:nth-of-type(even)': { backgroundColor: theme.palette.action.hover } }}>
                  <Box>
                    <Typography variant="body1">{transaction.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{transaction.date}</Typography>
                  </Box>
                  <Typography variant="body1" color={transaction.type === 'credit' ? 'success.main' : 'error.main'}>
                    {transaction.type === 'credit' ? `+ $${transaction.amount}` : `- $${transaction.amount}`}
                  </Typography>
                </Box>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => toggleModal(modal, false)} color="primary">Close</Button>
            {modal.includes('add') && <Button onClick={() => toggleModal(modal, false)} color="primary">Add</Button>}
          </DialogActions>
        </Dialog>
      ))}

      {/* Sort and Filter Menus */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuListItem onClick={() => handleSortOption('Date')}>Sort by Date</MenuListItem>
        <MenuListItem onClick={() => handleSortOption('Amount')}>Sort by Amount</MenuListItem>
      </Menu>
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuListItem onClick={() => handleFilterOption('Paid')}>Filter by Paid</MenuListItem>
        <MenuListItem onClick={() => handleFilterOption('Pending')}>Filter by Pending</MenuListItem>
      </Menu>
    </PageWrapper>
  );
};

export default Finances;

const recentTransactions = [
  { id: 1, name: 'Rent', date: '2024-01-01', amount: 1000, type: 'credit' },
  { id: 2, name: 'Electricity', date: '2024-01-05', amount: 200, type: 'debit' },
  { id: 3, name: 'Water', date: '2024-01-10', amount: 150, type: 'debit' },
  { id: 4, name: 'Rent', date: '2024-02-01', amount: 1000, type: 'credit' },
];
