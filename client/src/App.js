// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { CssBaseline, Popover, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Avatar, List, ListItem, ListItemText, ListItemAvatar, Box } from '@mui/material';
import Sidebar from './components/app/Sidebar';
import GlobalStyle from './GlobalStyles';
import PublicHeader from './components/public/Header';
import PublicFooter from './components/public/Footer';

import Home from './pages/public/Home';
import Features from './pages/public/Features';
import FAQ from './pages/public/FAQ';
import ToS from './pages/public/ToS';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Pricing from './pages/public/Pricing';
import BlogList from './pages/public/BlogList';
import BlogPost from './pages/public/BlogPost';
import HelpCenter from './pages/public/HelpCenter';
import ContactUs from './pages/public/ContactUs';
import CompanyInfo from './pages/public/CompanyInfo';
import SignIn from './pages/public/SignIn';
import SignUp from './pages/public/SignUp';
import Payment from './pages/public/Payment';

import Dashboard from './pages/app/Overview';
import Finances from './pages/app/Finances';
import Properties from './pages/app/Properties';
import Tickets from './pages/app/Tickets';
import Contacts from './pages/app/Contacts';
import Taxes from './pages/app/Taxes';
import Documents from './pages/app/Documents';
import Reports from './pages/app/Reports';
import Settings from './pages/app/Settings';
import Feedback from './pages/app/Feedback';

const App = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => setNotificationsOpen(false);
  const handleLogout = () => setLogoutDialogOpen(true);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setLogoutDialogOpen(false);
    window.location.reload();
  };

  const notifications = [
    { message: 'New tenant application received', avatar: 'https://via.placeholder.com/40' },
    { message: 'Maintenance request pending', avatar: 'https://via.placeholder.com/40' },
    { message: 'Rent payment confirmed', avatar: 'https://via.placeholder.com/40' },
  ];

  return (
    <Router>
      <GlobalStyle />
      <CssBaseline />
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="tos" element={<ToS />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="help-center" element={<HelpCenter />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="about" element={<CompanyInfo />} />
          <Route path="signin" element={<AuthenticatedRoute><SignIn /></AuthenticatedRoute>} />
          <Route path="get-started" element={<AuthenticatedRoute><SignUp /></AuthenticatedRoute>} />
          <Route path="payment" element={<Payment />} />
        </Route>
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout handleNotificationsOpen={handleNotificationsOpen} handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="finances" element={<Finances />} />
          <Route path="properties" element={<Properties />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="taxes" element={<Taxes />} />
          <Route path="documents" element={<Documents />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
      <Popover
        open={notificationsOpen}
        anchorEl={notificationsAnchorEl}
        onClose={handleNotificationsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <List sx={{ width: 300 }}>
          {notifications.map((notification, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar src={notification.avatar} />
              </ListItemAvatar>
              <ListItemText primary={notification.message} />
            </ListItem>
          ))}
        </List>
      </Popover>
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Log Out</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to log out?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmLogout} color="primary" autoFocus>Log Out</Button>
        </DialogActions>
      </Dialog>
    </Router>
  );
};

const PublicLayout = () => (
  <>
    <PublicHeader />
    <div className="content">
      <Outlet />
    </div>
    <PublicFooter />
  </>
);

const AppLayout = ({ handleNotificationsOpen, handleLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch('/api/protected/check-subscription', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!data.isActive) {
        navigate('/pricing');
      }
    };

    checkAuthAndSubscription();
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar handleNotificationsOpen={handleNotificationsOpen} handleLogout={handleLogout} />
      <Box component="main" sx={{ flexGrow: 1, p: 0, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    return <Navigate to="/" />;
  }
  return children;
};

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  return children;
};

export default App;
