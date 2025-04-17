import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Doctors.css';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  useEffect(() => {
    axios
      .get('http://localhost:8001/getDoctors')
      .then((response) => {
        setDoctors(response.data.doctors || []);
        setDoctors(response.data.doctors.map(doctor => ({
          DoctorId: doctor.DoctorId,
          DoctorName: doctor.DoctorName,
          DoctorInfo: doctor.DoctorInfo,
          DoctorSpecialty: doctor.DoctorSpecialty
        })));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        setLoading(false);
      });
  }, []);

  const handleBook = (doctorId) => {
      navigate('/calender', { state: { doctorId } });
  };

  if (loading) return <div className="loading">Loading doctors...</div>;

return (
    <div className="doctors-container">
        <h1>Available Doctors</h1>
        {doctors.length === 0 ? (
            <div className="no-doctors-box">
                <p>No doctors are available at the moment.</p>
            </div>
        ) : (
            <div className="doctors-grid">
                {doctors.map((doctor) => (
                    <div key={doctor.DoctorId} className="doctor-card">
                        <h2>{doctor.DoctorName}</h2>
                        <p><strong>Specialty:</strong> {doctor.DoctorSpecialty}</p>
                        <p><strong>Info:</strong> {doctor.DoctorInfo}</p>
                        <button onClick={() => handleBook(doctor.DoctorId)}>Book Appointment</button>
                    </div>
                ))}
            </div>
        )}
    </div>
);
}

export default Doctors;
