import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Overview from './Overview';
import Inventory from './Inventory';
import Pricing from './Pricing';
import MaterialManagement from './MaterialManagement';
import Inquiries from './Inquiries';
import Notifications from './Notifications';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${showMobileMenu ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h2>BuildMate</h2>
          <p className="user-role">Distributor Portal</p>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/distributor/dashboard"
            className={`nav-item ${isActive('/distributor/dashboard') && !location.pathname.includes('inventory') && !location.pathname.includes('pricing') && !location.pathname.includes('inquiries') && !location.pathname.includes('notifications') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">📊</span>
            Overview
          </Link>

          <Link
            to="/distributor/inventory"
            className={`nav-item ${isActive('inventory')}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">📦</span>
            Inventory
          </Link>

          <Link
            to="/distributor/pricing"
            className={`nav-item ${isActive('pricing')}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">💰</span>
            Pricing
          </Link>

          <Link
            to="/distributor/materials"
            className={`nav-item ${isActive('materials')}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">🏗️</span>
            Material Management
          </Link>

          <Link
            to="/distributor/inquiries"
            className={`nav-item ${isActive('inquiries')}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">📨</span>
            Inquiries
          </Link>

          <Link
            to="/distributor/notifications"
            className={`nav-item ${isActive('notifications')}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">🔔</span>
            Notifications
            {unreadCount > 0 && <span className="badge badge-danger">{unreadCount}</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-block">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            ☰
          </button>
          <h2>BuildMate</h2>
        </div>

        <Routes>
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/materials" element={<MaterialManagement />} />
          <Route path="/inquiries" element={<Inquiries />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </main>
    </div>
  );
}

export default Dashboard;

