import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Check } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import Loading from '../../components/Loading';

export const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = filterUnread ? { unread: true } : {};
      const res = await notificationService.getNotifications(params);
      setNotifications(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterUnread]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Notifications</h1>
          <p>System status updates, technician notes, and appointment confirmations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn btn-sm ${filterUnread ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterUnread(!filterUnread)}
          >
            {filterUnread ? 'Showing Unread' : 'Show Unread Only'}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={handleMarkAll}>
            <CheckCheck size={16} /> Mark All Read
          </button>
        </div>
      </div>

      {loading ? (
        <Loading message="Fetching alerts and notices..." />
      ) : notifications.length === 0 ? (
        <div className="card empty-state">
          <Bell size={40} />
          <h3>No Notifications</h3>
          <p>You are all caught up with your vehicle alerts.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: !n.is_read ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '1rem', margin: 0 }}>{n.title}</h4>
                  {!n.is_read && (
                    <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>New</span>
                  )}
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{n.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem', display: 'block' }}>
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>

              {!n.is_read && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleMarkAsRead(n.id)}
                  title="Mark as read"
                >
                  <Check size={14} /> Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerNotifications;
