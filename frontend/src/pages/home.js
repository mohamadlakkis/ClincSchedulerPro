import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('patient');
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "AI-Powered Medical Assistant",
      description: "Get instant answers to your medical questions with our advanced AI assistant.",
      icon: "🤖"
    },
    {
      title: "Smart Appointment Scheduling",
      description: "Book appointments through natural conversation with our scheduling assistant.",
      icon: "📅"
    },
    {
      title: "Real-time Calendar View",
      description: "View and manage your appointments in a user-friendly calendar interface.",
      icon: "📊"
    },
    {
      title: "Secure Patient Portal",
      description: "Access your medical information and manage your healthcare needs securely.",
      icon: "🔒"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleLogin = (isNew) => {
    navigate('/login', { state: { isNew, userType } });
  };

  const handleAdminLogin = () => {
    navigate('/admin-login');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to ClinicScheduler Pro</h1>
        <p className="home-subtitle">
          Your AI-powered medical assistant for smarter healthcare management
        </p>
        
        <section className="feature-display">
          <div className="feature-card">
            <div className="feature-icon">{features[activeFeature].icon}</div>
            <h2>{features[activeFeature].title}</h2>
            <p>{features[activeFeature].description}</p>
          </div>
        </section>
        
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
          
          <div className="auth-section">
            <h2>Clinic Administrator?</h2>
            <button
              className="auth-button admin-button"
              onClick={handleAdminLogin}
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;