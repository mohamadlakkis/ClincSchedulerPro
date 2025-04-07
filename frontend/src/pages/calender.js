import React, { useState } from 'react';
import '../styles/calender.css';

const Calendar = () => {
    const [currentWeek, setCurrentWeek] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const PATIENT_ID = '0000001'; // Constant for patient ID
    const DOCTOR_ID = '000001'; // Constant for doctor ID

    // Generate time slots from 9 AM to 6 PM in 30-minute intervals
    const timeSlots = Array.from({ length: 18 }, (_, i) => {
        const hour = Math.floor(i / 2) + 9;
        const minutes = (i % 2) * 30;
        return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });

    // Function to check if a slot is booked by the current patient
    const isSlotBookedByPatient = (date, time) => {
        return appointments.some(appointment => 
            appointment.Date === date && 
            appointment.StartTime === time &&
            appointment.PatientID === PATIENT_ID
        );
    };

    // Function to check if a slot is booked by other patients
    const isSlotBookedByOthers = (date, time) => {
        return appointments.some(appointment => 
            appointment.Date === date && 
            appointment.StartTime === time &&
            appointment.PatientID !== PATIENT_ID
        );
    };

    // Function to handle slot click
    const handleSlotClick = (date, time) => {
        if (isPastDate(date)) return;
        
        const isBookedByPatient = isSlotBookedByPatient(formatDate(date), time);
        const isBookedByOthers = isSlotBookedByOthers(formatDate(date), time);
        
        if (isBookedByPatient) {
            // If it's the patient's own booking, show cancel modal
            setSelectedSlot({ date: formatDate(date), time });
            setShowCancelModal(true);
        } else if (!isBookedByOthers) {
            // If it's not booked by anyone, show booking modal
            setSelectedSlot({ date: formatDate(date), time });
            setShowBookingModal(true);
        }
        // If it's booked by others, do nothing
    };

    // Function to handle booking
    const handleBooking = () => {
        if (!selectedSlot) return;
        
        const newAppointment = {
            PatientID: PATIENT_ID,
            DoctorID: DOCTOR_ID,
            Date: selectedSlot.date,
            StartTime: selectedSlot.time,
            EndTime: add30Minutes(selectedSlot.time)
        };
        
        setAppointments([...appointments, newAppointment]);
        setShowBookingModal(false);
        setSelectedSlot(null);
    };

    // Function to handle appointment cancellation
    const handleCancelAppointment = () => {
        if (!selectedSlot) return;

        // Find the appointment to be cancelled
        const appointmentToCancel = appointments.find(appointment => 
            appointment.Date === selectedSlot.date && 
            appointment.StartTime === selectedSlot.time
        );

        // Check if the appointment exists and belongs to the current patient
        if (appointmentToCancel && appointmentToCancel.PatientID === PATIENT_ID) {
            // This is where you would make the DELETE API call in the future
            // DELETE FROM appointments 
            // WHERE Date = selectedSlot.date 
            // AND StartTime = selectedSlot.time 
            // AND PatientID = PATIENT_ID

            // For now, we'll just update the local state
            const updatedAppointments = appointments.filter(appointment => 
                !(appointment.Date === selectedSlot.date && 
                  appointment.StartTime === selectedSlot.time &&
                  appointment.PatientID === PATIENT_ID)
            );
            
            setAppointments(updatedAppointments);
            setShowCancelModal(false);
            setSelectedSlot(null);
        } else {
            // If the appointment doesn't exist or doesn't belong to the current patient
            alert("You can only cancel your own appointments.");
            setShowCancelModal(false);
            setSelectedSlot(null);
        }
    };

    // Helper function to add 30 minutes to a time string
    const add30Minutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + 30, 0);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // Function to generate week days
    const generateWeekDays = () => {
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
    };

    // Function to format date as YYYY-MM-DD
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Function to check if a date is in the past
    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Function to get week label
    const getWeekLabel = () => {
        const labels = ['Current Week', 'Next Week', 'Week After Next', 'Fourth Week'];
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
            <div className="calendar-header">
                <h2>Appointment Calendar</h2>
                <div className="date-navigation">
                    <button 
                        onClick={handlePreviousWeek} 
                        disabled={currentWeek === 0}
                    >
                        Previous Week
                    </button>
                    <button 
                        onClick={handleFirstWeek} 
                        disabled={currentWeek === 0}
                    >
                        Current Week
                    </button>
                    <button 
                        onClick={handleNextWeek} 
                        disabled={currentWeek === 3}
                    >
                        Next Week
                    </button>
                </div>
            </div>
            
            <div className="week-display">
                <div className="week-label">{getWeekLabel()}</div>
                <div className="date-range">
                    {firstDay.toLocaleDateString()} - {lastDay.toLocaleDateString()}
                </div>
            </div>

            <div className="calendar-grid">
                <div className="time-column">
                    <div className="time-header">Time</div>
                    {timeSlots.map(time => (
                        <div key={time} className="time-slot">{time}</div>
                    ))}
                </div>
                
                {weekDays.map(day => (
                    <div 
                        key={day.toISOString()} 
                        className={`day-column ${isPastDate(day) ? 'past-day' : ''}`}
                    >
                        <div className="day-header">
                            {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        {timeSlots.map(time => {
                            const isBookedByPatient = isSlotBookedByPatient(formatDate(day), time);
                            const isBookedByOthers = isSlotBookedByOthers(formatDate(day), time);
                            const isPast = isPastDate(day);
                            
                            return (
                                <div
                                    key={`${day.toISOString()}-${time}`}
                                    className={`time-slot ${
                                        isPast ? '' :
                                        isBookedByPatient ? 'user-booked' :
                                        isBookedByOthers ? 'booked' : 'available'
                                    }`}
                                    onClick={() => handleSlotClick(day, time)}
                                >
                                    {isBookedByPatient ? 'Your Booking' : isBookedByOthers ? 'Booked' : 'Available'}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {showBookingModal && (
                <div className="booking-modal">
                    <div className="modal-content">
                        <h3>Book Appointment</h3>
                        <p>Selected time: {selectedSlot?.time} on {selectedSlot?.date}</p>
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
                        <p>Are you sure you want to cancel your appointment at {selectedSlot?.time} on {selectedSlot?.date}?</p>
                        <div className="modal-buttons">
                            <button onClick={handleCancelAppointment}>Yes, Cancel</button>
                            <button onClick={() => setShowCancelModal(false)}>No, Keep</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
