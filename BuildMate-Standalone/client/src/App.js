import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DistributorDashboard from './components/Distributor/Dashboard';
import ConsumerDashboard from './components/Consumer/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            {user?.role === 'distributor' ? (
              <Navigate to="/distributor/dashboard" />
            ) : user?.role === 'consumer' ? (
              <Navigate to="/consumer/dashboard" />
            ) : (
              <Navigate to="/login" />
            )}
          </PrivateRoute>
        }
      />

      <Route
        path="/distributor/*"
        element={
          <PrivateRoute allowedRoles={['distributor']}>
            <DistributorDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/consumer/*"
        element={
          <PrivateRoute allowedRoles={['consumer']}>
            <ConsumerDashboard />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

