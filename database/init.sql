CREATE TABLE Admin (
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL, 
    password VARCHAR(100) NOT NULL,
    CONSTRAINT Admin_PK PRIMARY KEY (email)
);
CREATE TABLE Doctors (
  DoctorId VARCHAR(10) NOT NULL,
  DoctorName VARCHAR(100) NOT NULL,
  DoctorInfo TEXT NOT NULL,
  DoctorSpecialty VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL,
  Password VARCHAR(100) NOT NULL,
  CONSTRAINT DOCTOR_PK PRIMARY KEY (DoctorId)
);
CREATE TABLE Patients (
  PatientId VARCHAR(10) NOT NULL,
  PatientName VARCHAR(100) NOT NULL,
  PatientInfo TEXT NOT NULL,
  PatientAge INT NOT NULL,
  Gender VARCHAR(1) NOT NULL,
  Email VARCHAR(100) NOT NULL,
  Password VARCHAR(100) NOT NULL,
  CONSTRAINT PATIENT_PK PRIMARY KEY (PatientId)
);
CREATE TABLE Appointments (
    id INT NOT NULL AUTO_INCREMENT,
    Date DATE NOT NULL, -- day of the appointment
    startTime INT NOT NULL,
    PatientId VARCHAR(10) NOT NULL,
    DoctorId VARCHAR(10) NOT NULL,
    feedback TEXT,
    CONSTRAINT APPOINTMENT_PK PRIMARY KEY (id),
    CONSTRAINT APPOINTMENT_FK1 FOREIGN KEY (PatientId) REFERENCES Patients (PatientId),
    CONSTRAINT APPOINTMENT_FK2 FOREIGN KEY (DoctorId) REFERENCES Doctors (DoctorId)
);

INSERT INTO Admin (name, email, password) VALUES 
('Alice Johnson', 'alice.johnson@example.com', 'password123'),
('Bob Smith', 'bob.smith@example.com', 'securepass456'),
('Carol Davis', 'carol.davis@example.com', 'mypassword789');
