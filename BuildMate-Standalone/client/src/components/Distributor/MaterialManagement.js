import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function MaterialManagement() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cement',
    manufacturer: '',
    grade: '',
    type: '',
    description: '',
    unit: 'piece'
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setLoading(false);
    }
  };

  const handleAddMaterial = () => {
    setFormData({
      name: '',
      category: 'cement',
      manufacturer: '',
      grade: '',
      type: '',
      description: '',
      unit: 'piece'
    });
    setSelectedMaterial(null);
    setShowAddModal(true);
  };

  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      manufacturer: material.manufacturer,
      grade: material.grade || '',
      type: material.type || '',
      description: material.description || '',
      unit: material.unit
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.manufacturer) {
      alert('Please fill in all required fields');
      return;
    }

    setUpdating(true);
    try {
      if (selectedMaterial) {
        // Update existing material
        await api.put(`/materials/${selectedMaterial.id}`, formData);
        alert('Material updated successfully!');
      } else {
        // Add new material
        await api.post('/materials', formData);
        alert('Material added successfully!');
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({
        name: '',
        category: 'cement',
        manufacturer: '',
        grade: '',
        type: '',
        description: '',
        unit: 'piece'
      });
      setSelectedMaterial(null);
      fetchMaterials(); // Refresh data
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Failed to save material. Please try again.');
    }
    setUpdating(false);
  };

  const handleDeleteMaterial = async (material) => {
    if (!window.confirm(`Are you sure you want to delete ${material.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/materials/${material.id}`);
      fetchMaterials(); // Refresh data
      alert('Material deleted successfully!');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material. Please try again.');
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
        <h1>Material Management</h1>
        <p>Add, update, and manage building materials in your catalog</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Materials Catalog</h2>
          <button 
            className="btn btn-primary"
            onClick={handleAddMaterial}
          >
            + Add New Material
          </button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Grade/Type</th>
                <th>Unit</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(material => (
                <tr key={material.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{material.name}</div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                      {material.category}
                    </span>
                  </td>
                  <td>{material.manufacturer}</td>
                  <td>{material.grade || material.type || '-'}</td>
                  <td>{material.unit}</td>
                  <td style={{ maxWidth: '200px' }}>
                    {material.description || <span style={{ color: '#9ca3af' }}>No description</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => handleEditMaterial(material)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteMaterial(material)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Material</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: '',
                    category: 'cement',
                    manufacturer: '',
                    grade: '',
                    type: '',
                    description: '',
                    unit: 'piece'
                  });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="name">Material Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., OPC 43 Grade Cement"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="cement">Cement</option>
                  <option value="steel">Steel</option>
                  <option value="tiles">Tiles</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="manufacturer">Manufacturer *</label>
                <input
                  type="text"
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g., UltraTech, TATA Steel"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label htmlFor="grade">Grade</label>
                  <input
                    type="text"
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g., 43, 53, Fe 500"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="type">Type</label>
                  <input
                    type="text"
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Vitrified, Ceramic"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="piece">Piece</option>
                  <option value="bag">Bag</option>
                  <option value="kg">Kilogram</option>
                  <option value="ton">Ton</option>
                  <option value="box">Box</option>
                  <option value="sqft">Square Feet</option>
                  <option value="sqm">Square Meter</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of the material"
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      name: '',
                      category: 'cement',
                      manufacturer: '',
                      grade: '',
                      type: '',
                      description: '',
                      unit: 'piece'
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Adding...' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Material - {selectedMaterial?.name}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMaterial(null);
                  setFormData({
                    name: '',
                    category: 'cement',
                    manufacturer: '',
                    grade: '',
                    type: '',
                    description: '',
                    unit: 'piece'
                  });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="editName">Material Name *</label>
                <input
                  type="text"
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="editCategory">Category *</label>
                <select
                  id="editCategory"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="cement">Cement</option>
                  <option value="steel">Steel</option>
                  <option value="tiles">Tiles</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="editManufacturer">Manufacturer *</label>
                <input
                  type="text"
                  id="editManufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label htmlFor="editGrade">Grade</label>
                  <input
                    type="text"
                    id="editGrade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="editType">Type</label>
                  <input
                    type="text"
                    id="editType"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="editUnit">Unit</label>
                <select
                  id="editUnit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="piece">Piece</option>
                  <option value="bag">Bag</option>
                  <option value="kg">Kilogram</option>
                  <option value="ton">Ton</option>
                  <option value="box">Box</option>
                  <option value="sqft">Square Feet</option>
                  <option value="sqm">Square Meter</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="editDescription">Description</label>
                <textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMaterial(null);
                    setFormData({
                      name: '',
                      category: 'cement',
                      manufacturer: '',
                      grade: '',
                      type: '',
                      description: '',
                      unit: 'piece'
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialManagement;
