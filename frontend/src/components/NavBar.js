import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/NavBar.css';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('navCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleNav = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('navCollapsed', JSON.stringify(newState));
      return newState;
    });
  };

  // Cleanup effect to ensure proper state on mount
  useEffect(() => {
    const saved = localStorage.getItem('navCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  return (
    <nav className={`nav-bar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-header">
        {!isCollapsed && <h2>ClinicScheduler</h2>}
        <button 
          className="collapse-button" 
          onClick={toggleNav}
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      <div className="nav-links">
        <button
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="nav-icon">🏠</span>
          {!isCollapsed && <span className="nav-text">Home</span>}
        </button>
        <button
          className={`nav-link ${isActive('/AssistAI') ? 'active' : ''}`}
          onClick={() => navigate('/AssistAI')}
        >
          <span className="nav-icon">🤖</span>
          {!isCollapsed && <span className="nav-text">Medical Assistant</span>}
        </button>
        <button
          className={`nav-link ${isActive('/schedule-assist') ? 'active' : ''}`}
          onClick={() => navigate('/schedule-assist')}
        >
          <span className="nav-icon">📅</span>
          {!isCollapsed && <span className="nav-text">Schedule Assistant</span>}
        </button>
        <button
          className={`nav-link ${isActive('/calender') ? 'active' : ''}`}
          onClick={() => navigate('/calender')}
        >
          <span className="nav-icon">📆</span>
          {!isCollapsed && <span className="nav-text">Calendar</span>}
        </button>
      </div>
    </nav>
  );
}

export default NavBar; 