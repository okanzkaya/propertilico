import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, Box, Divider, Toolbar, AppBar, IconButton, Badge, Popover, Button, ListSubheader,
} from '@mui/material';
import { styled, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  Dashboard as DashboardIcon, AccountBalance as FinancesIcon, Home as PropertiesIcon, ConfirmationNumber as TicketsIcon, Contacts as ContactsIcon, Receipt as TaxesIcon, Description as DocumentsIcon, BarChart as ReportsIcon, Settings as SettingsIcon, Feedback as FeedbackIcon,
} from '@mui/icons-material';

import logo from '../../assets/app/logo.svg';

const drawerWidth = 240;

const SidebarWrapper = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    width: drawerWidth,
    flexShrink: 0,
  },
}));

const LogoBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem',
});

const UserBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem 0',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
});

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  '&.active': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    '& .MuiListItemText-root': { fontWeight: theme.typography.fontWeightBold },
    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
  },
}));

const Sidebar = ({ handleNotificationsOpen, themeMode, toggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutAnchorEl, setLogoutAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const notificationsCount = 7; // Replace with actual notifications count
  const navigate = useNavigate();

  const user = {
    avatar: 'https://via.placeholder.com/150', // Replace with actual avatar URL
    fullName: 'John Doe',
  };

  const notifications = Array(7).fill('').map((_, i) => `Notification ${i + 1}`); // Replace with actual notifications

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNotificationsClick = (event) => setAnchorEl(event.currentTarget);

  const handleNotificationsClose = () => setAnchorEl(null);

  const handleLogoutClick = (event) => setLogoutAnchorEl(event.currentTarget);

  const handleLogoutClose = () => setLogoutAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/signin');
  };

  const handleReturnToHomepage = () => {
    navigate('/');
  };

  const drawer = (
    <div>
      <LogoBox>
        <img src={logo} alt="Logo" style={{ width: '80%', height: 'auto' }} />
      </LogoBox>
      <UserBox>
        <Avatar src={user.avatar} alt={user.fullName} sx={{ width: 80, height: 80, mb: 1 }} />
        <Typography variant="h6" gutterBottom>{user.fullName}</Typography>
      </UserBox>
      <List>
        {[
          { to: '/app/dashboard', icon: <DashboardIcon />, text: 'Overview' },
          { to: '/app/finances', icon: <FinancesIcon />, text: 'Finances' },
          { to: '/app/properties', icon: <PropertiesIcon />, text: 'Properties' },
          { to: '/app/tickets', icon: <TicketsIcon />, text: 'Tickets' },
          { to: '/app/contacts', icon: <ContactsIcon />, text: 'Contacts' },
          { to: '/app/taxes', icon: <TaxesIcon />, text: 'Taxes' },
          { to: '/app/documents', icon: <DocumentsIcon />, text: 'Documents' },
          { to: '/app/reports', icon: <ReportsIcon />, text: 'Reports' },
          { to: '/app/settings', icon: <SettingsIcon />, text: 'Settings' },
          { to: '/app/feedback', icon: <FeedbackIcon />, text: 'Send Feedback' },
        ].map((item, index) => (
          <StyledNavLink key={index} to={item.to}>
            <ListItem button>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </StyledNavLink>
        ))}
        <Divider />
      </List>
    </div>
  );

  return (
    <SidebarWrapper>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, height: '56px' }}>
        <Toolbar sx={{ minHeight: '56px' }}>
          {isMobile && (
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Propertilico Dashboard
          </Typography>
          <IconButton color="inherit" onClick={() => toggleTheme(themeMode === 'light' ? 'dark' : 'light')}>
            {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleNotificationsClick}>
            <Badge badgeContent={notificationsCount > 9 ? '9+' : notificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleNotificationsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <List subheader={<ListSubheader>Notifications</ListSubheader>} sx={{ width: '300px' }}>
              {notifications.map((notification, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${index + 1}. ${notification}`} />
                </ListItem>
              ))}
            </List>
          </Popover>
          <IconButton color="inherit" onClick={handleLogoutClick}>
            <ExitToAppIcon />
          </IconButton>
          <Popover
            open={Boolean(logoutAnchorEl)}
            anchorEl={logoutAnchorEl}
            onClose={handleLogoutClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ p: 2 }}>
              <Button fullWidth variant="contained" color="primary" onClick={handleReturnToHomepage}>
                Return to Homepage
              </Button>
              <Divider sx={{ my: 1 }} />
              <Button fullWidth variant="outlined" color="secondary" onClick={handleLogout}>
                Log Out
              </Button>
            </Box>
          </Popover>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        open={mobileOpen || !isMobile}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: mobileOpen ? 'block' : 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </SidebarWrapper>
  );
};

export default Sidebar;
