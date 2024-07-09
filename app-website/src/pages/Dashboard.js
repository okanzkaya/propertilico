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
import { styled } from '@mui/system';

const DashboardWrapper = styled('div')({
  display: 'flex',
  height: '100vh',
});

const MainContent = styled('div')({
  flex: 1,
  padding: '1rem',
  overflowY: 'auto',
});

const Dashboard = () => {
  return (
    <DashboardWrapper>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <MainContent>
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
