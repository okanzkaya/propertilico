import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Drawer
} from '@mui/material';
import {
  Dashboard,
  AccountBalance,
  Home,
  ConfirmationNumber,
  Contacts,
  Receipt,
  Description,
  BarChart,
  Settings,
  Feedback,
  ExitToApp,
  HomeOutlined
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';
import styles from './Sidebar.module.css';

const MENU_ITEMS = [
  { id: 'dashboard', icon: Dashboard, label: 'Dashboard', path: '/app/dashboard' },
  { id: 'finances', icon: AccountBalance, label: 'Finances', path: '/app/finances' },
  { id: 'properties', icon: Home, label: 'Properties', path: '/app/properties' },
  { id: 'tickets', icon: ConfirmationNumber, label: 'Tickets', path: '/app/tickets' },
  { id: 'contacts', icon: Contacts, label: 'Contacts', path: '/app/contacts' },
  { id: 'taxes', icon: Receipt, label: 'Taxes', path: '/app/taxes' },
  { id: 'documents', icon: Description, label: 'Documents', path: '/app/documents' },
  { id: 'reports', icon: BarChart, label: 'Reports', path: '/app/reports' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/app/settings' },
  { id: 'feedback', icon: Feedback, label: 'Feedback', path: '/app/feedback' },
];

const SidebarItem = React.memo(({ icon: Icon, label, path, onClick, collapsed }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) => `${styles.sidebarItem} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <Icon className={styles.icon} />
      <span className={`${styles.label} ${collapsed ? styles.hidden : ''}`}>
        {label}
      </span>
    </NavLink>
  );
});

const NewSidebar = ({ isMobile, isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [dialogState, setDialogState] = useState({
    logout: false,
    homepage: false
  });
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      setDialogState({ ...dialogState, logout: false });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleHomepage = () => {
    setDialogState({ ...dialogState, homepage: false });
    navigate('/');
  };

  const sidebarContent = (
    <div 
      className={`${styles.sidebar} ${!collapsed ? styles.expanded : ''}`}
      onMouseEnter={() => !isMobile && setCollapsed(false)}
      onMouseLeave={() => !isMobile && setCollapsed(true)}
    >
      <div className={styles.menuContainer}>
        {MENU_ITEMS.map(({ id, icon, label, path }) => (
          <SidebarItem
            key={id}
            icon={icon}
            label={label}
            path={path}
            onClick={isMobile ? onClose : undefined}
            collapsed={collapsed}
          />
        ))}
      </div>

      <div className={styles.bottomActions}>
        <button
          className={`${styles.sidebarItem} ${styles.homeButton}`}
          onClick={() => setDialogState({ ...dialogState, homepage: true })}
        >
          <HomeOutlined className={styles.icon} />
          <span className={`${styles.label} ${collapsed ? styles.hidden : ''}`}>
            Homepage
          </span>
        </button>
        
        <button
          className={`${styles.sidebarItem} ${styles.logoutButton}`}
          onClick={() => setDialogState({ ...dialogState, logout: true })}
        >
          <ExitToApp className={styles.icon} />
          <span className={`${styles.label} ${collapsed ? styles.hidden : ''}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          anchor="left"
          open={isOpen}
          onClose={onClose}
          classes={{ paper: styles.drawer }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        sidebarContent
      )}

      {/* Logout Dialog */}
      <Dialog
        open={dialogState.logout}
        onClose={() => setDialogState({ ...dialogState, logout: false })}
        className={styles.dialog}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState({ ...dialogState, logout: false })}>
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Homepage Dialog */}
      <Dialog
        open={dialogState.homepage}
        onClose={() => setDialogState({ ...dialogState, homepage: false })}
        className={styles.dialog}
      >
        <DialogTitle>Return to Homepage</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to return to the homepage?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState({ ...dialogState, homepage: false })}>
            Cancel
          </Button>
          <Button onClick={handleHomepage} color="primary" variant="contained">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(NewSidebar);