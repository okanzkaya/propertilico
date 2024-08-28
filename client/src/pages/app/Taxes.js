// Taxes.js
import React, { useState } from "react";
import { Typography, Grid, Box, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import TaxModule from './TaxModule';  // Import the TaxModule component

const Taxes = () => {
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");

  const countries = [
    { code: "US", name: "United States" },
    { code: "UK", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "CA", name: "Canada" },
    { code: "DE", name: "Germany" },
    { code: "DEFAULT", name: "Other" },
  ];

  const handleDownload = (link) => window.open(link, "_blank");

  return (
    <Box p={2}>
      <Alert severity="info" sx={{ mb: 3 }}>
        The tools and resources provided on this page are designed to assist with general tax management. However, they should not be considered a substitute for professional advice. For accurate guidance tailored to your specific circumstances, we recommend consulting a certified tax professional or accountant.
      </Alert>
      <Typography variant="h4" gutterBottom>
        Taxes
      </Typography>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Country</InputLabel>
            <Select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              label="Country"
            >
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Currency</InputLabel>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              label="Currency"
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              {/* Add more currencies as needed */}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Render the appropriate tax module based on the selected country */}
      <TaxModule country={country} onDownload={handleDownload} />

      {/* Add pagination and other components below as needed */}
    </Box>
  );
};

export default Taxes;
