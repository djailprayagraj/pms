import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { PublicRoute, ProtectedRoute } from './Components/routes/ProtectedRoute';
import LoginPage2 from './Components/LoginPage2';
import AdminDashboard from './Components/admin/AdminDashboard';
import Dashboard from './Components/UsersDashboard/Dashboard';
import './App.css';
import AddUserPage from './Components/admin/AddUserPage';
import { BaseURL } from './BaseURL/Baseurl';

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

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <Routes>
      {/* 1. Public Routes (Redirects to dashboard if already logged in) */}
      <Route element={<PublicRoute />}>
        <Route 
          path="/login"                                                          //   /login
          element={<LoginPage2 onLoginSuccess={handleLoginSuccess} />} 
        />
        {/* Default route redirecting to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>



      {/* 2. Admin Protected Route */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route 
          path="/admin"                                                        //   /admin
          element={<AdminDashboard onLogout={handleLogout} />} 
        />
      </Route>


       <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route 
          path="/admin/addUser"                                                 //   /admin/addUser
          element={<AddUserPage />} 
        />
      </Route>
      

      {/* 3. Standard User / Staff Protected Route */}
      <Route element={<ProtectedRoute allowedRole="staff" /> /* or omit allowedRole if any logged-in user can access */}>
        <Route 
          path="/dashboard"                                                      //   /dashboard
          element={<Dashboard onLogout={handleLogout} />}
        />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;