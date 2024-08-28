import React, { useState } from 'react';
import { TextField, Typography, Box, Button, Tooltip, Grid, InputAdornment, Snackbar, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';

const DefaultTaxModule = ({ onDownload }) => {
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

    // Basic income tax calculation (example rate)
    const incomeTax = income * 0.25; // Assuming a flat 25% tax rate

    // Basic property tax calculation (example rate)
    const landTax = propertyValue * 0.01; // Assuming 1% of property value

    // Basic capital gains tax calculation (example rate)
    const cgTax = capitalGains * 0.2; // Assuming a 20% tax rate on capital gains

    setCalculatedTax(incomeTax.toFixed(2));
    setPropertyTax(landTax.toFixed(2));
    setCapitalGainsTax(cgTax.toFixed(2));
    setSnackbarOpen(false);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        Default Tax Management
      </Typography>

      {/* Income and Property Value Input */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Annual Income (Local Currency)"
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
            label="Property Value (Local Currency)"
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
          label="Capital Gains (Local Currency)"
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
          <Typography variant="h6">Income Tax Due: {calculatedTax}</Typography>
          <Typography variant="h6">Property Tax Due: {propertyTax}</Typography>
          <Typography variant="h6">Capital Gains Tax Due: {capitalGainsTax}</Typography>
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

export default DefaultTaxModule;
