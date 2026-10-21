import React, { useState, useEffect } from 'react';
import { getAllUsersForAdmin, updateUserAdminApi } from '../../api/authService'; // Make sure updateUserAdminApi is imported

const EmployedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    firNo: '',
    utNumber: '',
    username: '',
    password: '', // maps to newPassword in backend payload
    role: 'staff',
  });

  // Fetch users on mount correctly using async/await
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllUsersForAdmin();
      
      // Axios stores the response body in response.data
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
      password: '', // Leave blank unless editing
      role: user.role || 'staff',
    });
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

      // Map password field to newPassword as expected by updateUserAdmin
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
        alert('User updated successfully!');
        setSelectedUser(null);
        fetchUsers(); // Refresh the table list
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-[50vw] mx-auto space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">Employed Users & Staff</h2>
        <p className="text-xs text-slate-400 mt-1">Manage personnel records and update credentials directly.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-xs font-mono">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4 pb-1 border-b border-slate-800">
          User Records List
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-2">Name / UT No</th>
                <th className="pb-3 px-2">Username</th>
                <th className="pb-3 px-2">Role</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-500 text-xs">
                    Loading records from server...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-500 text-xs">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-2">
                      <div className="font-medium text-slate-200">{user.name}</div>
                      <div className="text-xs font-mono text-slate-500">{user.utNumber || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-slate-300">{user.username}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        user.role === 'admin' 
                          ? 'bg-red-950 text-red-300 border border-red-800' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1 rounded text-xs transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Panel (Appears when a user is selected) */}
      {selectedUser && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative animate-fadeIn">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Editing User: {selectedUser.name}
            </h3>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer font-mono"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Password <span className="text-slate-500 font-normal">(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="text"
                  name="password"
                  placeholder="Enter new password if changing"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-600 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white text-xs font-medium px-5 py-2 rounded-lg transition cursor-pointer shadow-md"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployedUsers;