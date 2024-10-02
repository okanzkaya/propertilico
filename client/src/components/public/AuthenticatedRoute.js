import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { CircularProgress, Box } from '@mui/material';

const AuthenticatedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    // If the user is authenticated, redirect to the main page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthenticatedRoute;