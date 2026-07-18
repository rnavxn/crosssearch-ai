import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('access_token');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the child routes (which will be wrapped by DesktopLayout)
  return <Outlet />;
};

export default ProtectedRoute;
