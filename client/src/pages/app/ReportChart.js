import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportChart = ({ type, data, options }) => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: data.label,
      data: data.values,
      backgroundColor: 'rgba(0, 227, 150, 0.2)',
      borderColor: 'rgba(0, 227, 150, 1)',
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Report Data' },
    },
    ...options,
  };

  return (
    <Chart 
      type={type}
      data={chartData}
      options={chartOptions}
    />
  );
};

export default ReportChart;