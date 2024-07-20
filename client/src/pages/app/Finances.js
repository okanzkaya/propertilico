import React, { useState } from 'react';
import { Typography, Grid, Box, Card, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Tabs, Tab, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress } from '@mui/material';
import { styled } from '@mui/system';
import Chart from 'react-apexcharts';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: '2rem',
  boxSizing: 'border-box',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
}));

const ChartCard = styled(Card)(({ theme }) => ({
  padding: '1rem',
  marginBottom: '1rem',
}));

const ButtonWrapper = styled(Box)(({ theme }) => ({
  marginTop: '1rem',
  marginBottom: '2rem',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const commonChartOptions = {
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  stroke: { curve: 'smooth' },
  xaxis: {
    categories: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    labels: { style: { fontSize: '12px' }, rotate: -45 },
  },
  tooltip: { x: { format: 'dd/MM/yy HH:mm' } },
  dataLabels: { enabled: false },
  grid: { padding: { bottom: 10 } },
};

const revenueSeries = [
  { name: 'Revenues', data: [65, 59, 80, 81, 56, 55, 40, 70, 60, 75, 85, 90] },
];

const expensesSeries = [
  { name: 'Expenses', data: [28, 48, 40, 19, 86, 27, 90, 45, 55, 65, 30, 50] },
];

const categories = ['Rent', 'Utilities', 'Maintenance', 'Miscellaneous'];

const recentTransactions = [
  { id: 1, name: 'Rent', date: '2024-01-01', amount: 1000, type: 'credit' },
  { id: 2, name: 'Electricity', date: '2024-01-05', amount: 200, type: 'debit' },
  { id: 3, name: 'Water', date: '2024-01-10', amount: 150, type: 'debit' },
  { id: 4, name: 'Rent', date: '2024-02-01', amount: 1000, type: 'credit' },
];

const invoices = [
  { id: 1, name: 'Invoice #001', date: '2024-01-01', amount: 1000, status: 'Paid' },
  { id: 2, name: 'Invoice #002', date: '2024-01-10', amount: 200, status: 'Pending' },
];

const Finances = () => {
  const [modalState, setModalState] = useState({
    revenueModalOpen: false,
    expenseModalOpen: false,
    addRevenueOpen: false,
    addExpenseOpen: false,
    transactionsModalOpen: false,
    addInvoiceOpen: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const toggleModal = (modal, state) => setModalState({ ...modalState, [modal]: state });

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const filteredTransactions = recentTransactions.filter((transaction) =>
    transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Finances & Accounting</Typography>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Overview" />
        <Tab label="Revenues" />
        <Tab label="Expenses" />
        <Tab label="Transactions" />
        <Tab label="Invoices" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>Revenues</Typography>
                  <Tooltip title="This chart shows the monthly revenue." placement="top">
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Chart options={commonChartOptions} series={revenueSeries} type="line" height={300} />
                <ButtonWrapper>
                  <StyledButton variant="contained" color="primary" fullWidth onClick={() => toggleModal('revenueModalOpen', true)}>View Detailed Revenues</StyledButton>
                  <StyledButton variant="contained" color="secondary" startIcon={<AddCircleIcon />} fullWidth onClick={() => toggleModal('addRevenueOpen', true)}>Record Revenue</StyledButton>
                </ButtonWrapper>
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>Expenses</Typography>
                  <Tooltip title="This chart shows the monthly expenses." placement="top">
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Chart options={commonChartOptions} series={expensesSeries} type="line" height={300} />
                <ButtonWrapper>
                  <StyledButton variant="contained" color="primary" fullWidth onClick={() => toggleModal('expenseModalOpen', true)}>View Detailed Expenses</StyledButton>
                  <StyledButton variant="contained" color="secondary" startIcon={<RemoveCircleIcon />} fullWidth onClick={() => toggleModal('addExpenseOpen', true)}>Record Expense</StyledButton>
                </ButtonWrapper>
              </ChartCard>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                  <Tooltip title="This chart shows the breakdown of categories." placement="top">
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Chart
                  options={{ ...commonChartOptions, chart: { type: 'pie' }, labels: categories }}
                  series={[44, 55, 13, 33]}
                  type="pie"
                  height={300}
                />
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>Progress</Typography>
                  <Tooltip title="This chart shows the progress of financial goals." placement="top">
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box mt={2}>
                  <Typography variant="body1" gutterBottom>Monthly Goal</Typography>
                  <LinearProgress variant="determinate" value={70} />
                  <Typography variant="body1" gutterBottom>Annual Goal</Typography>
                  <LinearProgress variant="determinate" value={40} />
                </Box>
              </ChartCard>
            </Grid>
          </Grid>
        </>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ButtonWrapper>
              <StyledButton variant="contained" color="primary" startIcon={<AddCircleIcon />} onClick={() => toggleModal('addRevenueOpen', true)}>Record Revenue</StyledButton>
            </ButtonWrapper>
          </Grid>
          <Grid item xs={12}>
            <ChartCard>
              <Typography variant="h6" gutterBottom>Revenues</Typography>
              {recentTransactions.filter(t => t.type === 'credit').map((transaction) => (
                <Box key={transaction.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">{transaction.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{transaction.date}</Typography>
                  </Box>
                  <Typography variant="body1" color="success.main">+ ${transaction.amount}</Typography>
                </Box>
              ))}
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ButtonWrapper>
              <StyledButton variant="contained" color="primary" startIcon={<RemoveCircleIcon />} onClick={() => toggleModal('addExpenseOpen', true)}>Record Expense</StyledButton>
            </ButtonWrapper>
          </Grid>
          <Grid item xs={12}>
            <ChartCard>
              <Typography variant="h6" gutterBottom>Expenses</Typography>
              {recentTransactions.filter(t => t.type === 'debit').map((transaction) => (
                <Box key={transaction.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">{transaction.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{transaction.date}</Typography>
                  </Box>
                  <Typography variant="body1" color="error.main">- ${transaction.amount}</Typography>
                </Box>
              ))}
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                <TextField
                  variant="outlined"
                  placeholder="Search Transactions"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{ startAdornment: (<SearchIcon position="start" />) }}
                />
              </Box>
              <TableContainer component={Paper}>
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
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.name}</TableCell>
                        <TableCell align="right">{transaction.type === 'credit' ? `+ $${transaction.amount}` : `- $${transaction.amount}`}</TableCell>
                        <TableCell align="right">{transaction.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <ButtonWrapper>
                <StyledButton variant="contained" color="primary" fullWidth onClick={() => toggleModal('transactionsModalOpen', true)}>View All Transactions</StyledButton>
              </ButtonWrapper>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ButtonWrapper>
              <StyledButton variant="contained" color="primary" startIcon={<ReceiptIcon />} onClick={() => toggleModal('addInvoiceOpen', true)}>Create Invoice</StyledButton>
            </ButtonWrapper>
          </Grid>
          <Grid item xs={12}>
            <ChartCard>
              <Typography variant="h6" gutterBottom>Invoices</Typography>
              {invoices.map((invoice) => (
                <Box key={invoice.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">{invoice.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{invoice.date}</Typography>
                  </Box>
                  <Typography variant="body1" color={invoice.status === 'Paid' ? 'success.main' : 'warning.main'}>
                    {invoice.status} - ${invoice.amount}
                  </Typography>
                </Box>
              ))}
            </ChartCard>
          </Grid>
        </Grid>
      )}

      <Dialog open={modalState.revenueModalOpen} onClose={() => toggleModal('revenueModalOpen', false)} fullWidth maxWidth="md">
        <DialogTitle>Detailed Revenues</DialogTitle>
        <DialogContent>
          <Chart options={{ ...commonChartOptions, chart: { ...commonChartOptions.chart, toolbar: { show: true, tools: { download: true } } } }} series={revenueSeries} type="line" height={500} />
          <Box mt={2}>
            <Typography variant="body1" gutterBottom>Detailed revenue information goes here. You can add more statistics, graphs, or any other relevant information.</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleModal('revenueModalOpen', false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalState.expenseModalOpen} onClose={() => toggleModal('expenseModalOpen', false)} fullWidth maxWidth="md">
        <DialogTitle>Detailed Expenses</DialogTitle>
        <DialogContent>
          <Chart options={{ ...commonChartOptions, chart: { ...commonChartOptions.chart, toolbar: { show: true, tools: { download: true } } } }} series={expensesSeries} type="line" height={500} />
          <Box mt={2}>
            <Typography variant="body1" gutterBottom>Detailed expense information goes here. You can add more statistics, graphs, or any other relevant information.</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleModal('expenseModalOpen', false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalState.addRevenueOpen} onClose={() => toggleModal('addRevenueOpen', false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Revenue</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Revenue Name" fullWidth variant="outlined" />
          <TextField margin="dense" label="Amount" fullWidth variant="outlined" type="number" />
          <TextField margin="dense" label="Date" fullWidth variant="outlined" type="date" InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Category" fullWidth variant="outlined" select>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleModal('addRevenueOpen', false)} color="primary">Cancel</Button>
          <Button onClick={() => toggleModal('addRevenueOpen', false)} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalState.addExpenseOpen} onClose={() => toggleModal('addExpenseOpen', false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Expense Name" fullWidth variant="outlined" />
          <TextField margin="dense" label="Amount" fullWidth variant="outlined" type="number" />
          <TextField margin="dense" label="Date" fullWidth variant="outlined" type="date" InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Category" fullWidth variant="outlined" select>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleModal('addExpenseOpen', false)} color="primary">Cancel</Button>
          <Button onClick={() => toggleModal('addExpenseOpen', false)} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalState.transactionsModalOpen} onClose={() => toggleModal('transactionsModalOpen', false)} fullWidth maxWidth="md">
        <DialogTitle>All Transactions</DialogTitle>
        <DialogContent>
          {filteredTransactions.map((transaction) => (
            <Box key={transaction.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1">{transaction.name}</Typography>
                <Typography variant="body2" color="textSecondary">{transaction.date}</Typography>
              </Box>
              <Typography variant="body1" color={transaction.type === 'credit' ? 'success.main' : 'error.main'}>
                {transaction.type === 'credit' ? `+ $${transaction.amount}` : `- $${transaction.amount}`}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleModal('transactionsModalOpen', false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalState.addInvoiceOpen} onClose={() => toggleModal('addInvoiceOpen', false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Invoice Name" fullWidth variant="outlined" />
          <TextField margin="dense" label="Amount" fullWidth variant="outlined" type="number" />
          <TextField margin="dense" label="Date" fullWidth variant="outlined" type="date" InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Status" fullWidth variant="outlined" select>
            {['Paid', 'Pending', 'Overdue'].map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleModal('addInvoiceOpen', false)} color="primary">Cancel</Button>
          <Button onClick={() => toggleModal('addInvoiceOpen', false)} color="primary">Create</Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

export default Finances;
