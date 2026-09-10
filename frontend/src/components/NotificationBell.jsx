import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../services/notificationService';

export const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.unread_count);
    } catch {
      // Ignored
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      const list = res.results || res;
      setNotifications(list);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="bell-btn"
        onClick={toggleDropdown}
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                Loading...
              </p>
            ) : notifications.length === 0 ? (
              <p style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                No notifications yet.
              </p>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => handleMarkAsRead(n.id, n.is_read)}
                >
                  <h5>{n.title}</h5>
                  <p>{n.message}</p>
                  <span>{new Date(n.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
