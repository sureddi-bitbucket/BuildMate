import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Pricing() {
  const [prices, setPrices] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, materialsRes] = await Promise.all([
        api.get('/prices/my-prices'),
        api.get('/materials')
      ]);
      setPrices(pricesRes.data);
      setMaterials(materialsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSetPrice = (material) => {
    setSelectedMaterial(material);
    setNewPrice('');
    setShowPriceModal(true);
  };

  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) < 0) {
      alert('Please enter a valid price');
      return;
    }

    setUpdating(true);
    try {
      await api.post('/prices', {
        materialId: selectedMaterial.id,
        price: parseFloat(newPrice),
        effectiveDate: new Date().toISOString().split('T')[0]
      });
      
      setShowPriceModal(false);
      setNewPrice('');
      setSelectedMaterial(null);
      fetchData(); // Refresh data
      alert('Price updated successfully!');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price. Please try again.');
    }
    setUpdating(false);
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
        <h1>Price Management</h1>
        <p>Set and update daily prices for your materials</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Current Prices</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowPriceModal(true)}
          >
            + Set New Price
          </button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Grade/Type</th>
                <th>Stock</th>
                <th>Price per Unit</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {prices.map(item => (
                <tr key={item.id}>
                  <td>{item.material_name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                  <td>{item.manufacturer}</td>
                  <td>{item.grade || item.type || '-'}</td>
                  <td>
                    {item.quantity !== null ? (
                      <span className={item.quantity < 50 ? 'badge badge-warning' : 'badge badge-success'}>
                        {item.quantity} {item.unit}
                      </span>
                    ) : (
                      <span className="badge badge-danger">Not in inventory</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: '#16a34a' }}>
                      ₹{item.price.toLocaleString()}
                    </span>
                  </td>
                  <td>{new Date(item.effective_date).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-outline btn-small"
                      onClick={() => handleSetPrice(item)}
                    >
                      Update Price
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Setting Modal */}
      {showPriceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {selectedMaterial ? 'Update Price' : 'Set New Price'}
                {selectedMaterial && ` - ${selectedMaterial.material_name}`}
              </h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowPriceModal(false);
                  setSelectedMaterial(null);
                  setNewPrice('');
                }}
              >
                ×
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="materialSelect">Select Material</label>
              <select
                id="materialSelect"
                value={selectedMaterial?.id || ''}
                onChange={(e) => {
                  const material = materials.find(m => m.id === parseInt(e.target.value));
                  setSelectedMaterial(material);
                }}
                disabled={!!selectedMaterial}
              >
                <option value="">Choose a material...</option>
                {materials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} - {material.manufacturer} ({material.category})
                  </option>
                ))}
              </select>
            </div>

            {selectedMaterial && (
              <div className="input-group">
                <label htmlFor="price">Price per {selectedMaterial.unit}</label>
                <input
                  type="number"
                  id="price"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowPriceModal(false);
                  setSelectedMaterial(null);
                  setNewPrice('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdatePrice}
                disabled={!selectedMaterial || !newPrice || updating}
              >
                {updating ? 'Updating...' : 'Update Price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pricing;

