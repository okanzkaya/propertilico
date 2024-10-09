import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { userApi } from '../../api';
import { useUser } from '../../context/UserContext';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import {
  Container, Typography, Paper, Button, CircularProgress, Snackbar, Alert,
  Box, Grid, Divider, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, LinearProgress, Tooltip
} from '@mui/material';
import {
  AddCircleOutline, RemoveCircleOutline, InfoOutlined, 
  CheckCircleOutline, CardGiftcard
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: { main: '#2196f3' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .1)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 12px 4px rgba(0, 0, 0, .15)',
  },
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
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
    <>
      <Typography variant="h6" gutterBottom>Subscription Details</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" component="span" mr={1}>
              Status:
            </Typography>
            <Chip
              label={subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
              color={subscriptionStatus === 'active' ? 'success' : subscriptionStatus === 'expiring' ? 'warning' : 'error'}
              size="small"
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            Expiry Date: {state.subscription ? new Date(state.subscription).toLocaleDateString() : 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">Plan: {state.planName}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">Max Properties: {state.maxProperties}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>
            Days Remaining: {daysLeft > 0 ? daysLeft : 'No active subscription'}
          </Typography>
          {daysLeft > 0 && (
            <LinearProgress
              variant="determinate"
              value={(daysLeft / 30) * 100}
              color={subscriptionStatus === 'active' ? 'success' : subscriptionStatus === 'expiring' ? 'warning' : 'error'}
            />
          )}
        </Grid>
      </Grid>
    </>
  ), [state.subscription, state.planName, state.maxProperties, subscriptionStatus, daysLeft]);

  const renderSubscriptionActions = useMemo(() => {
    if (!user?.isAdmin) return null;

    return (
      <Box sx={{ backgroundColor: 'rgba(255, 255, 0, 0.1)', padding: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
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
                  <Button
                    variant={action === 'reducing' ? 'outlined' : 'contained'}
                    color={color}
                    fullWidth
                    startIcon={icon}
                    onClick={() => handleOpenDialog(action)}
                    disabled={disabled}
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

  const renderFeatures = useMemo(() => (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Plan Features</Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        {['Property Management', 'Tenant Portal', 'Maintenance Requests', 'Financial Reporting', '24/7 Support'].map((feature) => (
          <FeatureChip key={feature} icon={<CheckCircleOutline />} label={feature} color="primary" />
        ))}
      </Box>
    </>
  ), []);

  const renderContent = useMemo(() => {
    if (state.loading) {
      return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
    }

    return (
      <StyledPaper elevation={3}>
        {state.subscription ? (
          <>
            {renderSubscriptionDetails}
            <Divider sx={{ my: 3 }} />
            {renderSubscriptionActions}
            <Divider sx={{ my: 3 }} />
            {renderFeatures}
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>Your subscription has expired or is inactive</Typography>
            {user?.isAdmin ? (
              <>
                <Divider sx={{ my: 3 }} />
                {renderSubscriptionActions}
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => window.location.href = '/pricing'}
                startIcon={<InfoOutlined />}
              >
                View Pricing Plans
              </Button>
            )}
          </>
        )}
      </StyledPaper>
    );
  }, [state.loading, state.subscription, user, renderSubscriptionDetails, renderSubscriptionActions, renderFeatures]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          My Subscription Plan
        </Typography>
        {renderContent}
        <Snackbar
          open={!!state.message}
          autoHideDuration={6000}
          onClose={() => setState(prev => ({ ...prev, message: null }))}
        >
          <Alert
            onClose={() => setState(prev => ({ ...prev, message: null }))}
            severity={state.message?.severity}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {state.message?.text}
          </Alert>
        </Snackbar>
        <Dialog
          open={state.openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
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
            <Button onClick={handleConfirmAction} color="primary" autoFocus variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default MyPlan;