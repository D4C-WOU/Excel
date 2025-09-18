import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Header = ({ onLogout }) => {
  const location = useLocation();
  const user = authService.getUser();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/upload', label: 'Upload', icon: '📁' },
    { path: '/analysis', label: 'Analysis', icon: '📈' },
    { path: '/history', label: 'History', icon: '📋' }
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">📊</span>
          <h1>Excel Analytics Platform</h1>
        </div>
        <div className="header-right">
          <nav className="nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="user-section">
            <span className="user-name">👤 {user?.name || 'User'}</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;