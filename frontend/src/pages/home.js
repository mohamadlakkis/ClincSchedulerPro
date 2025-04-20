import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();

  const handleLogin = (isNew) => {
    navigate('/login', { state: { isNew } });
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to ClinicScheduler Pro</h1>
        <p className="home-subtitle">
          Your AI-powered medical assistant for smarter healthcare management
        </p>
        
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