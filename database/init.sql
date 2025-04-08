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
    date DATE NOT NULL, -- day of the appointment
    start_time time NOT NULL,
    end_time time NOT NULL,
    patient_id VARCHAR(10) NOT NULL,
    doctor_id VARCHAR(10) NOT NULL,
    feedback TEXT,
    CONSTRAINT APPOINTMENT_PK PRIMARY KEY (id),
    CONSTRAINT APPOINTMENT_FK1 FOREIGN KEY (patient_id) REFERENCES Patients (PatientId),
    CONSTRAINT APPOINTMENT_FK2 FOREIGN KEY (doctor_id) REFERENCES Doctors (DoctorId)
);

INSERT INTO Admin (name, email, password) VALUES 
('Alice Johnson', 'alice.johnson@example.com', 'password123'),
('Bob Smith', 'bob.smith@example.com', 'securepass456'),
('Carol Davis', 'carol.davis@example.com', 'mypassword789');

INSERT INTO Doctors (DoctorId, DoctorName, DoctorInfo, DoctorSpecialty, Email, Password) VALUES
('D001', 'Dr. Emily Carter', 'Experienced cardiologist with 10 years of practice.', 'Cardiology', 'emily.carter@example.com', 'cardio123'),
('D002', 'Dr. Michael Brown', 'Renowned orthopedic surgeon specializing in joint replacements.', 'Orthopedics', 'michael.brown@example.com', 'ortho456');

INSERT INTO Patients (PatientId, PatientName, PatientInfo, PatientAge, Gender, Email, Password) VALUES
('P001', 'John Doe', 'Patient with a history of hypertension.', 45, 'M', 'john.doe@example.com', 'john123'),
('P002', 'Jane Smith', 'Patient recovering from knee surgery.', 34, 'F', 'jane.smith@example.com', 'jane456'),
('P003', 'Robert Johnson', 'Diabetic patient under regular monitoring.', 50, 'M', 'robert.johnson@example.com', 'robert789'),
('P004', 'Emily Davis', 'Patient undergoing physical therapy.', 29, 'F', 'emily.davis@example.com', 'emily321');

INSERT INTO Appointments (date, start_time, end_time, patient_id, doctor_id, feedback) VALUES
('2023-10-01', '09:00:00', '09:30:00', 'P001', 'D001', 'Follow-up on hypertension treatment.'),
('2023-10-02', '10:00:00', '10:30:00', 'P002', 'D002', 'Post-operative check-up for knee surgery.'),
('2023-10-03', '11:00:00', '11:30:00', 'P003', 'D001', 'Routine check for diabetes management.'),
('2023-10-04', '14:00:00', '14:30:00', 'P004', 'D002', 'Assessment of physical therapy progress.');