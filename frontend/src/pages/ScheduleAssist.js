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
    // Here you would integrate with a natural language processing service
    // For now, we'll use a simple keyword-based system
    const input = userInput.toLowerCase();

    if (input.includes('yes') && !appointmentDetails.doctorId) {
      return {
        text: "Great! Could you tell me which doctor you'd like to see? (Please provide the doctor's ID)",
        action: 'askDoctor'
      };
    }
    
    if (input.includes('doctor') || /^d\d+$/i.test(input)) {
      const doctorId = input.match(/\d+/) ? input.match(/\d+/)[0] : null;
      if (doctorId) {
        setAppointmentDetails(prev => ({ ...prev, doctorId: `D${doctorId}` }));
        return {
          text: "What date would you like to schedule the appointment for? (Please use YYYY-MM-DD format)",
          action: 'askDate'
        };
      }
    }

    if (input.match(/\d{4}-\d{2}-\d{2}/)) {
      const date = input.match(/\d{4}-\d{2}-\d{2}/)[0];
      setAppointmentDetails(prev => ({ ...prev, date }));
      return {
        text: "What time would you like the appointment? (Please provide hour between 9-17)",
        action: 'askTime'
      };
    }

    if (input.match(/\d{1,2}/)) {
      const time = parseInt(input.match(/\d{1,2}/)[0]);
      if (time >= 9 && time <= 17) {
        setAppointmentDetails(prev => ({ ...prev, startTime: time }));
        return {
          text: "Great! I'll try to schedule your appointment. Please confirm the details:\n" +
                `Doctor ID: ${appointmentDetails.doctorId}\n` +
                `Date: ${appointmentDetails.date}\n` +
                `Time: ${time}:00\n\n` +
                "Should I proceed with booking? (Yes/No)",
          action: 'confirm'
        };
      }
    }

    if (input.includes('yes') && appointmentDetails.startTime) {
      try {
        const response = await fetch('http://localhost:8001/insertAppointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...appointmentDetails,
            PatientId: localStorage.getItem('userId'), // Assuming you store user ID in localStorage
            feedback: ''
          }),
        });

        if (response.ok) {
          return {
            text: "Perfect! Your appointment has been scheduled. You can view it in the calendar. Would you like to schedule another appointment?",
            action: 'success'
          };
        } else {
          return {
            text: "I'm sorry, there was an error scheduling your appointment. The selected time might not be available. Would you like to try a different time?",
            action: 'error'
          };
        }
      } catch (error) {
        return {
          text: "I'm sorry, there was an error connecting to the server. Please try again later.",
          action: 'error'
        };
      }
    }

    return {
      text: "I'm sorry, I didn't understand that. Could you please rephrase?",
      action: 'unclear'
    };
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
