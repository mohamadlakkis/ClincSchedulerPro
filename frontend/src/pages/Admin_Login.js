import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin_Login.css';

function Admin_Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8001/loginAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store admin info in localStorage
        localStorage.setItem('userType', 'admin');
        // Navigate to the admin dashboard
        navigate('/admin');
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="background-image"></div>
      
      <div className="login-container">
        <button onClick={handleBackToHome} className="back-to-home-btn">
          ← Home
        </button>
        
        <div className="admin-login-card">
          <div className="login-header">
            <h2>Administrator Login</h2>
            <p>Access the clinic management system</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Admin Email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}></div>

            <div className="checkbox-group">
              <input type="checkbox" id="remember-me" />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Admin_Login;