import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Finances from './pages/Finances';
import Properties from './pages/Properties';
import Tickets from './pages/Tickets';
import Contacts from './pages/Contacts';
import Taxes from './pages/Taxes';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { styled } from '@mui/system';

const AppWrapper = styled('div')({
  display: 'flex',
  height: '100vh',
});

const MainContent = styled('div')({
  flex: 1,
  padding: '1rem',
  overflowY: 'auto',
});

function App() {
  return (
    <Router>
      <AppWrapper>
        <Sidebar />
        <MainContent>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/taxes" element={<Taxes />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </MainContent>
      </AppWrapper>
    </Router>
  );
}

export default App;
