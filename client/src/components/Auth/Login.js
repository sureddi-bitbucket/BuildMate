import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import logo from '../../assets/buildmate-logo.svg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const fillDemoCredentials = (role) => {
    if (role === 'distributor') {
      setEmail('distributor@buildmate.com');
      setPassword('distributor123');
    } else {
      setEmail('consumer@buildmate.com');
      setPassword('consumer123');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <img src={logo} alt="BuildMate" className="auth-logo" />
          </div>
          <h1>BuildMate</h1>
          <p>Building Materials Distribution System</p>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px' }}>
            🚀 Standalone Version - Port 5038
          </div>
        </div>

        <h2>Login to Your Account</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-accounts">
          <p>Demo Accounts:</p>
          <div className="demo-buttons">
            <button
              className="btn btn-outline btn-small"
              onClick={() => fillDemoCredentials('distributor')}
            >
              Distributor Demo
            </button>
            <button
              className="btn btn-outline btn-small"
              onClick={() => fillDemoCredentials('consumer')}
            >
              Consumer Demo
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

