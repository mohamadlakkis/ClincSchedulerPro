import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
import NavBar from "../components/NavBar";

function Landing() {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    {
      title: "AI-Powered Medical Assistant",
      description: "Get instant answers to your medical questions with our advanced AI assistant.",
      icon: "🤖"
    },
    {
      title: "Smart Appointment Scheduling",
      description: "Book appointments through natural conversation with our scheduling assistant.",
      icon: "📅"
    },
    {
      title: "Real-time Calendar View",
      description: "View and manage your appointments in a user-friendly calendar interface.",
      icon: "📊"
    },
    {
      title: "Secure Patient Portal",
      description: "Access your medical information and manage your healthcare needs securely.",
      icon: "🔒"
    }
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:8001/getAllAppointmentsForPatient", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            PatientId: localStorage.getItem("userId")
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        
        // Filter appointments for the next month and sort by date and time
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const filteredAppointments = data.appointments
          .filter(appointment => {
            const appointmentDate = new Date(appointment.Date);
            return appointmentDate >= now && appointmentDate <= nextMonth;
          })
          .sort((a, b) => {
            const dateA = new Date(a.Date);
            const dateB = new Date(b.Date);
            if (dateA.getTime() === dateB.getTime()) {
              return a.startTime - b.startTime;
            }
            return dateA.getTime() - dateB.getTime();
          });

        setUpcomingAppointments(filteredAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (startTime) => {
    const hour = Math.floor(startTime / 2) + 9;
    const minutes = (startTime % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="app-container">
      <NavBar />
      <div className="main-content">
        <header className="landing-header">
          <div className="header-content">
            <h1>Welcome to ClinicScheduler Pro</h1>
            <p className="subtitle">
              Your AI-powered medical assistant for smarter healthcare management
            </p>
          </div>
        </header>

        <main className="landing-main">
          <section className="feature-display">
            <div className="feature-card">
              <div className="feature-icon">{features[activeFeature].icon}</div>
              <h2>{features[activeFeature].title}</h2>
              <p>{features[activeFeature].description}</p>
            </div>
          </section>

          <section className="appointments-section">
            <div className="appointments-card">
              <h2>Your Upcoming Appointments</h2>
              {isLoading ? (
                <div className="loading-message">Loading appointments...</div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="appointments-list">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="appointment-item">
                      <div className="appointment-date">
                        {formatDate(appointment.Date)}
                      </div>
                      <div className="appointment-time">
                        {formatTime(appointment.startTime)}
                      </div>
                      <div className="appointment-doctor">
                        Doctor ID: {appointment.DoctorId}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-appointments">
                  You don't have any appointments scheduled for the next month.
                </div>
              )}
            </div>
          </section>

          <section className="cta-section">
            <div className="cta-content">
              <h2>Ready to Experience Smart Healthcare?</h2>
              <p>
                Choose your AI assistant based on your needs
              </p>
              <div className="ai-assistants">
                <div className="assistant-card">
                  <h3>Medical Assistant</h3>
                  <p>Ask questions about health, medications, and general medical advice</p>
                  <button
                    className="primary-button"
                    onClick={() => navigate("/AssistAI")}
                  >
                    Ask Medical Questions
                  </button>
                </div>
                <div className="assistant-card">
                  <h3>Schedule Assistant</h3>
                  <p>Book appointments through natural conversation</p>
                  <button
                    className="primary-button"
                    onClick={() => navigate("/schedule-assist")}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
              <div className="cta-buttons">
                <button
                  className="secondary-button"
                  onClick={() => navigate("/calender")}
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
    </div>
  );
}

export default Landing;
