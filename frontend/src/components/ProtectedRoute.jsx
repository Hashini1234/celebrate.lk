import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const dashboardByRole = { admin: '/admin', vendor: '/vendor', customer: '/customer' };

  if (loading) return <div className="screen-message">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={dashboardByRole[user.role] || '/customer'} replace />;

  return children;
}
