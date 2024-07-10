import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Tickets = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Tickets
      </Typography>
      <Typography>
        Manage your tickets here.
      </Typography>
    </PageWrapper>
  );
};

export default Tickets;
