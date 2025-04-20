CREATE TABLE Admin (
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL, 
    password VARCHAR(100) NOT NULL,
    CONSTRAINT Admin_PK PRIMARY KEY (email)
);
CREATE TABLE Doctors (
  DoctorId      INT           NOT NULL AUTO_INCREMENT,
  DoctorName    VARCHAR(100)  NOT NULL,
  DoctorInfo    TEXT          NOT NULL,
  DoctorSpecialty VARCHAR(100) NOT NULL,
  Email         VARCHAR(100)  NOT NULL,
  Password      VARCHAR(100)  NOT NULL,
  PRIMARY KEY (DoctorId), 
  CONSTRAINT UQ_Doctors_Email UNIQUE (Email)
);

CREATE TABLE Patients (
  PatientId     INT           NOT NULL AUTO_INCREMENT,
  PatientName   VARCHAR(100)  NOT NULL,
  PatientInfo   TEXT          NOT NULL,
  PatientAge    INT           NOT NULL,
  Gender        CHAR(1)       NOT NULL,
  Email         VARCHAR(100)  NOT NULL,
  Password      VARCHAR(100)  NOT NULL,
  PRIMARY KEY (PatientId),
  CONSTRAINT UQ_Patients_Email UNIQUE (Email)
);

CREATE TABLE Appointments (
  id            INT           NOT NULL AUTO_INCREMENT,
  Date          DATE          NOT NULL,
  startTime     INT           NOT NULL,
  PatientId     INT,
  DoctorId      INT           NOT NULL,
  feedback      TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (PatientId) REFERENCES Patients (PatientId)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (DoctorId)  REFERENCES Doctors  (DoctorId)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);


INSERT INTO Admin (name, email, password) VALUES 
('Alice Johnson', 'alice.johnson@example.com', 'password123'),
('Bob Smith', 'bob.smith@example.com', 'securepass456'),
('Carol Davis', 'carol.davis@example.com', 'mypassword789');
