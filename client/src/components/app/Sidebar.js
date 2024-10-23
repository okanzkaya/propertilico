import React, { useState, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, Typography, Box, AppBar, IconButton,
  Badge, Popover, useTheme, Menu, MenuItem, Avatar, Divider, Tooltip, Toolbar,
  useMediaQuery, ListItemText, ListItemAvatar, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Notifications as NotificationsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ExitToApp as ExitToAppIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as FinancesIcon,
  Home as PropertiesIcon,
  ConfirmationNumber as TicketsIcon,
  Contacts as ContactsIcon,
  Receipt as TaxesIcon,
  Description as DocumentsIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  Feedback as FeedbackIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
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
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'open',
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
  { to: '/app/reports', icon: <ReportsIcon />, text: 'Analytics & Reports' },
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

const NotificationItem = React.memo(({ type, message, date, handleClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return <InfoIcon color="info" />;
    }
  };

  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar>{getIcon()}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={message}
        secondary={
          <React.Fragment>
            <Typography component="span" variant="body2" color="text.primary">
              {new Date(date).toLocaleString()}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
});

const Sidebar = ({ themeMode, toggleTheme }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [logoutMenuAnchorEl, setLogoutMenuAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useUser();

  const [notifications] = useState([
    { id: 1, type: 'success', message: 'Payment received for Property A', date: new Date() },
    { id: 2, type: 'warning', message: 'Maintenance request for Property B', date: new Date(Date.now() - 86400000) },
    { id: 3, type: 'error', message: 'Failed to process rent for Tenant C', date: new Date(Date.now() - 172800000) },
    { id: 4, type: 'info', message: 'New document uploaded for Property D', date: new Date(Date.now() - 259200000) },
    { id: 5, type: 'success', message: 'Lease renewed for Tenant E', date: new Date(Date.now() - 345600000) },
  ]);

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

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

  const notificationsList = useMemo(() => (
    <List>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <React.Fragment key={notification.id}>
            <NotificationItem
              type={notification.type}
              message={notification.message}
              date={notification.date}
            />
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="No new notifications" />
        </ListItem>
      )}
    </List>
  ), [notifications]);

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
            <Avatar
              src={user?.avatar ? `${process.env.REACT_APP_API_URL}${user.avatar}` : undefined}
              alt={user?.name}
              sx={{ width: 32, height: 32 }}
            >
              {!user?.avatar && user?.name ? user.name.charAt(0).toUpperCase() : null}
            </Avatar>
          </IconButton>
          <IconButton color="inherit" onClick={handleNotificationsClick}>
            <Badge badgeContent={notifications.length > 9 ? '9+' : notifications.length} color="error">
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
        <Box sx={{ width: '350px', maxHeight: '500px', overflow: 'auto' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <Typography variant="h6">Notifications</Typography>
            <Button color="primary" onClick={() => { }} disabled={notifications.length === 0}>
              Dismiss All
            </Button>
          </Box>
          {notificationsList}
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
            <Avatar
              src={user?.avatar ? `${process.env.REACT_APP_API_URL}${user.avatar}` : undefined}
              alt={user?.name}
              sx={{ width: 64, height: 64, mb: 1 }}
            >
              {!user?.avatar && user?.name ? user.name.charAt(0).toUpperCase() : null}
            </Avatar>
            <Typography variant="subtitle1">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.role}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <IconButton size="small" sx={{ mr: 1 }}>
                <HomeIcon fontSize="small" />
              </IconButton>
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
      ><MenuItem onClick={handleReturnToHomepage}>
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