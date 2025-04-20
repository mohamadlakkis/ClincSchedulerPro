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
  const [blueAppointments, setBlueAppointments] = useState([]);
  const [redAppointments, setRedAppointments] = useState([]);
  const [greenAppointments, setGreenAppointments] = useState([]); // Available appointments
  
  // Fix ID handling to properly differentiate between doctor and patient
  const userType = localStorage.getItem('userType');
  
  // If we're coming from the doctors page, use the doctorId from location state
  // If we're a doctor user, use our own ID as the doctor ID
  const DOCTOR_ID = location.state?.doctorId || 
                   (userType === 'doctor' ? localStorage.getItem('userId') : null);
  
  // For patient ID, always use the logged-in user's ID if they're a patient
  const PATIENT_ID = userType === 'patient' ? localStorage.getItem('userId') : null;
  
  // For user type, determine based on localStorage or fallback to location state logic
  const USER_TYPE = userType || (location.state?.doctorId ? "patient" : "doctor");

  // For debugging purposes
  console.log("Calendar Component IDs:", { 
    DOCTOR_ID, 
    PATIENT_ID, 
    USER_TYPE, 
    locationState: location.state,
    userTypeFromStorage: userType 
  });

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const totalMinutes = 9 * 60 + i * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      index: i,
      display: `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`,
    };
  });

  const isSlotBookedByPatient = (date, slotIndex) => {
    return blueAppointments.some(
      (appointment) =>
        appointment.Date === date && appointment.StartTime === slotIndex
    );
  };

  const isSlotBookedByOthers = (date, slotIndex) => {
    return redAppointments.some(
      (appointment) =>
        appointment.Date === date && appointment.StartTime === slotIndex
    );
  };

  const handleSlotClick = (date, slotIndex) => {
    if (isPastDate(date)) return;

    const formattedDate = formatDate(date);
    const isBookedByPatient = isSlotBookedByPatient(formattedDate, slotIndex);
    const isBookedByOthers = isSlotBookedByOthers(formattedDate, slotIndex);
    const isAvailable = greenAppointments.some(
      (appointment) =>
        appointment.Date === formattedDate && appointment.StartTime === slotIndex
    );

    if (USER_TYPE === "doctor") {
      // DOCTOR INTERACTION
      if (isBookedByPatient) {
        // Blue slot (booked) - Allow cancellation
        setSelectedSlot({ date: formattedDate, time: slotIndex });
        setShowCancelModal(true);
      } 
      else if (isAvailable) {
        // Green slot (available but not booked) - Allow deleting availability
        if (window.confirm("Remove this availability slot?")) {
          handleDeleteAvailability(formattedDate, slotIndex);
        }
      }
      else {
        // Red slot (unavailable) - Allow creating availability
        if (window.confirm("Make this slot available for booking?")) {
          handleMakeAvailable(formattedDate, slotIndex);
        }
      }
    } 
    else {
      // PATIENT INTERACTION - Existing logic
      // If the slot is booked by other patients (red), don't allow interaction
      if (isBookedByOthers) {
        return;
      }
      // If the slot is booked by this patient (blue), show cancel option
      else if (isBookedByPatient) {
        setSelectedSlot({ date: formattedDate, time: slotIndex });
        setShowCancelModal(true);
      }
      // If the slot is available (green), allow booking
      else if (isAvailable) {
        setSelectedSlot({ date: formattedDate, time: slotIndex });
        setShowBookingModal(true);
      }
    }
  };

  // Function to make a slot available (for doctors)
  const handleMakeAvailable = async (date, slotIndex) => {
    try {
      const response = await fetch("http://localhost:8001/insertAvailabilityofDoctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          DoctorId: parseInt(DOCTOR_ID, 10),
          Date: date,
          startTime: slotIndex,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to make slot available");
      }

      alert("Slot is now available for booking!");
      
      // Refresh the calendar to show updated availability
      await fetchAppointments();
    } catch (error) {
      console.error("Error making slot available:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Function to delete availability (for doctors)
  const handleDeleteAvailability = async (date, slotIndex) => {
    try {
      const response = await fetch("http://localhost:8001/deleteAvailabilityofDoctor", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          DoctorId: parseInt(DOCTOR_ID, 10),
          Date: date,
          startTime: slotIndex,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete availability");
      }

      alert("Availability removed successfully!");
      
      // Refresh the calendar to show updated availability
      await fetchAppointments();
    } catch (error) {
      console.error("Error deleting availability:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Function to generate week days
  const generateWeekDays = useCallback(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    const targetMonday = new Date(monday);
    targetMonday.setDate(monday.getDate() + currentWeek * 7);

    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(targetMonday);
      date.setDate(targetMonday.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeek]);

  // Function to fetch available appointments for the current week
  const fetchAvailableAppointments = useCallback(async () => {
    const weekDays = generateWeekDays();
    const startDate = formatDate(weekDays[0]);
    console.log("Fetching available appointments for date:", startDate);

    try {
      const response = await fetch(
        "http://localhost:8001/availableforPatient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DoctorId: DOCTOR_ID,
            Date: startDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available appointments");
      }

      const data = await response.json();
      console.log("Raw API response for available appointments:", data);

      // Process green appointments (available appointments)
      // The API returns appointments_green array with [Date, startTime] format
      const processedGreenAppointments = data.appointments_green.map(
        ([Date, StartTime]) => ({
          Date,
          StartTime,
        })
      );
      console.log("Processed green appointments:", processedGreenAppointments);

      setGreenAppointments(processedGreenAppointments);
    } catch (error) {
      console.error("Error fetching available appointments:", error);
    }
  }, [DOCTOR_ID, generateWeekDays]);

  // Function to fetch appointments for the current week
  const fetchAppointments = useCallback(async () => {
    const weekDays = generateWeekDays();
    const startDate = formatDate(weekDays[0]);
    console.log("Fetching appointments for date:", startDate);

    try {
      if (USER_TYPE === "doctor") {
        // Doctor view - fetch from allAppointmentsForDoctor
        const response = await fetch("http://localhost:8001/allAppointmentsForDoctor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DoctorId: DOCTOR_ID,
            Date: startDate,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch doctor appointments");
        }

        const data = await response.json();
        console.log("Doctor appointments data:", data);

        // For doctor view:
        // - appointment_null_patient (slots with no patients) should be green (available)
        // - appointments_booked (slots with patients) should be blue (booked)
        // - all other slots default to red (unavailable)

        // Process available slots (green)
        const processedGreenAppointments = data.appointment_null_patient.map(
          ([Date, startTime]) => ({
            Date,
            StartTime: startTime,
          })
        );

        // Process booked slots (blue)
        const processedBlueAppointments = data.appointments_booked.map(
          ([Date, startTime, PatientId, feedback]) => ({
            Date,
            StartTime: startTime,
            PatientId,
            feedback
          })
        );

        // Update state
        setGreenAppointments(processedGreenAppointments);
        setBlueAppointments(processedBlueAppointments);
        setRedAppointments([]); // No red appointments in doctor view, all non-green/blue slots are unavailable

        console.log("Doctor view - Green appointments:", processedGreenAppointments);
        console.log("Doctor view - Blue appointments:", processedBlueAppointments);
      } else {
        // Patient view - existing logic 
        const response = await fetch("http://localhost:8001/showOneDoctorAllPatients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DoctorId: DOCTOR_ID,
            PatientId: PATIENT_ID,
            Date: startDate,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        console.log("Patient view - Raw API response:", data);

        // Process blue appointments (patient's own appointments)
        const processedBlueAppointments = data.appointments_in_blue.map(
          ([Date, StartTime]) => ({
            Date,
            StartTime,
          })
        );
        
        // Process red appointments (other patients' appointments)
        const processedRedAppointments = data.appointments_in_red.map(
          ([Date, StartTime]) => ({
            Date,
            StartTime,
          })
        );

        setBlueAppointments(processedBlueAppointments);
        setRedAppointments(processedRedAppointments);
        
        // For patient view, we need to fetch available slots separately
        await fetchAvailableAppointments();
        
        console.log("Patient view - Blue appointments:", processedBlueAppointments);
        console.log("Patient view - Red appointments:", processedRedAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, [DOCTOR_ID, PATIENT_ID, USER_TYPE, generateWeekDays, fetchAvailableAppointments]);

  // Fetch appointments when component mounts and when week changes
  useEffect(() => {
    fetchAppointments();
    fetchAvailableAppointments();
  }, [fetchAppointments, fetchAvailableAppointments]);

  // Function to handle booking
  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      const requestData = {
        DoctorId: parseInt(DOCTOR_ID, 10),
        PatientId: parseInt(PATIENT_ID, 10),
        Date: selectedSlot.date,
        startTime: selectedSlot.time,
      };

      // Check if the user has another appointment in the same week
      const checkResponse = await fetch("http://localhost:8001/checkIfAnotherAppointmentSameWeek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PatientId: parseInt(PATIENT_ID, 10),
          Date: selectedSlot.date,
        }),
      });

      const checkData = await checkResponse.json();
      
      if (checkData.hasAppointment) {
        // Ask user if they want to cancel existing appointment and book a new one
        const existingAppt = checkData.appointment;
        const confirmSwitch = window.confirm(
          `You already have an appointment on ${existingAppt.Date} at time slot ${existingAppt.startTime}. 
          Would you like to cancel that appointment and book this one instead?`
        );
        
        if (!confirmSwitch) {
          setShowBookingModal(false);
          return;
        }
        
        // Cancel the existing appointment
        const cancelResponse = await fetch("http://localhost:8001/deleteAppointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DoctorId: existingAppt.DoctorId,
            PatientId: parseInt(PATIENT_ID, 10),
            Date: existingAppt.Date,
            startTime: existingAppt.startTime,
          }),
        });
        
        if (!cancelResponse.ok) {
          throw new Error("Failed to cancel existing appointment");
        }
      }

      // Book the new appointment
      const response = await fetch("http://localhost:8001/bookAppointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to book appointment");
      }

      // Show success message
      alert("Appointment booked successfully!");

      // Fetch updated appointments
      await fetchAppointments();
      await fetchAvailableAppointments();

      // Close the modal and reset selected slot
      setShowBookingModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Booking error:", error);
      alert(`Error booking appointment: ${error.message}`);
    }
  };

  // Function to handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!selectedSlot) return;

    try {
      const response = await fetch("http://localhost:8001/deleteAppointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          DoctorId: parseInt(DOCTOR_ID, 10),
          PatientId: parseInt(PATIENT_ID, 10),
          Date: selectedSlot.date,
          startTime: selectedSlot.time, // This is now the slot index
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to cancel appointment");
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

        {/* Color legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-color available-legend"></span>
            <span>Available slots</span>
          </div>
          <div className="legend-item">
            <span className="legend-color user-booked-legend"></span>
            <span>Your appointments</span>
          </div>
          <div className="legend-item">
            <span className="legend-color booked-legend"></span>
            <span>Booked by others</span>
          </div>
          <div className="legend-item">
            <span className="legend-color unavailable-legend"></span>
            <span>Unavailable</span>
          </div>
          <div className="legend-item">
            <span className="legend-color past-legend"></span>
            <span>Past date</span>
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
                const isBookedByPatient = isSlotBookedByPatient(
                  formattedDate,
                  slot.index
                );
                const isBookedByOthers = isSlotBookedByOthers(
                  formattedDate,
                  slot.index
                );
                const isAvailable = greenAppointments.some(
                  (appointment) =>
                    appointment.Date === formattedDate &&
                    appointment.StartTime === slot.index
                );
                const isPast = isPastDate(day);

                console.log(`Slot ${slot.index} on ${formattedDate}:`, {
                  isBookedByPatient,
                  isBookedByOthers,
                  isAvailable,
                  isPast,
                  appointments: [
                    ...blueAppointments,
                    ...redAppointments,
                    ...greenAppointments,
                  ].filter(
                    (a) =>
                      a.Date === formattedDate && a.StartTime === slot.index
                  ),
                });

                let slotClass = "time-slot";
                if (isPast) {
                  slotClass += " past-slot";
                } else if (isBookedByPatient) {
                  slotClass += " user-booked";
                } else if (isBookedByOthers) {
                  slotClass += " booked";
                } else if (isAvailable) {
                  slotClass += " available";
                } else {
                  slotClass += " unavailable";
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
                      : isAvailable
                      ? "Available" 
                      : isPast
                      ? "Past"
                      : "Unavailable"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      <footer className="calendar-footer">
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => navigate("/landing")}>
            Go back home
          </button>
          <button className="nav-button" onClick={() => navigate("/AssistAI")}>
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
