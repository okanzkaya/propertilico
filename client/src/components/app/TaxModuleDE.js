import React, { useState } from 'react';
import { TextField, Typography, Box, Button, Tooltip, Grid, InputAdornment, Snackbar, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';

const GermanTaxModule = ({ onDownload }) => {
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

    // German income tax rates (simplified)
    let incomeTax;
    if (income <= 9744) {
      incomeTax = 0; // No tax for income under €9,744
    } else if (income <= 57918) {
      incomeTax = ((income - 9744) * 0.14) + 1400; // Progressive tax rate starting from 14%
    } else if (income <= 274612) {
      incomeTax = ((income - 57918) * 0.42) + 8963.74; // 42% for income over €57,918
    } else {
      incomeTax = ((income - 274612) * 0.45) + 40937.22; // 45% for income over €274,612
    }

    // Property Tax Calculation (Grunderwerbsteuer, varies by state, assume 3.5%)
    const landTax = propertyValue * 0.035;

    // Capital Gains Tax (25% flat rate plus 5.5% solidarity surcharge)
    const cgTax = capitalGains * 0.26475;

    setCalculatedTax(incomeTax.toFixed(2));
    setPropertyTax(landTax.toFixed(2));
    setCapitalGainsTax(cgTax.toFixed(2));
    setSnackbarOpen(false);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        German Tax Management
      </Typography>

      {/* Income and Property Value Input */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Annual Income (€)"
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
            label="Property Value (€)"
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
          label="Capital Gains (€)"
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
          <Typography variant="h6">Income Tax Due: €{calculatedTax}</Typography>
          <Typography variant="h6">Property Tax Due: €{propertyTax}</Typography>
          <Typography variant="h6">Capital Gains Tax Due: €{capitalGainsTax}</Typography>
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

export default GermanTaxModule;
