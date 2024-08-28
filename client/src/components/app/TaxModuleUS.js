import React, { useState, useEffect } from 'react';
import { TextField, Typography, Box, Button, Tooltip, FormControl, InputLabel, Select, MenuItem, Grid, InputAdornment, Snackbar, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';

const USTaxModule = () => {
  const [selectedState, setSelectedState] = useState('');
  const [taxWithheld, setTaxWithheld] = useState('');
  const [stateTaxWithheld, setStateTaxWithheld] = useState('');
  const [localTaxWithheld, setLocalTaxWithheld] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [propertyTax, setPropertyTax] = useState('');
  const [incomeBracket, setIncomeBracket] = useState('');
  const [homesteadExemption, setHomesteadExemption] = useState('');
  const [seniorCitizenExemption, setSeniorCitizenExemption] = useState('');
  const [disabilityExemption, setDisabilityExemption] = useState('');
  const [totalTaxableIncome, setTotalTaxableIncome] = useState('');
  const [totalTaxLiability, setTotalTaxLiability] = useState('');
  const [capitalGains, setCapitalGains] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getStateTaxData = (state) => {
    const stateTaxData = {
      CA: { rate: 0.013, homesteadExemption: 7000, seniorExemption: 5000 },
      TX: { rate: 0.018, homesteadExemption: 25000, seniorExemption: 10000 },
      // Add more states here
    };
    return stateTaxData[state] || {};
  };

  const calculatePropertyTax = () => {
    if (!propertyValue || !taxWithheld || !totalTaxableIncome) {
      setError("Please fill in all required fields.");
      setSnackbarOpen(true);
      return;
    }

    const stateData = getStateTaxData(selectedState);
    const totalExemptions = parseFloat(homesteadExemption) + parseFloat(seniorCitizenExemption) + parseFloat(disabilityExemption);
    const taxableValue = Math.max(0, parseFloat(propertyValue) - totalExemptions);
    const calculatedTax = (taxableValue * stateData.rate) - parseFloat(taxWithheld);
    const adjustedIncome = parseFloat(totalTaxableIncome) - (totalExemptions + parseFloat(otherDeductions));
    const totalTax = (adjustedIncome * getTaxRate(incomeBracket)) - parseFloat(stateTaxWithheld) - parseFloat(localTaxWithheld);
    const capitalGainsTax = parseFloat(capitalGains) * getCapitalGainsTaxRate();

    setPropertyTax(calculatedTax.toFixed(2));
    setTotalTaxLiability((totalTax + capitalGainsTax).toFixed(2));
    setSnackbarOpen(false);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const getTaxRate = (bracket) => {
    switch(bracket) {
      case 'low': return 0.1;
      case 'middle': return 0.22;
      case 'high': return 0.37;
      default: return 0;
    }
  };

  const getCapitalGainsTaxRate = () => 0.15;

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        U.S. Tax Management
      </Typography>

      {/* State Selection and Property Value */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="dense">
            <InputLabel>State</InputLabel>
            <Select
              label="State"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              required
            >
              <MenuItem value="CA">California</MenuItem>
              <MenuItem value="TX">Texas</MenuItem>
              <MenuItem value="NY">New York</MenuItem>
              {/* Add more states here */}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            label="Property Value"
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

      {/* Federal Tax Information */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Federal Tax Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Federal Income Bracket</InputLabel>
              <Select
                label="Federal Income Bracket"
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                required
              >
                <MenuItem value="low">Low (10%)</MenuItem>
                <MenuItem value="middle">Middle (22%)</MenuItem>
                <MenuItem value="high">High (37%)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Federal Tax Withheld"
              fullWidth
              variant="outlined"
              type="number"
              value={taxWithheld}
              onChange={(e) => setTaxWithheld(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="Enter the amount of federal tax withheld" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
              required
            />
          </Grid>
        </Grid>
      </Box>

      {/* State and Local Tax Information */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          State and Local Tax Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="State Tax Withheld"
              fullWidth
              variant="outlined"
              type="number"
              value={stateTaxWithheld}
              onChange={(e) => setStateTaxWithheld(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="Enter the amount of state tax withheld" placement="top">
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
              label="Local Tax Withheld"
              fullWidth
              variant="outlined"
              type="number"
              value={localTaxWithheld}
              onChange={(e) => setLocalTaxWithheld(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="Enter the amount of local tax withheld" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
              required
            />
          </Grid>
        </Grid>
      </Box>

      {/* Property-Specific Tax Information */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Property-Specific Tax Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Assessed Property Value"
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
                  <Tooltip title="Enter the assessed value of the property" placement="top">
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
              label="Property Tax Amount"
              fullWidth
              variant="outlined"
              type="number"
              value={propertyTax}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="Calculated property tax amount" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
        <Box mt={2}>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={calculatePropertyTax}
          >
            Calculate Property Tax
          </Button>
        </Box>
      </Box>

      {/* Tax Credits and Deductions */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Tax Credits and Deductions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Capital Gains"
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
                  <Tooltip title="Enter the amount of capital gains" placement="top">
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
              label="Other Deductions"
              fullWidth
              variant="outlined"
              type="number"
              value={otherDeductions}
              onChange={(e) => setOtherDeductions(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="Enter any other deductions (e.g., charitable donations)" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
              required
            />
          </Grid>
        </Grid>
      </Box>

      {/* Tax Exemptions */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Tax Exemptions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Homestead Exemption"
              fullWidth
              variant="outlined"
              type="number"
              value={homesteadExemption}
              onChange={(e) => setHomesteadExemption(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="Enter the homestead exemption amount" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Senior Citizen Exemption"
              fullWidth
              variant="outlined"
              type="number"
              value={seniorCitizenExemption}
              onChange={(e) => setSeniorCitizenExemption(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="Enter the senior citizen exemption amount" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
            />
          </Grid>
        </Grid>
        <TextField
          margin="dense"
          label="Disability Exemption"
          fullWidth
          variant="outlined"
          type="number"
          value={disabilityExemption}
          onChange={(e) => setDisabilityExemption(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoneyIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <Tooltip title="Enter the disability exemption amount" placement="top">
                <InfoIcon />
              </Tooltip>
            ),
          }}
        />
      </Box>

      {/* Summary of Tax Obligations */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Summary of Tax Obligations
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Total Taxable Income"
              fullWidth
              variant="outlined"
              type="number"
              value={totalTaxableIncome}
              onChange={(e) => setTotalTaxableIncome(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="Enter the total taxable income" placement="top">
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
              label="Total Tax Liability"
              fullWidth
              variant="outlined"
              type="number"
              value={totalTaxLiability}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Tooltip title="This is your total tax liability after all calculations" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
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

export default USTaxModule;
