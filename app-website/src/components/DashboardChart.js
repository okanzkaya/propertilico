import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CardWrapper = styled(Card)({
  margin: '1rem',
});

const DashboardChart = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Rent Collected',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <CardWrapper>
      <CardContent>
        <Typography variant="h5" component="div">
          Rent Collection Over Time
        </Typography>
        <Line data={data} />
      </CardContent>
    </CardWrapper>
  );
};

export default DashboardChart;
