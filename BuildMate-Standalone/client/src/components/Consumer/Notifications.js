import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Stay updated with price changes and important updates</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">All Notifications</h2>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <p className="empty-state-text">No notifications yet</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
              You'll receive notifications when distributors update prices or respond to your inquiries
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  padding: '16px',
                  backgroundColor: notification.is_read ? '#fff' : '#eff6ff',
                  border: `1px solid ${notification.is_read ? '#e5e7eb' : '#bfdbfe'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>
                    {notification.type === 'price_update' ? '💰' : 
                     notification.type === 'inquiry' ? '📨' : 'ℹ️'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#2563eb'
                          }}
                        />
                      )}
                    </div>
                    <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                      {notification.message}
                    </p>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                      <span>From: {notification.from_user_name}</span>
                      <span style={{ margin: '0 8px' }}>•</span>
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;

