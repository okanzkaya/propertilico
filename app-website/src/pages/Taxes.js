import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Taxes = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Taxes
      </Typography>
      <Typography>
        Manage your taxes here.
      </Typography>
    </PageWrapper>
  );
};

export default Taxes;
