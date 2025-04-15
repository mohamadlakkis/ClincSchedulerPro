import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AssistAI.css'; // We can reuse the same styles

function ScheduleAssist() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({
    doctorId: null,
    patientId: null,
    date: null,
    startTime: null,
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Add welcome message when component mounts
    setMessages([{
      text: "Hello! I'm your scheduling assistant. I can help you book an appointment with a doctor. Would you like to schedule an appointment?",
      sender: 'bot',
      time: getCurrentTime()
    }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const processUserInput = async (userInput) => {
    try {
      const response = await fetch('http://localhost:8001/schedulerBot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_message: userInput,
          PatientID: localStorage.getItem('userId') // Get patient ID from localStorage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from scheduler bot');
      }

      const data = await response.json();
      return {
        text: data.response,
        action: 'response'
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        text: "I'm sorry, there was an error processing your request. Please try again.",
        action: 'error'
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      text: input,
      sender: 'user',
      time: getCurrentTime()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Process the input and get bot response
    const response = await processUserInput(input);
    
    setTimeout(() => {
      const botResponse = {
        text: response.text,
        sender: 'bot',
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Schedule Assistant</h1>
        <p>Let me help you book an appointment</p>
      </header>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.text}
              <div className="message-time">{message.time}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="chat-input"
          disabled={isTyping}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isTyping || !input.trim()}
        >
          Send
        </button>
      </form>

      <footer className="chat-footer">
        <button onClick={() => navigate('/calender')} className="nav-button">Go to Calendar</button>
        <button onClick={() => navigate('/')} className="nav-button">Go back home</button>
      </footer>
    </div>
  );
}

export default ScheduleAssist;
