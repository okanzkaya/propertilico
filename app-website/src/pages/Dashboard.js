import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Finances from './Finances';
import Properties from './Properties';
import Tickets from './Tickets';
import Contacts from './Contacts';
import Taxes from './Taxes';
import Documents from './Documents';
import Reports from './Reports';
import Settings from './Settings';
import StatsCard from '../components/StatsCard';
import DashboardChart from '../components/DashboardChart';
import { styled } from '@mui/system';
import { Grid } from '@mui/material';

const DashboardWrapper = styled('div')({
  display: 'flex',
  height: '100vh',
});

const MainContent = styled('div')({
  flex: 1,
  padding: '1rem',
  overflowY: 'auto',
  marginTop: '64px', // To offset the fixed Header
});

const Dashboard = () => {
  return (
    <DashboardWrapper>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <MainContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard title="Total Properties" value="24" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard title="Total Tenants" value="120" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard title="Total Tickets" value="15" />
            </Grid>
            <Grid item xs={12}>
              <DashboardChart />
            </Grid>
          </Grid>
          <Routes>
            <Route path="finances" element={<Finances />} />
            <Route path="properties" element={<Properties />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="taxes" element={<Taxes />} />
            <Route path="documents" element={<Documents />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </MainContent>
      </div>
    </DashboardWrapper>
  );
};

export default Dashboard;
