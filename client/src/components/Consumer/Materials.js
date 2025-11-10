import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Materials() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/prices/all');
      setPrices(data);
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
        <h1>Materials & Prices</h1>
        <p>Compare prices from different distributors and find the best deals</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Today's Prices</h2>
        </div>

        {prices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-text">No materials found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Grade/Type</th>
                  <th>Price</th>
                  <th>Distributor</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.material_name}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.grade || item.type || '-'}</td>
                    <td>
                      <div>
                        <span style={{ fontSize: '18px', fontWeight: 600, color: '#16a34a' }}>
                          ₹{item.price.toLocaleString()}
                        </span>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>per {item.unit}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.distributor_name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.distributor_address}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px' }}>
                        {item.distributor_phone && (
                          <div>📞 {item.distributor_phone}</div>
                        )}
                      </div>
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

export default Materials;

