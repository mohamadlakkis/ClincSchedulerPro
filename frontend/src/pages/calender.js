import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/calender.css";
//we still need to change design and put the doctor name related to this calendar
const Calendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [blueAppointments, setBlueAppointments] = useState([]);
  const [redAppointments, setRedAppointments] = useState([]);
  const PATIENT_ID = "0000001";
  const DOCTOR_ID = location.state?.doctorId;

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const totalMinutes = 9 * 60 + i * 30; 
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      index: i, 
      display: `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}` 
    };
  });

  const isSlotBookedByPatient = (date, slotIndex) => {
    return blueAppointments.some(
      (appointment) =>
        appointment.Date === date &&
        appointment.StartTime === slotIndex
    );
  };

  const isSlotBookedByOthers = (date, slotIndex) => {
    return redAppointments.some(
      (appointment) =>
        appointment.Date === date &&
        appointment.StartTime === slotIndex
    );
  };

  const handleSlotClick = (date, slotIndex) => {
    if (isPastDate(date)) return;
  
    const formattedDate = formatDate(date);
    const isBookedByPatient = isSlotBookedByPatient(formattedDate, slotIndex);
    const isBookedByOthers = isSlotBookedByOthers(formattedDate, slotIndex);
  
    if (isBookedByPatient) {
      setSelectedSlot({ date: formattedDate, time: slotIndex });
      setShowCancelModal(true);
    } else if (!isBookedByOthers) {
      setSelectedSlot({ date: formattedDate, time: slotIndex });
      setShowBookingModal(true);
    }
  };
  

  // Function to generate week days
  const generateWeekDays = useCallback(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    const targetMonday = new Date(monday);
    targetMonday.setDate(monday.getDate() + (currentWeek * 7));
    
    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(targetMonday);
      date.setDate(targetMonday.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeek]);

  // Function to fetch appointments for the current week
  const fetchAppointments = useCallback(async () => {
    const weekDays = generateWeekDays();
    const startDate = formatDate(weekDays[0]);
    console.log('Fetching appointments for date:', startDate);

    try {
      const response = await fetch('http://localhost:8001/showOneDoctorAllPatients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DoctorId: DOCTOR_ID,
          PatientId: PATIENT_ID,
          Date: startDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Process blue appointments (patient's own appointments)
      const processedBlueAppointments = data.appointments_in_blue.map(([Date, StartTime]) => ({
        Date,
        StartTime
      }));
      console.log('Processed blue appointments:', processedBlueAppointments);
      // Process red appointments (other patients' appointments)
      const processedRedAppointments = data.appointments_in_red.map(([Date, StartTime]) => ({
        Date,
        StartTime
      }));
      console.log('Processed red appointments:', processedRedAppointments);

      setBlueAppointments(processedBlueAppointments);
      setRedAppointments(processedRedAppointments);
      
      // Log the current state after update
      console.log('Updated state - Blue appointments:', processedBlueAppointments);
      console.log('Updated state - Red appointments:', processedRedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [DOCTOR_ID, PATIENT_ID, generateWeekDays]);

  // Fetch appointments when component mounts and when week changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Function to handle booking
  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    try {
      const requestData = {
        DoctorId: parseInt(DOCTOR_ID, 10), // Convert to integer
        PatientId: parseInt(PATIENT_ID, 10), // Convert to integer
        Date: selectedSlot.date,
        startTime: selectedSlot.time,
        feedback: ''
      };

      const response = await fetch('http://localhost:8001/insertAppointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to book appointment');
      }

      // Show success message
      alert('Appointment booked successfully!');
      
      // Fetch updated appointments
      await fetchAppointments();
      
      // Close the modal and reset selected slot
      setShowBookingModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Booking error:', error);
      alert(`Error booking appointment: ${error.message}`);
    }
  };

  // Function to handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!selectedSlot) return;

    try {
      const response = await fetch('http://localhost:8001/deleteAppointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DoctorId: parseInt(DOCTOR_ID, 10),
          PatientId: parseInt(PATIENT_ID, 10),
          Date: selectedSlot.date,
          startTime: selectedSlot.time // This is now the slot index
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel appointment');
      }

      // Refresh appointments after successful cancellation
      await fetchAppointments();
      setShowCancelModal(false);
      setSelectedSlot(null);
    } catch (error) {
      alert(error.message);
    }
  };

  // Function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Function to check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Function to get week label
  const getWeekLabel = () => {
    const labels = [
      "Current Week",
      "Next Week",
      "Week After Next",
      "Fourth Week",
    ];
    return labels[currentWeek];
  };

  // Function to handle next week
  const handleNextWeek = () => {
    if (currentWeek < 3) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  // Function to handle previous week
  const handlePreviousWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  // Function to handle first week
  const handleFirstWeek = () => {
    setCurrentWeek(0);
  };

  const weekDays = generateWeekDays();
  const firstDay = weekDays[0];
  const lastDay = weekDays[weekDays.length - 1];

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <div className="header-content">
          <h1>Appointment Calendar</h1>
          <p>Schedule and manage your medical appointments</p>
        </div>
      </header>

      <main className="calendar-main">
        <div className="calendar-controls">
          <div className="date-navigation">
            <button onClick={handlePreviousWeek} disabled={currentWeek === 0}>
              Previous Week
            </button>
            <button onClick={handleFirstWeek} disabled={currentWeek === 0}>
              Current Week
            </button>
            <button onClick={handleNextWeek} disabled={currentWeek === 3}>
              Next Week
            </button>
          </div>

          <div className="week-display">
            <div className="week-label">{getWeekLabel()}</div>
            <div className="date-range">
              {firstDay.toLocaleDateString()} - {lastDay.toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="calendar-grid">
          <div className="time-column">
            <div className="time-header">Time</div>
            {timeSlots.map((slot) => (
              <div key={slot.index} className="time-slot">
                {slot.display}  
              </div>
            ))}
          </div>

          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`day-column ${isPastDate(day) ? "past-day" : ""}`}
            >
              <div className="day-header">
                {day.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              {timeSlots.map((slot) => {
                const formattedDate = formatDate(day);
                const isBookedByPatient = isSlotBookedByPatient(formattedDate, slot.index);
                const isBookedByOthers = isSlotBookedByOthers(formattedDate, slot.index);
                const isPast = isPastDate(day);

                 console.log(`Slot ${slot.index} on ${formattedDate}:`, {

                  isBookedByPatient,
                  isBookedByOthers,
                  isPast,
                  appointments: appointments.filter(a => a.Date === formattedDate && a.StartTime === slot.index)
                });

                let slotClass = "time-slot";
                if (isPast) {
                  slotClass += " past-slot";
                } else if (isBookedByPatient) {
                  slotClass += " user-booked";
                } else if (isBookedByOthers) {
                  slotClass += " booked";
                } else {
                  slotClass += " available";
                }

                return (
                  <div
                    key={`${day.toISOString()}-${slot.index}`}
                    className={slotClass}
                    onClick={() => handleSlotClick(day, slot.index)}
                  >
                    {isBookedByPatient
                      ? "Your Booking"
                      : isBookedByOthers
                      ? "Booked"
                      : isPast
                      ? "Past"
                      : "Available"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      <footer className="calendar-footer">
        <div className="nav-buttons">
          <button 
            className="nav-button"
            onClick={() => navigate('/')}
          >
            Go back home
          </button>
          <button 
            className="nav-button"
            onClick={() => navigate('/AssistAI')}
          >
            Try MediBot
          </button>
        </div>
      </footer>

      {showBookingModal && (
        <div className="booking-modal">
          <div className="modal-content">
            <h3>Book Appointment</h3>
            <p>
              Selected time: {selectedSlot?.time} on {selectedSlot?.date}
            </p>
            <p>Doctor: {DOCTOR_ID}</p>
            <div className="modal-buttons">
              <button onClick={handleBooking}>Confirm</button>
              <button onClick={() => setShowBookingModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="booking-modal">
          <div className="modal-content">
            <h3>Cancel Appointment</h3>
            <p>
              Are you sure you want to cancel your appointment at{" "}
              {selectedSlot?.time} on {selectedSlot?.date}?
            </p>
            <div className="modal-buttons">
              <button onClick={handleCancelAppointment}>Yes, Cancel</button>
              <button onClick={() => setShowCancelModal(false)}>
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;