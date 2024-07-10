import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Settings = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography>
        Manage your settings here.
      </Typography>
    </PageWrapper>
  );
};

export default Settings;
