import React, { useState } from 'react';
import { TextField, Typography, Box, Button, Tooltip, Grid, InputAdornment, Snackbar, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';

const AustralianTaxModule = ({ onDownload }) => {
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

    // Australian income tax rates (simplified)
    let incomeTax;
    if (income <= 18200) {
      incomeTax = 0;
    } else if (income <= 45000) {
      incomeTax = (income - 18200) * 0.19;
    } else if (income <= 120000) {
      incomeTax = 5092 + (income - 45000) * 0.325;
    } else if (income <= 180000) {
      incomeTax = 29467 + (income - 120000) * 0.37;
    } else {
      incomeTax = 51667 + (income - 180000) * 0.45;
    }

    // Simplified Land Tax Calculation (varies by state)
    const landTax = propertyValue * 0.002; // Assume 0.2% of property value

    // Capital Gains Tax Calculation (assuming 50% discount on capital gains)
    const cgTax = capitalGains * 0.225; // 45% tax rate * 50% discount

    setCalculatedTax(incomeTax.toFixed(2));
    setPropertyTax(landTax.toFixed(2));
    setCapitalGainsTax(cgTax.toFixed(2));
    setSnackbarOpen(false);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        Australian Tax Management
      </Typography>

      {/* Income and Property Value Input */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Annual Income (AUD)"
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
            label="Property Value (AUD)"
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
          label="Capital Gains (AUD)"
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
          <Typography variant="h6">Income Tax Due: AUD {calculatedTax}</Typography>
          <Typography variant="h6">Property Tax Due: AUD {propertyTax}</Typography>
          <Typography variant="h6">Capital Gains Tax Due: AUD {capitalGainsTax}</Typography>
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

export default AustralianTaxModule;
