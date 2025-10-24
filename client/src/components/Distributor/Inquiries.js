import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.get('/inquiries/received');
      setInquiries(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
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
        <h1>Consumer Inquiries</h1>
        <p>Manage customer inquiries and requests</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">All Inquiries</h2>
        </div>

        {inquiries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No inquiries found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Consumer</th>
                  <th>Contact</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inquiry => (
                  <tr key={inquiry.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{inquiry.consumer_name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{inquiry.consumer_email}</div>
                      </div>
                    </td>
                    <td>{inquiry.consumer_phone || 'N/A'}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{inquiry.material_name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {inquiry.manufacturer} {inquiry.category}
                        </div>
                      </div>
                    </td>
                    <td>
                      {inquiry.quantity ? `${inquiry.quantity} ${inquiry.unit}` : 'Not specified'}
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      {inquiry.message || <span style={{ color: '#9ca3af' }}>No message</span>}
                    </td>
                    <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${inquiry.status === 'pending' ? 'warning' : inquiry.status === 'responded' ? 'success' : 'info'}`}>
                        {inquiry.status}
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

export default Inquiries;

