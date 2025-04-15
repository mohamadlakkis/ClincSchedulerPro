import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AssistAI.css';

function AssistAI() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = (e) => {
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

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = {
        text: "I'm MediBot, your medical assistant. I can help you with scheduling appointments, answering medical questions, and providing general health information. How can I assist you today?",
        sender: 'bot',
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>MediBot</h1>
        <p>Your AI-powered medical assistant</p>
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

export default AssistAI;

