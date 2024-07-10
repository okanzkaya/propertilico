import React from 'react';
import { NavLink } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, Box } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import { useMediaQuery } from '@mui/material';
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
  '&.active > div': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Example user object
  const user = {
    avatar: 'https://via.placeholder.com/150', // Replace with actual avatar URL
    fullName: 'John Doe',
  };

  return (
    <SidebarWrapper>
      <StyledDrawer variant={isMobile ? "temporary" : "permanent"} anchor="left">
        <UserBox>
          <Typography variant="h5" gutterBottom>
            Dashboard
          </Typography>
          <Avatar src={user.avatar} alt={user.fullName} sx={{ width: 80, height: 80 }} />
          <Typography variant="h6" gutterBottom>
            {user.fullName}
          </Typography>
        </UserBox>
        <List>
          <StyledNavLink to="/dashboard/finances" activeClassName="active">
            <ListItem button>
              <ListItemIcon><FinancesIcon /></ListItemIcon>
              <ListItemText primary="Finances" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/dashboard/properties" activeClassName="active">
            <ListItem button>
              <ListItemIcon><PropertiesIcon /></ListItemIcon>
              <ListItemText primary="Properties" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/dashboard/tickets" activeClassName="active">
            <ListItem button>
              <ListItemIcon><TicketsIcon /></ListItemIcon>
              <ListItemText primary="Tickets" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/dashboard/contacts" activeClassName="active">
            <ListItem button>
              <ListItemIcon><ContactsIcon /></ListItemIcon>
              <ListItemText primary="Contacts" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/dashboard/taxes" activeClassName="active">
            <ListItem button>
              <ListItemIcon><TaxesIcon /></ListItemIcon>
              <ListItemText primary="Taxes" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/dashboard/documents" activeClassName="active">
            <ListItem button>
              <ListItemIcon><DocumentsIcon /></ListItemIcon>
              <ListItemText primary="Documents" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/dashboard/reports" activeClassName="active">
            <ListItem button>
              <ListItemIcon><ReportsIcon /></ListItemIcon>
              <ListItemText primary="Reports" />
            </ListItem>
          </StyledNavLink>
          <StyledNavLink to="/dashboard/settings" activeClassName="active">
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
