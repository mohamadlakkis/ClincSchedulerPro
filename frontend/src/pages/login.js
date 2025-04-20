import React, { useState, useEffect } from 'react';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.state?.isNew || 'login';
  const userType = location.state?.userType || 'patient';
  const [view, setView] = useState(isNew);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specialty, setSpecialty] = useState(''); // For doctor registration

  // Reset form fields when view changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setSpecialty('');
    setError('');
  }, [view, userType]);

  const handleBackToHome = () => {
    navigate('/');
  };

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = (isSignup) => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (isSignup) {
      if (!firstName || !lastName) {
        setError('Please enter your full name');
        return false;
      }
      
      if (password !== confirmpassword) {
        setError('Passwords do not match');
        return false;
      }
      
      if (userType === 'doctor' && !specialty) {
        setError('Please enter your specialty');
        return false;
      }
    }
    
    return true;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    
    if (!validateForm(false)) return;
    
    setLoading(true);
    setError('');
    
    try {
      const endpoint = userType === 'doctor' ? '/loginDoctor' : '/loginPatient';
      const response = await fetch(`http://localhost:8001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      // Store user info in localStorage for persistence
      localStorage.setItem('token', data.token);
      
      if (userType === 'doctor') {
        localStorage.setItem('userId', data.DoctorId);
        localStorage.setItem('userType', 'doctor');
      } else {
        localStorage.setItem('userId', data.PatientId);
        localStorage.setItem('userType', 'patient');
      }
      
      // Navigate to landing page
      navigate('/landing');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    
    if (!validateForm(true)) return;
    
    setLoading(true);
    setError('');
    
    try {
      let endpoint, requestBody;
      
      if (userType === 'doctor') {
        endpoint = '/registerDoctor';
        requestBody = {
          DoctorName: `${firstName} ${lastName}`,
          DoctorInfo: '', // Optional info could be added later
          DoctorSpecialty: specialty,
          Email: email,
          Password: password
        };
      } else {
        endpoint = '/registerPatient';
        requestBody = {
          PatientName: `${firstName} ${lastName}`,
          PatientInfo: '', // Optional info could be added later
          PatientAge: 30, // Default age, could be added to form later
          Gender: 'M', // Default gender, could be added to form later
          Email: email,
          Password: password
        };
      }
      
      const response = await fetch(`http://localhost:8001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      
      // Auto-login after successful registration
      const loginEndpoint = userType === 'doctor' ? '/loginDoctor' : '/loginPatient';
      const loginResponse = await fetch(`http://localhost:8001${loginEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        localStorage.setItem('token', loginData.token);
        
        if (userType === 'doctor') {
          localStorage.setItem('userId', loginData.DoctorId);
          localStorage.setItem('userType', 'doctor');
        } else {
          localStorage.setItem('userId', loginData.PatientId);
          localStorage.setItem('userType', 'patient');
        }
        
        navigate('/landing');
      } else {
        // If auto-login fails, redirect to login view
        setView('login');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App-container">
      {/* Background Image Section */}
      <div className="background-image"></div>

      {/* Login Form Section */} 
      <div className="login-container">
        <button onClick={handleBackToHome} className="back-to-home-btn">
          ← Home
        </button>
        
        <div className="user-type-indicator">
          {userType === 'doctor' ? 'Doctor Account' : 'Patient Account'}
        </div>
        
        {view === 'login' ? (
          <div className="login-card">
            <div className="login-header">
              <h3>Welcome Back!</h3>
              <h2>Log In</h2>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form className="login-form" onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Email"
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
              <a
                href="https://support.google.com/accounts/answer/7682439?hl=en"
                className="forgot-password"
              >
                Forgot Password?
              </a>
            </form>
            <p className="forgot-password">
              Don't have an account?{' '}
              <button onClick={() => setView('signup')} className="link-button">
                Sign up
              </button>
            </p>
          </div>
        ) : (
          <div className="login-card">
            <div className="login-header">
              <h2>Register</h2>
              <p>{userType === 'doctor' ? 'Doctor Account' : 'Patient Account'}</p>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form className="login-form" onSubmit={handleSignup}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="First Name"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              {userType === 'doctor' && (
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Specialty"
                    className="input-field"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Email"
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
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input-field"
                  value={confirmpassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
            <p className="forgot-password">
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="link-button">
                Log In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
