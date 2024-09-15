import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { extendSubscription, reduceSubscription, getProtectedData } from '../../api';
import { useUser } from '../../context/UserContext';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import {
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Grid,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  AddCircleOutline,
  RemoveCircleOutline,
  InfoOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
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
    extending: false,
    reducing: false,
    message: null,
    openDialog: false,
    dialogAction: null,
  });

  const handleSubscriptionChange = useCallback(async (action) => {
    if (!user?.isAdmin) {
      setState((prev) => ({
        ...prev,
        message: {
          text: 'Unauthorized access. This incident will be reported.',
          severity: 'error',
        },
      }));
      console.error('Unauthorized subscription change attempt');
      return;
    }

    setState((prev) => ({ ...prev, message: null, [action]: true }));
    try {
      let data;
      switch (action) {
        case 'extending':
          data = await extendSubscription();
          break;
        case 'reducing':
          data = await reduceSubscription();
          break;
        default:
          throw new Error('Invalid action');
      }
      setState((prev) => ({
        ...prev,
        subscription: data.subscriptionEndDate,
        [action]: false,
        message: {
          text: `Subscription ${action === 'extending' ? 'extended' : 'reduced'} successfully.`,
          severity: 'success',
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        [action]: false,
        message: {
          text: `Failed to ${action === 'extending' ? 'extend' : 'reduce'} subscription. ${error.message}`,
          severity: 'error',
        },
      }));
    }
  }, [user]);

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await getProtectedData();
      setState((prev) => ({ ...prev, subscription: data.subscriptionEndDate, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        message: { text: 'Failed to load subscription details. Please try again later.', severity: 'error' },
      }));
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const { daysLeft, subscriptionStatus } = useMemo(() => {
    if (!state.subscription) return { daysLeft: 0, subscriptionStatus: 'inactive' };
    const days = Math.ceil((new Date(state.subscription) - new Date()) / (1000 * 60 * 60 * 24));
    return {
      daysLeft: days,
      subscriptionStatus: days > 0 ? (days <= 7 ? 'expiring' : 'active') : 'expired',
    };
  }, [state.subscription]);

  const handleOpenDialog = (action) => {
    setState((prev) => ({ ...prev, openDialog: true, dialogAction: action }));
  };

  const handleCloseDialog = () => {
    setState((prev) => ({ ...prev, openDialog: false, dialogAction: null }));
  };

  const handleConfirmAction = () => {
    handleSubscriptionChange(state.dialogAction);
    handleCloseDialog();
  };

  const renderSubscriptionDetails = () => (
    <>
      <Typography variant="h6" gutterBottom>
        Subscription Details
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            Status:{' '}
            <Chip
              label={subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
              color={subscriptionStatus === 'active' ? 'success' : subscriptionStatus === 'expiring' ? 'warning' : 'error'}
              size="small"
            />
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            Expiry Date: {new Date(state.subscription).toLocaleDateString()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>Days Remaining: {daysLeft}</Typography>
          <LinearProgress
            variant="determinate"
            value={(daysLeft / 30) * 100}
            color={subscriptionStatus === 'active' ? 'success' : subscriptionStatus === 'expiring' ? 'warning' : 'error'}
          />
        </Grid>
      </Grid>
    </>
  );

  const renderSubscriptionActions = () => {
    if (!user?.isAdmin) return null;

    return (
      <>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Manage Subscription
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Tooltip title="Extend your subscription by 1 week">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<AddCircleOutline />}
                  onClick={() => handleOpenDialog('extending')}
                  disabled={state.extending || state.reducing}
                >
                  Extend
                </Button>
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Tooltip title="Reduce your subscription by 1 week">
              <span>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<RemoveCircleOutline />}
                  onClick={() => handleOpenDialog('reducing')}
                  disabled={state.extending || state.reducing || daysLeft <= 7}
                >
                  Reduce
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderFeatures = () => (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Plan Features
      </Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="center">
        <FeatureChip icon={<CheckCircleOutline />} label="Property Management" color="primary" />
        <FeatureChip icon={<CheckCircleOutline />} label="Tenant Portal" color="primary" />
        <FeatureChip icon={<CheckCircleOutline />} label="Maintenance Requests" color="primary" />
        <FeatureChip icon={<CheckCircleOutline />} label="Financial Reporting" color="primary" />
        <FeatureChip icon={<CheckCircleOutline />} label="24/7 Support" color="primary" />
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          My Subscription Plan
        </Typography>
        {state.loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <StyledPaper elevation={3}>
            {state.subscription && subscriptionStatus !== 'expired' ? (
              <>
                {renderSubscriptionDetails()}
                <Divider sx={{ my: 3 }} />
                {renderSubscriptionActions()}
                <Divider sx={{ my: 3 }} />
                {renderFeatures()}
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>Your subscription has expired</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => window.location.href = '/pricing'}
                  startIcon={<InfoOutlined />}
                >
                  View Pricing Plans
                </Button>
              </>
            )}
          </StyledPaper>
        )}
        <Snackbar
          open={!!state.message}
          autoHideDuration={6000}
          onClose={() => setState((prev) => ({ ...prev, message: null }))}
        >
          <Alert
            onClose={() => setState((prev) => ({ ...prev, message: null }))}
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
            {state.dialogAction === 'extending' ? 'Extend Subscription' : 'Reduce Subscription'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {state.dialogAction === 'extending'
                ? 'Are you sure you want to extend your subscription by 1 week?'
                : 'Are you sure you want to reduce your subscription by 1 week?'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
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