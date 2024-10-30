import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { userApi } from '../../api';
import { useUser } from '../../context/UserContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Container, Typography, Paper, Button, CircularProgress, Snackbar, Alert,
  Box, Grid, Divider, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, LinearProgress, Tooltip, Card, CardContent, Avatar
} from '@mui/material';
import {
  AddCircleOutline, RemoveCircleOutline, InfoOutlined, CardGiftcard,
  Timeline, People, Apartment, MonetizationOn, Security, CreditCard
} from '@mui/icons-material';
import './MyPlan.css';

const theme = createTheme({
  palette: {
    primary: { main: '#6200EA' },
    secondary: { main: '#03DAC6' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#333333', secondary: '#666666' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '0.02em' },
    h6: { fontWeight: 600, letterSpacing: '0.01em' },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
  },
  shape: { borderRadius: 12 },
});

const MyPlan = () => {
  const { user } = useUser();
  const [state, setState] = useState({
    subscription: null,
    loading: true,
    action: null,
    message: null,
    openDialog: false,
    dialogAction: null,
    planName: '',
    maxProperties: 0,
  });

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await userApi.getSubscriptionDetails();
      setState(prev => ({ 
        ...prev, 
        subscription: data.subscriptionEndDate, 
        planName: data.planName,
        maxProperties: data.maxProperties,
        loading: false 
      }));
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        message: { text: 'Failed to load subscription details.', severity: 'error' },
      }));
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleSubscriptionAction = useCallback(async (action) => {
    if (!user?.isAdmin) {
      setState(prev => ({
        ...prev,
        message: { text: 'Unauthorized access.', severity: 'error' },
      }));
      return;
    }
  
    setState(prev => ({ ...prev, action, message: null }));
    try {
      const actionMap = {
        extending: userApi.extendSubscription,
        reducing: userApi.reduceSubscription,
        gettingSubscription: userApi.getOneMonthSubscription,
      };
      
      if (typeof actionMap[action] !== 'function') {
        throw new Error('Invalid action');
      }
      
      const data = await actionMap[action]();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          subscription: data.subscriptionEndDate,
          action: null,
          message: {
            text: data.message || `Subscription ${action === 'gettingSubscription' ? 'activated' : `${action}ed`} successfully.`,
            severity: 'success',
          },
        }));
        fetchSubscription();
      } else {
        throw new Error(data.message || 'Action failed');
      }
    } catch (error) {
      console.error('Action failed:', error);
      setState(prev => ({
        ...prev,
        action: null,
        message: {
          text: `Action failed. ${error.message}`,
          severity: 'error',
        },
      }));
    }
  }, [user, fetchSubscription]);

  const { daysLeft, subscriptionStatus } = useMemo(() => {
    if (!state.subscription) return { daysLeft: 0, subscriptionStatus: 'inactive' };
    const days = Math.max(0, Math.ceil((new Date(state.subscription) - new Date()) / (1000 * 60 * 60 * 24)));
    return {
      daysLeft: days,
      subscriptionStatus: days > 0 ? (days <= 7 ? 'expiring' : 'active') : 'expired',
    };
  }, [state.subscription]);

  const handleOpenDialog = useCallback((action) => {
    setState(prev => ({ ...prev, openDialog: true, dialogAction: action }));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setState(prev => ({ ...prev, openDialog: false, dialogAction: null }));
  }, []);

  const handleConfirmAction = useCallback(() => {
    handleSubscriptionAction(state.dialogAction);
    handleCloseDialog();
  }, [state.dialogAction, handleSubscriptionAction, handleCloseDialog]);

  const renderSubscriptionDetails = useMemo(() => (
    <Box className="gradient-box">
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Your {state.planName} Plan
      </Typography>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="body1" component="span" mr={1}>
              Status:
            </Typography>
            <Chip
              label={subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
              color={subscriptionStatus === 'active' ? 'success' : subscriptionStatus === 'expiring' ? 'warning' : 'error'}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Typography variant="body1" mb={2}>
            Expiry Date: {state.subscription ? new Date(state.subscription).toLocaleDateString() : 'N/A'}
          </Typography>
          <Typography variant="body1">
            Max Properties: {state.maxProperties}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Days Remaining: {daysLeft > 0 ? daysLeft : 'No active subscription'}
          </Typography>
          {daysLeft > 0 && (
            <Box sx={{ position: 'relative', pt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(daysLeft / 30) * 100}
                className={`progress-bar ${subscriptionStatus}`}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  ), [state.subscription, state.planName, state.maxProperties, subscriptionStatus, daysLeft]);

  const renderSubscriptionActions = useMemo(() => {
    if (!user?.isAdmin) return null;

    const actions = [
      { action: 'extending', label: 'Extend', icon: <AddCircleOutline />, color: 'primary', disabled: !state.subscription || !!state.action },
      { action: 'reducing', label: 'Reduce', icon: <RemoveCircleOutline />, color: 'secondary', disabled: !state.subscription || !!state.action || daysLeft <= 0 },
      { action: 'gettingSubscription', label: 'Get 1 Month', icon: <CardGiftcard />, color: 'success', disabled: !!state.action || daysLeft > 0 },
    ];

    return (
      <Box className="subscription-actions">
        <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.primary', fontWeight: 'bold' }}>
          Manage Subscription (Admin Only)
        </Typography>
        <Grid container spacing={2}>
          {actions.map(({ action, label, icon, color, disabled }) => (
            <Grid item xs={12} sm={4} key={action}>
              <Tooltip title={`${label} subscription`}>
                <span>
                  <Button
                    className={`action-button ${action}`}
                    variant={action === 'reducing' ? 'outlined' : 'contained'}
                    color={color}
                    fullWidth
                    startIcon={icon}
                    onClick={() => handleOpenDialog(action)}
                    disabled={disabled || !!state.action}
                  >
                    {label}
                  </Button>
                </span>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }, [user, state.action, state.subscription, daysLeft, handleOpenDialog]);

  const renderFeatures = useMemo(() => {
    const features = [
      { icon: <Apartment />, title: 'Property Management', description: 'Efficiently manage all your properties in one place' },
      { icon: <People />, title: 'Tenant Portal', description: 'Provide a seamless experience for your tenants' },
      { icon: <Timeline />, title: 'Maintenance Requests', description: 'Track and manage maintenance requests with ease' },
      { icon: <MonetizationOn />, title: 'Financial Reporting', description: 'Generate comprehensive financial reports' },
      { icon: <Security />, title: '24/7 Support', description: 'Round-the-clock support for all your needs' },
      { icon: <CreditCard />, title: 'Online Payments', description: 'Accept payments online for rent and other fees' },
    ];

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'text.primary', textAlign: 'center' }}>
          Plan Features
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className="feature-card">
                <CardContent className="feature-content">
                  <Avatar className="feature-icon" sx={{ bgcolor: 'primary.main' }}>
                    {React.cloneElement(feature.icon, { fontSize: 'large' })}
                  </Avatar>
                  <Typography variant="h6" component="div" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }, []);

  const renderContent = useMemo(() => {
    if (state.loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      );
    }

    return (
      <Paper className="styled-paper">
        {state.subscription ? (
          <>
            {renderSubscriptionDetails}
            <Divider sx={{ my: 4 }} />
            {renderSubscriptionActions}
            <Divider sx={{ my: 4 }} />
            {renderFeatures}
          </>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>Your subscription has expired or is inactive</Typography>
            {user?.isAdmin ? (
              <>
                <Divider sx={{ my: 3 }} />
                {renderSubscriptionActions}
              </>
            ) : (
              <Button
                className="view-pricing-button"
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => window.location.href = '/pricing'}
                startIcon={<InfoOutlined />}
              >
                View Pricing Plans
              </Button>
            )}
          </Box>
        )}
      </Paper>
    );
  }, [state.loading, state.subscription, user, renderSubscriptionDetails, renderSubscriptionActions, renderFeatures]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, color: 'text.primary', fontWeight: 'bold' }}>
          My Subscription Plan
        </Typography>
        {renderContent}
        <Snackbar
          open={!!state.message}
          autoHideDuration={6000}
          onClose={() => setState(prev => ({ ...prev, message: null }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setState(prev => ({ ...prev, message: null }))}
            severity={state.message?.severity}
            className="alert"
          >
            {state.message?.text}
          </Alert>
        </Snackbar>
        <Dialog
          open={state.openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className="dialog"
        >
          <DialogTitle id="alert-dialog-title">
            {state.dialogAction === 'extending' ? 'Extend Subscription' : 
             state.dialogAction === 'reducing' ? 'Reduce Subscription' : 
             'Get 1 Month Subscription'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {state.dialogAction === 'extending'
                ? 'Are you sure you want to extend your subscription by 1 week?'
                : state.dialogAction === 'reducing'
                ? 'Are you sure you want to reduce your subscription by 1 week?'
                : 'Are you sure you want to activate a 1-month subscription?'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
            <Button 
              onClick={handleConfirmAction} 
              color="primary" 
              autoFocus 
              variant="contained"
              disabled={!!state.action}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default MyPlan;