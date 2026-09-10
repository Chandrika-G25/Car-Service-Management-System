import React, { useState } from 'react';
import { User, Phone, MapPin, Lock, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

export const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const profile = user?.customer_profile || {};

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    pincode: profile.pincode || '',
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await authService.updateProfile(formData);
      updateUser(res.user);
      setProfileMessage({ type: 'success', text: 'Profile details successfully updated.' });
    } catch (err) {
      setProfileMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwords.new_password !== passwords.confirm_new_password) {
      setPasswordMessage({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword(passwords);
      setPasswordMessage({ type: 'success', text: 'Password successfully changed.' });
      setPasswords({ old_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.old_password?.[0] || 'Password change failed.';
      setPasswordMessage({ type: 'danger', text: errMsg });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>My Profile</h1>
          <p>Manage your contact coordinates, location, and account credentials.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Profile Details Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Personal Information</h3>

          {profileMessage.text && (
            <div className={`alert alert-${profileMessage.type}`}>{profileMessage.text}</div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                className="form-control"
                value={user?.email || ''}
                style={{ opacity: 0.6 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                required
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / Pincode</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Security & Password</h3>

          {passwordMessage.text && (
            <div className={`alert alert-${passwordMessage.type}`}>{passwordMessage.text}</div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Enter current password"
                value={passwords.old_password}
                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-control"
                placeholder="Minimum 6 characters"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-control"
                placeholder="Re-enter new password"
                value={passwords.confirm_new_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_new_password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={savingPassword}>
              <Lock size={16} /> {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
