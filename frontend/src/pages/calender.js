import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/calender.css';


function Calender() {
  const navigate = useNavigate();

  return (
    <div>
        <header>
            <h1>Calendar</h1>
            <p>Calender landing page</p>
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
                <button onClick={() => navigate('/')}>Back home</button>
                <button onClick={() => navigate('/AssistAI')}>Try Assist AI</button>
            </section>
        </main>
        <footer className="footer">
            <p>&copy; 2025 AI-Powered Calendar. All rights reserved.</p>
        </footer>
    </div>
  );
}

export default Calender;
