import React, { useState } from 'react';
import { TextField, Typography, Box, Button, Tooltip, FormControl, InputLabel, Select, MenuItem, Grid, InputAdornment, Snackbar, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';

const UKPropertyTaxModule = () => {
  const [propertyValue, setPropertyValue] = useState('');
  const [rentalIncome, setRentalIncome] = useState('');
  const [taxPaid, setTaxPaid] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [incomeTaxBand, setIncomeTaxBand] = useState('');
  const [calculatedTax, setCalculatedTax] = useState('');
  const [sdlt, setSdlt] = useState('');
  const [councilTax, setCouncilTax] = useState('');
  const [capitalGains, setCapitalGains] = useState('');

  const handleCalculation = () => {
    if (!propertyValue || !incomeTaxBand) {
      setError("Please fill in all required fields.");
      setSnackbarOpen(true);
      return;
    }

    // Calculate SDLT (simplified version)
    const sdltRates = [
      { threshold: 250000, rate: 0.05 }, // 5% for properties over £250,000
      { threshold: 925000, rate: 0.10 }, // 10% for properties over £925,000
      { threshold: 1500000, rate: 0.12 }, // 12% for properties over £1.5 million
    ];
    let calculatedSdlt = 0;
    let remainingValue = parseFloat(propertyValue);

    sdltRates.forEach(rate => {
      if (remainingValue > rate.threshold) {
        calculatedSdlt += rate.rate * (remainingValue - rate.threshold);
        remainingValue = rate.threshold;
      }
    });

    // Calculate income tax on rental income
    const incomeTaxRates = {
      'basic': 0.20,
      'higher': 0.40,
      'additional': 0.45,
    };
    const rentalIncomeTax = parseFloat(rentalIncome) * incomeTaxRates[incomeTaxBand];

    // Capital Gains Tax (CGT) on property (simplified calculation)
    const capitalGainsTaxRate = incomeTaxBand === 'basic' ? 0.18 : 0.28; // 18% or 28% CGT rate based on income tax band
    const capitalGainsTax = parseFloat(capitalGains) * capitalGainsTaxRate;

    // Council Tax is typically a fixed amount based on property value and local authority; we'll assume an average
    const councilTaxAmount = parseFloat(propertyValue) * 0.01;

    const totalTax = calculatedSdlt + rentalIncomeTax + capitalGainsTax + councilTaxAmount;

    setSdlt(calculatedSdlt.toFixed(2));
    setCalculatedTax(totalTax.toFixed(2));
    setCouncilTax(councilTaxAmount.toFixed(2));
    setSnackbarOpen(false);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        UK Property Tax Calculator
      </Typography>
      
      {/* Property Value and Income Tax Band */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Property Value (£)"
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
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Income Tax Band</InputLabel>
            <Select
              label="Income Tax Band"
              value={incomeTaxBand}
              onChange={(e) => setIncomeTaxBand(e.target.value)}
              required
            >
              <MenuItem value="basic">Basic Rate (20%)</MenuItem>
              <MenuItem value="higher">Higher Rate (40%)</MenuItem>
              <MenuItem value="additional">Additional Rate (45%)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Rental Income and Capital Gains */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Annual Rental Income (£)"
            fullWidth
            variant="outlined"
            type="number"
            value={rentalIncome}
            onChange={(e) => setRentalIncome(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <Tooltip title="Enter the total annual rental income" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Capital Gains (£)"
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
                <Tooltip title="Enter the capital gains on property sale" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* Tax Calculation */}
      <Box mt={4}>
        <Button
          variant="contained"
          startIcon={<CalculateIcon />}
          onClick={handleCalculation}
          fullWidth
        >
          Calculate Property Taxes
        </Button>
        {calculatedTax && (
          <Box mt={3}>
            <Typography variant="h6">Stamp Duty Land Tax (SDLT): £{sdlt}</Typography>
            <Typography variant="h6">Council Tax: £{councilTax}</Typography>
            <Typography variant="h6">Total Property Taxes Due: £{calculatedTax}</Typography>
          </Box>
        )}
      </Box>

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

export default UKPropertyTaxModule;
