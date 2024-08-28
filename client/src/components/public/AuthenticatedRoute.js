import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? <Navigate to="/app/dashboard" /> : children;
};

export default AuthenticatedRoute;
