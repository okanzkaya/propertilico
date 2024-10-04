import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { CircularProgress, Box, Typography, Button } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, checkAuthStatus, hasActiveSubscription } = useUser();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        setIsChecking(true);
        setError(null);
        try {
          await checkAuthStatus();
        } catch (err) {
          console.error('Authentication check failed:', err);
          setError('Failed to verify authentication. Please try logging in again.');
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [user, checkAuthStatus]);

  if (loading || isChecking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" color="primary" href="/signin">
          Sign In
        </Button>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  const isSubscriptionRoute = location.pathname === '/my-plan' || location.pathname.includes('/subscription');
  const isAppRoute = location.pathname.startsWith('/app/');

  if (isAppRoute && !hasActiveSubscription() && !isSubscriptionRoute) {
    return <Navigate to="/my-plan" replace />;
  }

  return children;
};

export default ProtectedRoute;