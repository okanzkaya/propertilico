import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Contacts = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Contacts
      </Typography>
      <Typography>
        Manage your contacts here.
      </Typography>
    </PageWrapper>
  );
};

export default Contacts;
