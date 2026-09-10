import React, { useState } from 'react';
import { Save, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

export const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await authService.updateProfile(formData);
      updateUser(res.user);
      setProfileMsg({ type: 'success', text: 'Admin details updated.' });
    } catch (err) {
      setProfileMsg({ type: 'danger', text: 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });
    if (passwords.new_password !== passwords.confirm_new_password) {
      setPassMsg({ type: 'danger', text: 'Passwords do not match.' });
      return;
    }
    setSavingPass(true);
    try {
      await authService.changePassword(passwords);
      setPassMsg({ type: 'success', text: 'Password changed successfully.' });
      setPasswords({ old_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      setPassMsg({ type: 'danger', text: err.response?.data?.error || 'Password update failed.' });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div className="page-header">
        <div className="page-title">
          <h1>System Administrator Settings</h1>
          <p>Configure administrative access, contact email, and security credentials.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Admin Identity</h3>
          {profileMsg.text && (
            <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>
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
              <label className="form-label">Email (Read-only)</label>
              <input
                type="email"
                disabled
                className="form-control"
                value={user?.email || ''}
                style={{ opacity: 0.6 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              <Save size={16} /> Save Changes
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Security & Credentials</h3>
          {passMsg.text && (
            <div className={`alert alert-${passMsg.type}`}>{passMsg.text}</div>
          )}
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                className="form-control"
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
                value={passwords.confirm_new_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_new_password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-secondary" disabled={savingPass}>
              <Lock size={16} /> Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
