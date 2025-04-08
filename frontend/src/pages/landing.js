import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

function Landing() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const features = [
    {
      title: "Smart Scheduling",
      description: "AI-powered appointment management that adapts to your needs",
      icon: "📅"
    },
    {
      title: "Medical Assistant",
      description: "Get instant answers to your medical questions",
      icon: "🤖"
    },
    {
      title: "Task Management",
      description: "Keep track of your medical tasks and appointments",
      icon: "✅"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-content">
          <h1>Welcome to MediBot</h1>
          <p className="subtitle">Your AI-powered medical assistant for smarter healthcare management</p>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="feature-display">
            <div className="feature-card">
              <span className="feature-icon">{features[currentFeature].icon}</span>
              <h2>{features[currentFeature].title}</h2>
              <p>{features[currentFeature].description}</p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-item ${currentFeature === index ? 'active' : ''}`}
                onClick={() => setCurrentFeature(index)}
              >
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Experience Smart Healthcare?</h2>
            <p>Join thousands of users who are managing their healthcare smarter with MediBot</p>
            <div className="cta-buttons">
              <button 
                className="primary-button"
                onClick={() => navigate('/AssistAI')}
              >
                Try MediBot Now
              </button>
              <button 
                className="secondary-button"
                onClick={() => navigate('/calender')}
              >
                View Calendar
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 MediBot. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
