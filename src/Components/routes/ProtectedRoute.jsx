import { Navigate, Outlet } from 'react-router-dom';

// Route for guests only (like Login page) - if already logged in, redirect them away- a function 
export const PublicRoute = () => {
  const token = localStorage.getItem('token');
  return !token ? <Outlet /> : <Navigate to={JSON.parse(localStorage.getItem('user'))?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

// Route for authenticated users
export const ProtectedRoute = ({ allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // If role doesn't match, send them to their respective authorized page
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
};