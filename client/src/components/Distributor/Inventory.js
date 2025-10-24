import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inventoryRes, materialsRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/materials')
      ]);
      setInventory(inventoryRes.data);
      setMaterials(materialsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddInventory = () => {
    setFormData({ materialId: '', quantity: '' });
    setSelectedItem(null);
    setShowAddModal(true);
  };

  const handleEditInventory = (item) => {
    setSelectedItem(item);
    setFormData({
      materialId: item.material_id,
      quantity: item.quantity.toString()
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.materialId || formData.quantity === '' || isNaN(formData.quantity) || parseFloat(formData.quantity) < 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/inventory/${formData.materialId}`, {
        quantity: parseFloat(formData.quantity)
      });
      
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({ materialId: '', quantity: '' });
      setSelectedItem(null);
      fetchData(); // Refresh data
      alert(selectedItem ? 'Inventory updated successfully!' : 'Inventory added successfully!');
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory. Please try again.');
    }
    setUpdating(false);
  };

  const handleDeleteInventory = async (item) => {
    if (!window.confirm(`Are you sure you want to remove ${item.material_name} from inventory?`)) {
      return;
    }

    try {
      await api.put(`/inventory/${item.material_id}`, {
        quantity: 0
      });
      fetchData(); // Refresh data
      alert('Inventory item removed successfully!');
    } catch (error) {
      console.error('Error deleting inventory:', error);
      alert('Failed to remove inventory item. Please try again.');
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
        <h1>Inventory Management</h1>
        <p>Add, update, and manage your stock levels</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Stock Levels</h2>
          <button 
            className="btn btn-primary"
            onClick={handleAddInventory}
          >
            + Add to Inventory
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
                <th>Quantity</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const getStockStatus = (quantity) => {
                  if (quantity === 0) return { label: 'Out of Stock', class: 'badge-danger' };
                  if (quantity < 20) return { label: 'Critical', class: 'badge-danger' };
                  if (quantity < 50) return { label: 'Low Stock', class: 'badge-warning' };
                  return { label: 'In Stock', class: 'badge-success' };
                };

                const status = getStockStatus(item.quantity);

                return (
                  <tr key={item.id}>
                    <td>{item.material_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.grade || item.type || '-'}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '16px' }}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </td>
                    <td>{new Date(item.last_updated).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-outline btn-small"
                          onClick={() => handleEditInventory(item)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteInventory(item)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add to Inventory</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ materialId: '', quantity: '' });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="materialSelect">Select Material</label>
                <select
                  id="materialSelect"
                  value={formData.materialId}
                  onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                  required
                >
                  <option value="">Choose a material...</option>
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} - {material.manufacturer} ({material.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ materialId: '', quantity: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Adding...' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Inventory - {selectedItem?.material_name}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                  setFormData({ materialId: '', quantity: '' });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="editQuantity">Quantity</label>
                <input
                  type="number"
                  id="editQuantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                    setFormData({ materialId: '', quantity: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;

