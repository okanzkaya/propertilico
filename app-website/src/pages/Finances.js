import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Finances = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Finances
      </Typography>
      <Typography>
        Manage your finances here.
      </Typography>
    </PageWrapper>
  );
};

export default Finances;
