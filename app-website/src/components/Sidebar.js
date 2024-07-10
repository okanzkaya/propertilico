import React from 'react';
import { NavLink } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import {
  Dashboard as DashboardIcon,
  AccountBalance as FinancesIcon,
  Home as PropertiesIcon,
  ConfirmationNumber as TicketsIcon,
  Contacts as ContactsIcon,
  Receipt as TaxesIcon,
  Description as DocumentsIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const SidebarWrapper = styled('div')(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  [theme.breakpoints.down('sm')]: {
    width: 200,
  },
}));

const UserBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem 0',
});

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
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

const Sidebar = () => {
  const user = {
    avatar: 'https://via.placeholder.com/150', // Replace with actual avatar URL
    fullName: 'John Doe',
  };

  return (
    <SidebarWrapper>
      <StyledDrawer variant="permanent" anchor="left">
        <UserBox>
          <Avatar src={user.avatar} alt={user.fullName} sx={{ width: 80, height: 80 }} />
          <Typography variant="h6" gutterBottom>
            {user.fullName}
          </Typography>
        </UserBox>
        <List>
          <StyledNavLink exact to="/dashboard">
            <ListItem button>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/finances">
            <ListItem button>
              <ListItemIcon><FinancesIcon /></ListItemIcon>
              <ListItemText primary="Finances" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/properties">
            <ListItem button>
              <ListItemIcon><PropertiesIcon /></ListItemIcon>
              <ListItemText primary="Properties" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/tickets">
            <ListItem button>
              <ListItemIcon><TicketsIcon /></ListItemIcon>
              <ListItemText primary="Tickets" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/contacts">
            <ListItem button>
              <ListItemIcon><ContactsIcon /></ListItemIcon>
              <ListItemText primary="Contacts" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/taxes">
            <ListItem button>
              <ListItemIcon><TaxesIcon /></ListItemIcon>
              <ListItemText primary="Taxes" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/documents">
            <ListItem button>
              <ListItemIcon><DocumentsIcon /></ListItemIcon>
              <ListItemText primary="Documents" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/reports">
            <ListItem button>
              <ListItemIcon><ReportsIcon /></ListItemIcon>
              <ListItemText primary="Reports" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/settings">
            <ListItem button>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </StyledNavLink>
        </List>
      </StyledDrawer>
    </SidebarWrapper>
  );
};

export default Sidebar;
