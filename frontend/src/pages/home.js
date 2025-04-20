import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('patient');

  const handleLogin = (isNew) => {
    navigate('/login', { state: { isNew, userType } });
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to ClinicScheduler Pro</h1>
        <p className="home-subtitle">
          Your AI-powered medical assistant for smarter healthcare management
        </p>
        
        <div className="user-type-selection">
          <h2>Select Account Type</h2>
          <div className="radio-buttons">
            <label>
              <input
                type="radio"
                name="userType"
                value="patient"
                checked={userType === 'patient'}
                onChange={() => setUserType('patient')}
              />
              Patient
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="doctor"
                checked={userType === 'doctor'}
                onChange={() => setUserType('doctor')}
              />
              Doctor
            </label>
          </div>
        </div>
        
        <div className="auth-buttons">
          <div className="auth-section">
            <h2>New to ClinicScheduler?</h2>
            <button
              className="auth-button signup-button"
              onClick={() => handleLogin('signup')}
            >
              Create an Account
            </button>
          </div>

          <div className="auth-section">
            <h2>Already Have an Account?</h2>
            <button
              className="auth-button login-button"
              onClick={() => handleLogin('login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;