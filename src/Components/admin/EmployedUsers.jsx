import React, { useState, useEffect } from 'react';
import { getAllUsersForAdmin, updateUserAdminApi, deleteUserAdminApi } from '../../api/authService';

const EmployedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    firNo: '',
    utNumber: '',
    username: '',
    password: '',
    role: 'staff',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllUsersForAdmin();
      
      if (response.success || response.data?.success) {
        const userData = response.data?.data || response.data;
        setUsers(userData);
      } else {
        setError('Failed to load users from server.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Network error: Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      fatherName: user.fatherName || '',
      firNo: user.firNo || '',
      utNumber: user.utNumber || '',
      username: user.username || '',
      password: user.password || '',
      role: user.role || 'staff',
    });
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setUpdating(true);
      setError(null);

      const payload = {
        username: formData.username,
        newPassword: formData.password,
        name: formData.name,
        fatherName: formData.fatherName,
        firNo: formData.firNo,
        utNumber: formData.utNumber,
        role: formData.role,
      };

      const res = await updateUserAdminApi(payload);
      
      if (res.success || res.data?.success) {
        setSuccessMessage('User updated successfully!');
        setSelectedUser(null);
        fetchUsers();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      const res = await deleteUserAdminApi(userId);

      if (res.success || res.data?.success || res) {
        setSuccessMessage(`User "${userName}" deleted successfully.`);
        fetchUsers();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Employed Users & Staff</h2>
          <p className="text-xs text-slate-400 mt-1">Manage personnel records, roles, credentials, and account lifecycle.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          🔄 Refresh List
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="bg-red-950/60 border border-red-800/80 text-red-200 px-4 py-3 rounded-xl text-xs font-mono shadow-lg flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 px-4 py-3 rounded-xl text-xs font-mono shadow-lg flex items-center justify-between">
          <span>✨ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Users Table Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Personnel Registry ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Name & ID</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">FIR No / Details</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading records from server...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500 text-xs">
                    No active user records found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/30 transition group">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-200 group-hover:text-white transition">{user.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">UT: {user.utNumber || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-300">{user.username}</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-400">
                      <div>FIR: {user.firNo || 'None'}</div>
                      <div className="text-[10px] text-slate-500">Father: {user.fatherName || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-semibold tracking-wider ${
                        user.role === 'admin' 
                          ? 'bg-red-950/80 text-red-300 border border-red-800/80' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shadow-sm inline-flex items-center gap-1"
                      >
                        <span>✏️</span> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-900/60 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shadow-sm inline-flex items-center gap-1"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col transform transition-all">
            
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">🛠️</span>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Editing Personnel: <span className="text-red-400 font-semibold">{selectedUser.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-7 h-7 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-600 transition shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-600 transition shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">FIR No</label>
                  <input
                    type="text"
                    name="firNo"
                    value={formData.firNo}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-600 transition shadow-inner font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">UT Number</label>
                  <input
                    type="text"
                    name="utNumber"
                    value={formData.utNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-600 transition shadow-inner font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-600 transition shadow-inner font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role Permission</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-600 transition shadow-inner"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password <span className="text-slate-500 font-normal lowercase">(fetched from backend, editable)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-12 text-sm text-slate-200 focus:outline-none focus:border-red-600 transition shadow-inner font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-base focus:outline-none cursor-pointer p-1"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer shadow-lg flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default EmployedUsers;