import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Reports = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Typography>
        View your reports here.
      </Typography>
    </PageWrapper>
  );
};

export default Reports;
