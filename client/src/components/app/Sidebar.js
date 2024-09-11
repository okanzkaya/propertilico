import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, Typography, Box, AppBar, IconButton,
  Badge, Popover, useTheme, Menu, MenuItem, Avatar, Divider, Tooltip, Toolbar,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Dashboard as DashboardIcon, AccountBalance as FinancesIcon, Home as PropertiesIcon,
  ConfirmationNumber as TicketsIcon, Contacts as ContactsIcon, Receipt as TaxesIcon,
  Description as DocumentsIcon, BarChart as ReportsIcon, Settings as SettingsIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';

const drawerWidth = 60;
const mobileDrawerWidth = 240;

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, open, isMobile }) => ({
  width: isMobile ? mobileDrawerWidth : drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme, isMobile),
    '& .MuiDrawer-paper': openedMixin(theme, isMobile),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const openedMixin = (theme, isMobile) => ({
  width: isMobile ? mobileDrawerWidth : drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  '&.active': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const menuItems = [
  { to: '/app/dashboard', icon: <DashboardIcon />, text: 'Overview' },
  { to: '/app/finances', icon: <FinancesIcon />, text: 'Finances' },
  { to: '/app/properties', icon: <PropertiesIcon />, text: 'Properties' },
  { to: '/app/tickets', icon: <TicketsIcon />, text: 'Tickets' },
  { to: '/app/contacts', icon: <ContactsIcon />, text: 'Contacts' },
  { to: '/app/taxes', icon: <TaxesIcon />, text: 'Taxes' },
  { to: '/app/documents', icon: <DocumentsIcon />, text: 'Documents' },
  { to: '/app/reports', icon: <ReportsIcon />, text: 'Reports' },
  { to: '/app/settings', icon: <SettingsIcon />, text: 'Settings' },
  { to: '/app/feedback', icon: <FeedbackIcon />, text: 'Feedback' },
];

const SidebarContent = React.memo(({ isMobile, handleDrawerClose }) => (
  <List sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    {menuItems.map((item) => (
      <Tooltip title={item.text} placement="right" key={item.to}>
        <StyledNavLink to={item.to} onClick={isMobile ? handleDrawerClose : undefined}>
          <ListItem button sx={{ justifyContent: isMobile ? 'flex-start' : 'center', py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: isMobile ? 56 : 'auto', '& .MuiSvgIcon-root': { fontSize: '1.75rem' } }}>
              {item.icon}
            </ListItemIcon>
            {isMobile && <Typography variant="body2">{item.text}</Typography>}
          </ListItem>
        </StyledNavLink>
      </Tooltip>
    ))}
  </List>
));

const Sidebar = ({ themeMode, toggleTheme }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [logoutMenuAnchorEl, setLogoutMenuAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useUser();

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (isMobile) {
      handleDrawerClose();
    }
  }, [location, isMobile, handleDrawerClose]);

  const handleDrawerToggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const handleNotificationsClick = useCallback((event) => setAnchorEl(event.currentTarget), []);
  const handleNotificationsClose = useCallback(() => setAnchorEl(null), []);
  const handleUserMenuClick = useCallback((event) => setUserMenuAnchorEl(event.currentTarget), []);
  const handleUserMenuClose = useCallback(() => setUserMenuAnchorEl(null), []);
  const handleLogoutMenuClick = useCallback((event) => setLogoutMenuAnchorEl(event.currentTarget), []);
  const handleLogoutMenuClose = useCallback(() => setLogoutMenuAnchorEl(null), []);
  
  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleReturnToHomepage = useCallback(() => navigate('/'), [navigate]);

  const notificationsCount = 7;
  const notifications = Array(7).fill('').map((_, i) => `Notification ${i + 1}`);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ marginRight: 5 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'common.white' }}>
            Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleUserMenuClick}>
            <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 32, height: 32 }} />
          </IconButton>
          <IconButton color="inherit" onClick={handleNotificationsClick}>
            <Badge badgeContent={notificationsCount > 9 ? '9+' : notificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={() => toggleTheme(themeMode === 'light' ? 'dark' : 'light')}>
            {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleLogoutMenuClick}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBarStyled>
      <DrawerStyled
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: true,
          BackdropProps: {
            invisible: true
          }
        }}
        isMobile={isMobile}
      >
        <Toolbar />
        <SidebarContent isMobile={isMobile} handleDrawerClose={handleDrawerClose} />
      </DrawerStyled>
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 0, 
        width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        marginTop: '64px',
        height: 'calc(100vh - 64px)',
        overflow: 'auto'
      }}>
        {/* Your main content goes here */}
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleNotificationsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: '300px', maxHeight: '400px', overflow: 'auto' }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #eee' }}>Notifications</Typography>
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">{notification}</Typography>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Popover>
      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 64, height: 64, mb: 1 }} />
            <Typography variant="subtitle1">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.role}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">{user?.email}</Typography>
            </Box>
          </Box>
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={logoutMenuAnchorEl}
        open={Boolean(logoutMenuAnchorEl)}
        onClose={handleLogoutMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleReturnToHomepage}>
          <ListItemIcon>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          Return to Homepage
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          Log Out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Sidebar;