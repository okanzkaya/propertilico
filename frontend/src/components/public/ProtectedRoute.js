import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  console.log('ProtectedRoute - Current user:', user);
  console.log('ProtectedRoute - Current location:', location.pathname);

  if (loading) {
    console.log('ProtectedRoute - Loading user data...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const isNewUser = user.createdAt && (new Date() - new Date(user.createdAt) < 24 * 60 * 60 * 1000); // User created less than 24 hours ago
  console.log('ProtectedRoute - Is new user:', isNewUser);

  const isSubscriptionRoute = location.pathname === '/my-plan' || location.pathname.includes('/subscription');
  const isAppRoute = location.pathname.startsWith('/app/');

  console.log('ProtectedRoute - Has active subscription:', user.hasActiveSubscription);
  console.log('ProtectedRoute - Is subscription route:', isSubscriptionRoute);
  console.log('ProtectedRoute - Is app route:', isAppRoute);

  if (isAppRoute && !user.hasActiveSubscription && !isNewUser && !isSubscriptionRoute) {
    console.log('ProtectedRoute - Redirecting to My Plan page');
    return <Navigate to="/my-plan" replace />;
  }

  console.log('ProtectedRoute - Allowing access to protected route');
  return children;
};

export default ProtectedRoute;