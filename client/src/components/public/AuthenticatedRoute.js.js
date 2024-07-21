// src/components/AuthenticatedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    return <Navigate to="/" />;
  }
  return children;
};

export default AuthenticatedRoute;
