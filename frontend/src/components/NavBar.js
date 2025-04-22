import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState("patient");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem("navCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleNav = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("navCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  // Get userType from localStorage
  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, []);

  // Handle calendar navigation based on user type
  const handleCalendarNavigation = () => {
    if (userType === "doctor") {
      navigate("/calender");
    } else {
      navigate("/doctors");
    }
  };

  // Check if Schedule Assistant should be visible
  const shouldShowScheduleAssistant = userType !== "doctor";

  // Cleanup effect to ensure proper state on mount
  useEffect(() => {
    const saved = localStorage.getItem("navCollapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  return (
    <nav className={`nav-bar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="nav-header">
        {!isCollapsed && <h2>ClinicScheduler</h2>}
        <button
          className="collapse-button"
          onClick={toggleNav}
          aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>
      <div className="nav-links">
        <button
          className={`nav-link ${isActive("/landing") ? "active" : ""}`}
          onClick={() => navigate("/landing")}
        >
          <span className="nav-icon">🏠</span>
          {!isCollapsed && <span className="nav-text">Home</span>}
        </button>
        <button
          className={`nav-link ${isActive("/AssistAI") ? "active" : ""}`}
          onClick={() => navigate("/AssistAI")}
        >
          <span className="nav-icon">🤖</span>
          {!isCollapsed && <span className="nav-text">Medical Assistant</span>}
        </button>
        
        {/* Only show Schedule Assistant button for patients */}
        {shouldShowScheduleAssistant && (
          <button
            className={`nav-link ${isActive("/schedule-assist") ? "active" : ""}`}
            onClick={() => navigate("/schedule-assist")}
          >
            <span className="nav-icon">📅</span>
            {!isCollapsed && <span className="nav-text">Schedule Assistant</span>}
          </button>
        )}
        
        {/* Calendar button with conditional navigation */}
        <button
          className={`nav-link ${
            (userType === "doctor" ? isActive("/calender") : isActive("/doctors")) ? "active" : ""
          }`}
          onClick={handleCalendarNavigation}
        >
          <span className="nav-icon">📆</span>
          {!isCollapsed && (
            <span className="nav-text">
              {userType === "doctor" ? "Calendar" : "Browse Doctors"}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
