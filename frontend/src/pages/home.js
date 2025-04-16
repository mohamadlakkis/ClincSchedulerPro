import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleLogin = (isNew) => {
    navigate('/login', { state: { isNew } });
  };

  return (
    <div>
      <h1>Welcome to the App</h1>
      <h2>Are you a new member</h2>
      <button onClick={() => handleLogin('signup')}>Sign Up</button>

      <h2>Already Have an account</h2>
      <button onClick={() => handleLogin('login')}>Login</button>
    </div>
  );
}

export default Home;