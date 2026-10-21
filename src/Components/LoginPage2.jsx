import React, { useState } from 'react';
import { loginUser } from '../api/authService'; // Adjust path based on your folder structure

const LoginPage2 = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI states for feedback and loading
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' }); // 'success' or 'error'

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: '', type: '' });

    try {
      // Hit the login API with the required payload structure
      const data = { role, username, password };
      const response = await loginUser(data);

      console.log('Login Success:', response);
      
      // Show custom success toast banner
      showToast(`Welcome back, ${response.user.name}! Role: ${response.user.role}`, 'success');
      
      // Wait 1.5 seconds so the user can see the toast before reloading/redirecting
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      // Extract error message safely from Axios response if available
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      showToast(errorMessage, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative">
      {/* Background Subtle Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10"></div>

      {/* Floating Toast Notification Bar */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 animate-bounce-once ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200' 
            : 'bg-red-950/90 border-red-600 text-red-200'
        }`}>
          <div className={`w-3 h-3 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-xs font-mono font-medium">{toast.message}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header / Branding */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 text-center">
          <div className="h-12 w-12 mx-auto rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-lg shadow-lg mb-3">
            DJ
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">District Jail Prayagraj</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">Secure Management Portal</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {/* Role Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Access Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 appearance-none cursor-pointer"
              >
                <option value="admin">Admin (Warden/Superintendent)</option>
                <option value="user">User (Staff/Officer)</option>
                <option value="guest">Guest (Visitor/Auditor)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Official Username or ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. admin_user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Password Field with Eye Icon Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Security Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer text-xs focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-md shadow-red-950/50 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        {/* Footer info */}
        <div className="bg-slate-950/50 border-t border-slate-800 px-6 py-3 text-center">
          <p className="text-xs text-slate-500 font-mono">
            Authorized Personnel Only • IP Logged
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage2;