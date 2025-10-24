import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Overview() {
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalInventoryValue: 0,
    pendingInquiries: 0,
    todayUpdates: 0
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inventoryRes, pricesRes, inquiriesRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/prices/my-prices'),
        api.get('/inquiries/received')
      ]);

      const inventory = inventoryRes.data;
      const prices = pricesRes.data;
      const inquiries = inquiriesRes.data;

      // Calculate stats
      const totalValue = inventory.reduce((sum, item) => {
        const price = prices.find(p => p.material_id === item.material_id)?.price || 0;
        return sum + (item.quantity * price);
      }, 0);

      const pendingCount = inquiries.filter(i => i.status === 'pending').length;

      setStats({
        totalMaterials: inventory.length,
        totalInventoryValue: totalValue,
        pendingInquiries: pendingCount,
        todayUpdates: prices.filter(p => p.effective_date === new Date().toISOString().split('T')[0]).length
      });

      // Get recent inquiries
      setRecentInquiries(inquiries.slice(0, 5));

      // Get low stock items (less than 50 units)
      setLowStock(inventory.filter(item => item.quantity < 50).slice(0, 5));

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
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your business today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Materials</span>
            <span className="stat-icon">📦</span>
          </div>
          <div className="stat-value">{stats.totalMaterials}</div>
          <div className="stat-change">Active in inventory</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Inventory Value</span>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-value">₹{stats.totalInventoryValue.toLocaleString()}</div>
          <div className="stat-change">Estimated total value</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending Inquiries</span>
            <span className="stat-icon">📨</span>
          </div>
          <div className="stat-value">{stats.pendingInquiries}</div>
          <div className="stat-change">Need attention</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Today's Updates</span>
            <span className="stat-icon">🔄</span>
          </div>
          <div className="stat-value">{stats.todayUpdates}</div>
          <div className="stat-change">Prices updated today</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Inquiries</h2>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No inquiries yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Consumer</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map(inquiry => (
                  <tr key={inquiry.id}>
                    <td>{inquiry.consumer_name}</td>
                    <td>{inquiry.material_name}</td>
                    <td>{inquiry.quantity ? `${inquiry.quantity} ${inquiry.unit}` : 'Not specified'}</td>
                    <td>
                      <span className={`badge badge-${inquiry.status === 'pending' ? 'warning' : inquiry.status === 'responded' ? 'success' : 'info'}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Low Stock Alert</h2>
        </div>

        {lowStock.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <p className="empty-state-text">All items are well stocked</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(item => (
                  <tr key={item.id}>
                    <td>{item.material_name}</td>
                    <td>{item.category}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>
                      <span className={`badge ${item.quantity < 20 ? 'badge-danger' : 'badge-warning'}`}>
                        {item.quantity < 20 ? 'Critical' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Overview;

