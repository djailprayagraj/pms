import { Routes, Route, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { PublicRoute, ProtectedRoute } from './Components/routes/ProtectedRoute';
import LoginPage2 from './Components/LoginPage2';
import AdminDashboard from './Components/admin/AdminDashboard';
import Dashboard from './Components/UsersDashboard/Dashboard';
import './App.css';
import AddUserPage from './Components/admin/AddUserPage';
import { BaseURL } from './BaseURL/Baseurl';
import UniversalUpdateComponent from './Components/UniversalUpdate/UniversalUpdateComponent';
import PrisonerHistory from './Components/PrisonersHistory/PrisonerHistory';

// Dedicated route guard for pages accessible by BOTH admin and staff
const SharedRoute = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  const navigate = useNavigate();

  // Handle successful login
  const handleLoginSuccess = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.role === 'admin') {
      navigate(`${BaseURL}/admin`, { replace: true });
    } else {
      navigate(`${BaseURL}/dashboard`, { replace: true });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      {/* 1. Public Routes (Redirects to dashboard if already logged in) */}
      <Route element={<PublicRoute />}>
        <Route 
          path="/login" 
          element={<LoginPage2 onLoginSuccess={handleLoginSuccess} />} 
        />
        {/* Default route redirecting to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* 2. Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route 
          path="/admin" 
          element={<AdminDashboard onLogout={handleLogout} />} 
        />
      </Route>

      {/* 3. Standard User / Staff Protected Route */}
      <Route element={<ProtectedRoute allowedRole="staff" />}>
        <Route 
          path="/dashboard" 
          element={<Dashboard onLogout={handleLogout} />}
        />
      </Route>

      {/* 4. Shared Routes (Accessible by BOTH Admin and Staff) */}
      <Route element={<SharedRoute />}>
        <Route 
          path="/universal-update" 
          element={<UniversalUpdateComponent />} 
        />
        <Route 
          path="/prisonerHistory/:utNumber" 
          element={<PrisonerHistory />} 
        />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;