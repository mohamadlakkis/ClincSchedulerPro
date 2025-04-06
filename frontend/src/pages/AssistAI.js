import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AssistAI.css';


function AssistAI() {
  const navigate = useNavigate();

  return (
    <div>
        <header>
            <h1>AI-Powered Chatbot</h1>
            <p>Your personal assistant for medical consultancy.</p>
        </header>
        <main>
            <section>
                <h2>Features</h2>
                <ul>
                    <li>Smart scheduling</li>
                    <li>Task management</li>
                    <li>Integration with your favorite apps</li>
                </ul>
            </section>

            <section className="actions">
                <button onClick={() => navigate('/calender')}>Go to Calendar</button>
                <button onClick={() => navigate('/')}>Go back home</button>
            </section>
        </main>
        <footer className="footer">
            <p>&copy; 2025 AI-Powered Calendar. All rights reserved.</p>
        </footer>
    </div>
  );
}

export default AssistAI;
