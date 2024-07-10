import React from 'react';
import { NavLink } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import {
  AccountBalance as FinancesIcon,
  Home as PropertiesIcon,
  ConfirmationNumber as TicketsIcon,
  Contacts as ContactsIcon,
  Receipt as TaxesIcon,
  Description as DocumentsIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const SidebarWrapper = styled('div')({
  width: 240,
  flexShrink: 0,
});

const UserBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem 0',
});

const Sidebar = () => {
  // Example user object
  const user = {
    avatar: 'https://via.placeholder.com/150', // Replace with actual avatar URL
    fullName: 'John Doe',
  };

  return (
    <SidebarWrapper>
      <Drawer variant="permanent" anchor="left">
        <UserBox>
          <Avatar src={user.avatar} alt={user.fullName} sx={{ width: 80, height: 80 }} />
          <Typography variant="h6" gutterBottom>
            {user.fullName}
          </Typography>
        </UserBox>
        <List>
          <ListItem button component={NavLink} to="/dashboard/finances">
            <ListItemIcon><FinancesIcon /></ListItemIcon>
            <ListItemText primary="Finances" />
          </ListItem>
          <ListItem button component={NavLink} to="/dashboard/properties">
            <ListItemIcon><PropertiesIcon /></ListItemIcon>
            <ListItemText primary="Properties" />
          </ListItem>
          <ListItem button component={NavLink} to="/dashboard/tickets">
            <ListItemIcon><TicketsIcon /></ListItemIcon>
            <ListItemText primary="Tickets" />
          </ListItem>
          <ListItem button component={NavLink} to="/dashboard/contacts">
            <ListItemIcon><ContactsIcon /></ListItemIcon>
            <ListItemText primary="Contacts" />
          </ListItem>
          <ListItem button component={NavLink} to="/dashboard/taxes">
            <ListItemIcon><TaxesIcon /></ListItemIcon>
            <ListItemText primary="Taxes" />
          </ListItem>
          <ListItem button component={NavLink} to="/dashboard/documents">
            <ListItemIcon><DocumentsIcon /></ListItemIcon>
            <ListItemText primary="Documents" />
          </ListItem>
          <ListItem button component={NavLink} to="/dashboard/reports">
            <ListItemIcon><ReportsIcon /></ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>
          <ListItem button component={NavLink} to="/dashboard/settings">
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Drawer>
    </SidebarWrapper>
  );
};

export default Sidebar;
