import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  Toolbar,
  AppBar,
  IconButton,
  Badge,
} from '@mui/material';
import { styled } from '@mui/system';
import { useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {
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
} from '@mui/icons-material';

const drawerWidth = 240;

const SidebarWrapper = styled('div')(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.default,
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
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
    '& .MuiListItemText-root': {
      fontWeight: theme.typography.fontWeightBold,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

const Sidebar = ({ handleNotificationsOpen, handleLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const notificationsCount = 7; // Replace with actual notifications count

  const user = {
    avatar: 'https://via.placeholder.com/150', // Replace with actual avatar URL
    fullName: 'John Doe',
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <LogoBox>
        <img
          src={require('../assets/logo.svg').default}
          alt="Logo"
          style={{ width: '80%', height: 'auto' }}
        />{' '}
        {/* Replace with your logo path */}
      </LogoBox>
      <UserBox>
        <Avatar
          src={user.avatar}
          alt={user.fullName}
          sx={{ width: 80, height: 80, mb: 1 }}
        />
        <Typography variant="h6" gutterBottom>
          {user.fullName}
        </Typography>
      </UserBox>
      <List>
        <StyledNavLink to="/" exact>
          <ListItem button>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItem>
        </StyledNavLink>
        <StyledNavLink to="/finances">
          <ListItem button>
            <ListItemIcon>
              <FinancesIcon />
            </ListItemIcon>
            <ListItemText primary="Finances" />
          </ListItem>
        </StyledNavLink>
        <StyledNavLink to="/properties">
          <ListItem button>
            <ListItemIcon>
              <PropertiesIcon />
            </ListItemIcon>
            <ListItemText primary="Properties" />
          </ListItem>
        </StyledNavLink>
        <StyledNavLink to="/tickets">
          <ListItem button>
            <ListItemIcon>
              <TicketsIcon />
            </ListItemIcon>
            <ListItemText primary="Tickets" />
          </ListItem>
        </StyledNavLink>
        <StyledNavLink to="/contacts">
          <ListItem button>
            <ListItemIcon>
              <ContactsIcon />
            </ListItemIcon>
            <ListItemText primary="Contacts" />
          </ListItem>
        </StyledNavLink>
        <StyledNavLink to="/taxes">
          <ListItem button>
            <ListItemIcon>
              <TaxesIcon />
            </ListItemIcon>
            <ListItemText primary="Taxes" />
          </ListItem>
        </StyledNavLink>
        <StyledNavLink to="/documents">
          <ListItem button>
            <ListItemIcon>
              <DocumentsIcon />
            </ListItemIcon>
            <ListItemText primary="Documents" />
          </ListItem>
        </StyledNavLink>
        <StyledNavLink to="/reports">
          <ListItem button>
            <ListItemIcon>
              <ReportsIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>
        </StyledNavLink>
        <Divider />
        <StyledNavLink to="/settings">
          <ListItem button>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </StyledNavLink>
        <StyledNavLink to="/feedback">
          <ListItem button>
            <ListItemIcon>
              <FeedbackIcon />
            </ListItemIcon>
            <ListItemText primary="Send Feedback" />
          </ListItem>
        </StyledNavLink>
      </List>
    </div>
  );

  return (
    <SidebarWrapper>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Propertilico Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleNotificationsOpen}>
            <Badge badgeContent={notificationsCount > 9 ? '9+' : notificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      )}
    </SidebarWrapper>
  );
};

export default Sidebar;
