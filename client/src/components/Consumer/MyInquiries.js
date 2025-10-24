import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function MyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.get('/inquiries/sent');
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
        <h1>My Inquiries</h1>
        <p>Track your inquiries and requests to distributors</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">All Inquiries</h2>
        </div>

        {inquiries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No inquiries found</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
              Browse materials and send inquiries to distributors
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {inquiries.map(inquiry => (
              <div
                key={inquiry.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                      {inquiry.material_name}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {inquiry.manufacturer} - {inquiry.category}
                    </div>
                  </div>
                  <span className={`badge badge-${inquiry.status === 'pending' ? 'warning' : inquiry.status === 'responded' ? 'success' : 'info'}`}>
                    {inquiry.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Distributor</div>
                    <div style={{ fontWeight: 500 }}>{inquiry.distributor_name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {inquiry.distributor_phone && `📞 ${inquiry.distributor_phone}`}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Quantity</div>
                    <div style={{ fontWeight: 500 }}>
                      {inquiry.quantity ? `${inquiry.quantity} ${inquiry.unit}` : 'Not specified'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date</div>
                    <div style={{ fontWeight: 500 }}>
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                    <div style={{ fontWeight: 500 }}>
                      {inquiry.status === 'pending' ? 'Waiting for response' : 
                       inquiry.status === 'responded' ? 'Distributor responded' : 'Inquiry closed'}
                    </div>
                  </div>
                </div>

                {inquiry.message && (
                  <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Your Message</div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>{inquiry.message}</div>
                  </div>
                )}

                <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                  {inquiry.status === 'pending' && '⏳ Waiting for distributor response...'}
                  {inquiry.status === 'responded' && '✅ The distributor has responded. Please check your contact details for communication.'}
                  {inquiry.status === 'closed' && '✓ This inquiry has been closed.'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyInquiries;

