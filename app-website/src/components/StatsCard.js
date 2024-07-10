import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const CardWrapper = styled(Card)({
  minWidth: 275,
  margin: '1rem',
});

const StatsCard = ({ title, value }) => {
  return (
    <CardWrapper>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </CardContent>
    </CardWrapper>
  );
};

export default StatsCard;
