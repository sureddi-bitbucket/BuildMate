import React from 'react';
import logo from '../../assets/buildmate-logo.svg';

function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-overlay" />
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <img src={logo} alt="BuildMate" className="splash-logo" />
        </div>
        <div className="splash-text">
          <h1>BuildMate</h1>
          <p>Distributor-first materials management</p>
        </div>
        <div className="splash-progress">
          <div className="splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
