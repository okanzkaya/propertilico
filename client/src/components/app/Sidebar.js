import React, { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Drawer, Typography } from '@mui/material';
import { 
  Dashboard, AccountBalance, Home, ConfirmationNumber, 
  Contacts, Receipt, Description, BarChart, Settings, 
  Feedback, ExitToApp, HomeOutlined 
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
  { id: 'feedback', icon: Feedback, label: 'Feedback', path: '/app/feedback' }
];

const SidebarItem = React.memo(({ icon: Icon, label, path, onClick, collapsed }) => (
  <NavLink 
    to={path} 
    className={({ isActive }) => `${styles.sidebarItem} ${isActive ? styles.active : ''}`}
    onClick={onClick}
  >
    <Icon className={styles.icon} />
    {!collapsed && <span className={styles.label}>{label}</span>}
  </NavLink>
));

const Sidebar = ({ isMobile, isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(!isMobile);
  const [dialogConfig, setDialogConfig] = useState({ open: false, type: null });
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setDialogConfig({ open: false, type: null });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const handleHomepage = useCallback(() => {
    setDialogConfig({ open: false, type: null });
    navigate('/');
  }, [navigate]);

  const closeDialog = useCallback(() => {
    setDialogConfig({ open: false, type: null });
  }, []);

  const sidebarContent = (
    <div 
      className={`${styles.sidebar} ${!collapsed ? styles.expanded : ''}`}
      onMouseEnter={() => !isMobile && setCollapsed(false)}
      onMouseLeave={() => !isMobile && setCollapsed(true)}
    >
      <nav className={styles.menuContainer}>
        {MENU_ITEMS.map(item => (
          <SidebarItem 
            key={item.id} 
            {...item} 
            onClick={isMobile ? onClose : undefined}
            collapsed={collapsed}
          />
        ))}
      </nav>
      <div className={styles.bottomActions}>
        <button 
          type="button"
          className={styles.sidebarItem} 
          onClick={() => setDialogConfig({ open: true, type: 'homepage' })}
        >
          <HomeOutlined className={styles.icon} />
          {!collapsed && <span className={styles.label}>Homepage</span>}
        </button>
        <button 
          type="button"
          className={styles.sidebarItem} 
          onClick={() => setDialogConfig({ open: true, type: 'logout' })}
        >
          <ExitToApp className={styles.icon} />
          {!collapsed && <span className={styles.label}>Logout</span>}
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
      
      <Dialog open={dialogConfig.open} onClose={closeDialog}>
        <DialogTitle>
          {dialogConfig.type === 'logout' ? 'Confirm Logout' : 'Return to Homepage'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {dialogConfig.type === 'logout' 
              ? 'Are you sure you want to logout?' 
              : 'Are you sure you want to return to the homepage?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            onClick={dialogConfig.type === 'logout' ? handleLogout : handleHomepage}
            color={dialogConfig.type === 'logout' ? 'error' : 'primary'}
            variant="contained"
          >
            {dialogConfig.type === 'logout' ? 'Logout' : 'Continue'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(Sidebar);