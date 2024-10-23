import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { userApi } from '../../api';
import { useUser } from '../../context/UserContext';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import {
  Container, Typography, Paper, Button, CircularProgress, Snackbar, Alert,
  Box, Grid, Divider, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, LinearProgress, Tooltip, Card, CardContent, Avatar
} from '@mui/material';
import {
  AddCircleOutline, RemoveCircleOutline, InfoOutlined, CardGiftcard,
  Timeline, People, Apartment, MonetizationOn, Security, CreditCard
} from '@mui/icons-material';

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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '10px 20px',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease-in-out',
        },
      },
    },
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
  },
}));

const GradientBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, #6200EA 0%, #B388FF 100%)',
  color: 'white',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    transform: 'rotate(30deg)',
  },
}));

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
    <GradientBox>
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
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    backgroundColor: subscriptionStatus === 'active' ? '#4caf50' : subscriptionStatus === 'expiring' ? '#ff9800' : '#f44336'
                  }
                }}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </GradientBox>
  ), [state.subscription, state.planName, state.maxProperties, subscriptionStatus, daysLeft]);


  const renderSubscriptionActions = useMemo(() => {
    if (!user?.isAdmin) return null;

    return (
      <Box sx={{ backgroundColor: 'background.paper', padding: 3, borderRadius: theme.shape.borderRadius * 2, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.primary', fontWeight: 'bold' }}>
          Manage Subscription (Admin Only)
        </Typography>
        <Grid container spacing={2}>
          {[
            { action: 'extending', label: 'Extend', icon: <AddCircleOutline />, color: 'primary', disabled: !state.subscription || !!state.action },
            { action: 'reducing', label: 'Reduce', icon: <RemoveCircleOutline />, color: 'secondary', disabled: !state.subscription || !!state.action || daysLeft <= 0 },
            { action: 'gettingSubscription', label: 'Get 1 Month', icon: <CardGiftcard />, color: 'success', disabled: !!state.action || daysLeft > 0 },
          ].map(({ action, label, icon, color, disabled }) => (
            <Grid item xs={12} sm={4} key={action}>
              <Tooltip title={`${label} subscription`}>
                <span>
                  <ActionButton
                    variant={action === 'reducing' ? 'outlined' : 'contained'}
                    color={color}
                    fullWidth
                    startIcon={icon}
                    onClick={() => handleOpenDialog(action)}
                    disabled={disabled || !!state.action}
                  >
                    {label}
                  </ActionButton>
                </span>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }, [user, state.action, state.subscription, daysLeft, handleOpenDialog]);

  const renderFeatures = useMemo(() => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'text.primary', textAlign: 'center' }}>
        Plan Features
      </Typography>
      <Grid container spacing={3}>
        {[
          { icon: <Apartment />, title: 'Property Management', description: 'Efficiently manage all your properties in one place' },
          { icon: <People />, title: 'Tenant Portal', description: 'Provide a seamless experience for your tenants' },
          { icon: <Timeline />, title: 'Maintenance Requests', description: 'Track and manage maintenance requests with ease' },
          { icon: <MonetizationOn />, title: 'Financial Reporting', description: 'Generate comprehensive financial reports' },
          { icon: <Security />, title: '24/7 Support', description: 'Round-the-clock support for all your needs' },
          { icon: <CreditCard />, title: 'Online Payments', description: 'Accept payments online for rent and other fees' },
        ].map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <FeatureCard>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mb: 2, width: 60, height: 60 }}>
                  {React.cloneElement(feature.icon, { fontSize: 'large' })}
                </Avatar>
                <Typography variant="h6" component="div" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  ), []);

  const renderContent = useMemo(() => {
    if (state.loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      );
    }

    return (
      <StyledPaper elevation={3}>
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
              <ActionButton
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => window.location.href = '/pricing'}
                startIcon={<InfoOutlined />}
                sx={{ mt: 2, maxWidth: 300, mx: 'auto' }}
              >
                View Pricing Plans
              </ActionButton>
            )}
          </Box>
        )}
      </StyledPaper>
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
            sx={{ width: '100%' }}
            variant="filled"
            elevation={6}
          >
            {state.message?.text}
          </Alert>
        </Snackbar>
        <Dialog
          open={state.openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            style: {
              borderRadius: '16px',
              padding: '16px',
            },
          }}
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