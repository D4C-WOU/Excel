import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/upload', label: 'Upload', icon: '📁' },
    { path: '/analysis', label: 'Analysis', icon: '📈' },
    { path: '/history', label: 'History', icon: '📋' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">📊</span>
          <h1>Excel Analytics Platform</h1>
        </div>
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
      </div>
    </header>
  );
};

export default Header;