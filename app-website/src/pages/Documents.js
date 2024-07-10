import React from 'react';
import { Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const PageWrapper = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
});

const Documents = () => {
  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>
      <Typography>
        Manage your documents here.
      </Typography>
    </PageWrapper>
  );
};

export default Documents;
