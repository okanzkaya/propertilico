import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Properties = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Properties
      </Typography>
      <Typography>
        Manage your properties here.
      </Typography>
    </PageWrapper>
  );
};

export default Properties;
