import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types'; // Added PropTypes import
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Box,
  Menu, MenuItem, Avatar, ListItemIcon, Button, List,
  ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ExitToApp as ExitToAppIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';
import styles from './TopBar.module.css';

const NotificationItem = React.memo(({ type, message, date }) => {
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
        secondary={new Date(date).toLocaleString()}
      />
    </ListItem>
  );
});

NotificationItem.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  message: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
};

const TopBar = ({ 
  themeMode, 
  toggleTheme, 
  toggleDrawer, 
  isMobile,
  notifications = [],
  onDropdownChange 
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);
  const [logoutMenuAnchor, setLogoutMenuAnchor] = React.useState(null);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleNotificationsClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
    onDropdownChange?.(true);
  }, [onDropdownChange]);

  const handleNotificationsClose = useCallback(() => {
    setAnchorEl(null);
    onDropdownChange?.(false);
  }, [onDropdownChange]);

  const handleUserMenuClick = useCallback((event) => {
    setUserMenuAnchor(event.currentTarget);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setUserMenuAnchor(null);
  }, []);

  const handleLogoutClick = useCallback((event) => {
    setLogoutMenuAnchor(event.currentTarget);
  }, []);

  const handleLogoutClose = useCallback(() => {
    setLogoutMenuAnchor(null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const handleHomeClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const notificationsList = useMemo(() => (
    <Box className={styles.notificationsContainer}>
      <Box className={styles.notificationsHeader}>
        <Typography variant="h6">Notifications</Typography>
        <Button 
          color="primary" 
          disabled={notifications.length === 0}
          onClick={handleNotificationsClose}
        >
          Dismiss All
        </Button>
      </Box>
      <List>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              type={notification.type}
              message={notification.message}
              date={notification.date}
            />
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary={
                <Typography align="center" color="textSecondary">
                  No new notifications
                </Typography>
              } 
            />
          </ListItem>
        )}
      </List>
    </Box>
  ), [notifications, handleNotificationsClose]);

  return (
    <AppBar position="fixed" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={toggleDrawer}
            edge="start"
            className={styles.menuButton}
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" className={styles.title}>
          Dashboard
        </Typography>

        <Box className={styles.actions}>
          <IconButton
            color="inherit"
            onClick={handleUserMenuClick}
            aria-label="user menu"
          >
            <Avatar
              src={user?.avatar}
              alt={user?.name || ''}
              className={styles.avatar}
            >
              {!user?.avatar && user?.name ? user.name.charAt(0).toUpperCase() : null}
            </Avatar>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleNotificationsClick}
            aria-label="notifications"
          >
            <Badge 
              badgeContent={notifications.length} 
              color="error"
              max={9}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={toggleTheme}
            aria-label="toggle theme"
          >
            {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleLogoutClick}
            aria-label="logout"
          >
            <ExitToAppIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleNotificationsClose}
          className={styles.notificationsMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {notificationsList}
        </Menu>

        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          className={styles.userMenu}
        >
          <Box className={styles.userInfo}>
            <Avatar
              src={user?.avatar}
              alt={user?.name || ''}
              className={styles.largeAvatar}
            >
              {!user?.avatar && user?.name ? user.name.charAt(0).toUpperCase() : null}
            </Avatar>
            <Typography variant="subtitle1">{user?.name}</Typography>
            <Typography variant="body2" color="textSecondary">{user?.role}</Typography>
            <Typography variant="body2">{user?.email}</Typography>
          </Box>
        </Menu>

        <Menu
          anchorEl={logoutMenuAnchor}
          open={Boolean(logoutMenuAnchor)}
          onClose={handleLogoutClose}
          className={styles.logoutMenu}
        >
          <MenuItem onClick={handleHomeClick}>
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
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  themeMode: PropTypes.oneOf(['light', 'dark']).isRequired,
  toggleTheme: PropTypes.func.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
      message: PropTypes.string.isRequired,
      date: PropTypes.instanceOf(Date).isRequired,
    })
  ),
  onDropdownChange: PropTypes.func,
};

TopBar.defaultProps = {
  notifications: [],
  onDropdownChange: () => {},
};

export default React.memo(TopBar);