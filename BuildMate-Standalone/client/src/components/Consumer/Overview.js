import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Overview() {
  const [stats, setStats] = useState({
    totalDistributors: 0,
    totalMaterials: 0,
    activeInquiries: 0,
    priceUpdates: 0
  });
  const [recentPrices, setRecentPrices] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, distributorsRes, inquiriesRes, notificationsRes] = await Promise.all([
        api.get('/prices/all'),
        api.get('/users/distributors'),
        api.get('/inquiries/sent'),
        api.get('/notifications')
      ]);

      const prices = pricesRes.data;
      const inquiries = inquiriesRes.data;
      const notifications = notificationsRes.data;

      // Group prices by material to get unique materials
      const uniqueMaterials = new Set(prices.map(p => p.material_id));

      // Count price update notifications
      const priceUpdateCount = notifications.filter(
        n => n.type === 'price_update' && !n.is_read
      ).length;

      setStats({
        totalDistributors: distributorsRes.data.length,
        totalMaterials: uniqueMaterials.size,
        activeInquiries: inquiries.filter(i => i.status !== 'closed').length,
        priceUpdates: priceUpdateCount
      });

      // Get recent prices (latest 6)
      setRecentPrices(prices.slice(0, 6));
      setDistributors(distributorsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
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
        <h1>Welcome to BuildMate</h1>
        <p>Find the best prices for building materials from trusted distributors</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Distributors</span>
            <span className="stat-icon">🏪</span>
          </div>
          <div className="stat-value">{stats.totalDistributors}</div>
          <div className="stat-change">Available vendors</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Materials</span>
            <span className="stat-icon">🏗️</span>
          </div>
          <div className="stat-value">{stats.totalMaterials}</div>
          <div className="stat-change">Different materials</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Inquiries</span>
            <span className="stat-icon">📨</span>
          </div>
          <div className="stat-value">{stats.activeInquiries}</div>
          <div className="stat-change">Pending responses</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Price Updates</span>
            <span className="stat-icon">🔔</span>
          </div>
          <div className="stat-value">{stats.priceUpdates}</div>
          <div className="stat-change">New notifications</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">💰 Today's Daily Prices</h2>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Updated daily by distributors
          </div>
        </div>

        {recentPrices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-text">No prices available yet</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
              Distributors will update their daily prices here
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
            {recentPrices.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: '#111827' }}>
                      {item.material_name}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                      {item.category} • {item.manufacturer}
                    </div>
                    {(item.grade || item.type) && (
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>
                        {item.grade || item.type}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>
                      ₹{item.price.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      per {item.unit}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: '#2563eb' }}>
                      {item.distributor_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                        {item.distributor_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {item.distributor_address}
                      </div>
                    </div>
                  </div>
                  
                  {item.distributor_phone && (
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📞 {item.distributor_phone}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', fontStyle: 'italic' }}>
                    Updated: {new Date(item.effective_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Available Distributors</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {distributors.map(distributor => (
            <div
              key={distributor.id}
              style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '20px',
                    marginRight: '12px'
                  }}
                >
                  {distributor.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{distributor.name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Distributor</p>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {distributor.phone && (
                  <div style={{ marginBottom: '4px' }}>📞 {distributor.phone}</div>
                )}
                {distributor.address && (
                  <div style={{ marginBottom: '4px' }}>📍 {distributor.address}</div>
                )}
                <div>✉️ {distributor.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Overview;

