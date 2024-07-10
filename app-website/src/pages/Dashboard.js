import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Dashboard = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography>
        Welcome to your dashboard!
      </Typography>
    </PageWrapper>
  );
};

export default Dashboard;
