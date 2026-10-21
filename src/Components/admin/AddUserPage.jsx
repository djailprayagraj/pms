import React, { useState } from 'react';
import { addUser } from '../../api/authService';
import { getAllUsersForAdmin } from '../../api/authService';

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    firNo: '',
    utNumber: '',
    username: '',
    password: '',
    verifyPassword: '',
    role: 'staff',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    // Validate matching passwords
    if (formData.password !== formData.verifyPassword) {
      setStatus({ type: 'error', text: 'Passwords do not match. Please verify.' });
      return;
    }

    setLoading(true);

    try {
      // Exclude verifyPassword from the payload sent to the API
      const { verifyPassword, ...payload } = formData;
      const res = await addUser(payload);
      
      setStatus({
        type: 'success',
        text: `User "${res.data.name || formData.name}" created successfully!`,
      });

      // Reset form on success
      setFormData({
        name: '',
        fatherName: '',
        firNo: '',
        utNumber: '',
        username: '',
        password: '',
        verifyPassword: '',
        role: 'staff',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to add user.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide">Add New User / Staff</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter official details to create a new user profile in the database.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative">
        {/* Status Message Alert */}
        {status.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-xs font-mono border ${
              status.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-red-950/60 border-red-800 text-red-200'
            }`}
          >
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal & Case Information */}
          <div>
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800/80">
              Personal & Legal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 transition"
                />
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 transition"
                />
              </div>

              {/* FIR No */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  FIR Number
                </label>
                <input
                  type="text"
                  name="firNo"
                  placeholder="e.g. FIR-2024/089"
                  value={formData.firNo}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 font-mono text-xs"
                />
              </div>

              {/* UT Number */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  UT Number
                </label>
                <input
                  type="text"
                  name="utNumber"
                  placeholder="Official UT Number"
                  value={formData.utNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Account & Authentication Details */}
          <div>
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800/80">
              Account Credentials & Role
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Username */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="staff_01"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 transition"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showVerifyPassword ? 'text' : 'password'}
                    name="verifyPassword"
                    required
                    placeholder="••••••••"
                    value={formData.verifyPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer text-xs focus:outline-none"
                    title={showVerifyPassword ? 'Hide password' : 'Show password'}
                  >
                    {showVerifyPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-600 cursor-pointer transition"
                >
                  <option value="staff">Staff User</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  name: '',
                  fatherName: '',
                  firNo: '',
                  utNumber: '',
                  username: '',
                  password: '',
                  verifyPassword: '',
                  role: 'staff',
                })
              }
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono px-4 py-2.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition cursor-pointer disabled:cursor-not-allowed shadow-md shadow-red-950/50"
            >
              {loading ? 'Submitting...' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}