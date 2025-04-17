import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../styles/AssistAI.css";

function AssistAI() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages from localStorage when component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem(
      `mediBotChat_${localStorage.getItem("userId")}`
    );
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message only if no saved messages exist
      setMessages([
        {
          text: "Hello! I'm MediBot, your medical assistant. I can help you with medical questions and provide health information. How can I assist you today?",
          sender: "bot",
          time: getCurrentTime(),
        },
      ]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        `mediBotChat_${localStorage.getItem("userId")}`,
        JSON.stringify(messages)
      );
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      text: input,
      sender: "user",
      time: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8001/mediBotRagEndpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuestions: input,
          PatientId: 5,
        }),
      });
      console.log("Response received from server:", response);
      if (!response.ok) {
        throw new Error("Failed to get response from MediBot");
      }

      const data = await response.json();
      console.log("Parsed response data:", data);
      setTimeout(() => {
        const botResponse = {
          text: data.answer,
          sender: "bot",
          time: getCurrentTime(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      const errorResponse = {
        text: "I'm sorry, there was an error processing your request. Please try again.",
        sender: "bot",
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, errorResponse]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  // Add clear chat functionality
  const clearChat = () => {
    localStorage.removeItem(`mediBotChat_${localStorage.getItem("userId")}`);
    setMessages([
      {
        text: "Hello! I'm MediBot, your medical assistant. I can help you with medical questions and provide health information. How can I assist you today?",
        sender: "bot",
        time: getCurrentTime(),
      },
    ]);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>MediBot</h1>
        <p>Your AI-powered medical assistant</p>
        <button onClick={clearChat} className="clear-chat-button">
          Clear Chat
        </button>
      </header>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.sender === "bot" ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                message.text
              )}
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
        <button onClick={() => navigate("/calender")} className="nav-button">
          Go to Calendar
        </button>
        <button onClick={() => navigate("/landing")} className="nav-button">
          Go back home
        </button>
      </footer>
    </div>
  );
}

export default AssistAI;
