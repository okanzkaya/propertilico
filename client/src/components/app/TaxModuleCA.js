import React, { useState } from 'react';
import { TextField, Typography, Box, Button, Tooltip, Grid, InputAdornment, Snackbar, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';

const CanadianTaxModule = ({ onDownload }) => {
  const [income, setIncome] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [capitalGains, setCapitalGains] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [calculatedTax, setCalculatedTax] = useState('');
  const [propertyTax, setPropertyTax] = useState('');
  const [capitalGainsTax, setCapitalGainsTax] = useState('');

  const handleCalculation = () => {
    if (!income || !propertyValue) {
      setError("Please fill in all required fields.");
      setSnackbarOpen(true);
      return;
    }

    // Canadian income tax rates (simplified for example)
    let incomeTax;
    if (income <= 50197) {
      incomeTax = income * 0.15; // 15% federal tax rate
    } else if (income <= 100392) {
      incomeTax = 7529.55 + (income - 50197) * 0.205; // 20.5% for income over $50,197
    } else if (income <= 155625) {
      incomeTax = 15725.26 + (income - 100392) * 0.26; // 26% for income over $100,392
    } else if (income <= 221708) {
      incomeTax = 29710.73 + (income - 155625) * 0.29; // 29% for income over $155,625
    } else {
      incomeTax = 46644.31 + (income - 221708) * 0.33; // 33% for income over $221,708
    }

    // Property Tax Calculation (varies by province, assume 1% for this example)
    const landTax = propertyValue * 0.01;

    // Capital Gains Tax (assuming 50% of the capital gains are taxable)
    const cgTax = (capitalGains * 0.5) * 0.33; // Assume the highest tax rate for simplicity

    setCalculatedTax(incomeTax.toFixed(2));
    setPropertyTax(landTax.toFixed(2));
    setCapitalGainsTax(cgTax.toFixed(2));
    setSnackbarOpen(false);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        Canadian Tax Management
      </Typography>

      {/* Income and Property Value Input */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Annual Income (CAD)"
            fullWidth
            variant="outlined"
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <Tooltip title="Enter your total annual income" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Property Value (CAD)"
            fullWidth
            variant="outlined"
            type="number"
            value={propertyValue}
            onChange={(e) => setPropertyValue(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <Tooltip title="Enter the market value of the property" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
            required
          />
        </Grid>
      </Grid>

      {/* Capital Gains Input */}
      <Box mt={3}>
        <TextField
          margin="dense"
          label="Capital Gains (CAD)"
          fullWidth
          variant="outlined"
          type="number"
          value={capitalGains}
          onChange={(e) => setCapitalGains(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoneyIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <Tooltip title="Enter the capital gains from property sale" placement="top">
                <InfoIcon />
              </Tooltip>
            ),
          }}
        />
      </Box>

      {/* Calculation Button */}
      <Box mt={4}>
        <Button
          variant="contained"
          startIcon={<CalculateIcon />}
          onClick={handleCalculation}
          fullWidth
        >
          Calculate Taxes
        </Button>
      </Box>

      {/* Tax Results */}
      {calculatedTax && (
        <Box mt={3}>
          <Typography variant="h6">Income Tax Due: CAD {calculatedTax}</Typography>
          <Typography variant="h6">Property Tax Due: CAD {propertyTax}</Typography>
          <Typography variant="h6">Capital Gains Tax Due: CAD {capitalGainsTax}</Typography>
        </Box>
      )}

      {/* Snackbar for Error Messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CanadianTaxModule;
