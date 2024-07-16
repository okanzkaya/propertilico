import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, CssBaseline, Popover, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Avatar, List, ListItem, ListItemText, ListItemAvatar } from '@mui/material';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Overview';
import Finances from './pages/Finances';
import Properties from './pages/Properties';
import Tickets from './pages/Tickets';
import Contacts from './pages/Contacts';
import Taxes from './pages/Taxes';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';

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
    setLogoutDialogOpen(false);
    console.log('Logged Out');
  };

  const notifications = [
    { message: 'New tenant application received', avatar: 'https://via.placeholder.com/40' },
    { message: 'Maintenance request pending', avatar: 'https://via.placeholder.com/40' },
    { message: 'Rent payment confirmed', avatar: 'https://via.placeholder.com/40' },
  ];

  return (
    <Router>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar handleNotificationsOpen={handleNotificationsOpen} handleLogout={handleLogout} />
        <Box component="main" sx={{ flexGrow: 1, p: 0, mt: 8 }}>
          <Routes>
            <Route path="/" exact element={<Dashboard />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/taxes" element={<Taxes />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </Box>
      </Box>
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
        <DialogTitle>{'Log Out'}</DialogTitle>
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

export default App;
