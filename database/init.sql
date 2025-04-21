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


CREATE TABLE Donors (
  DonorId         INT            NOT NULL AUTO_INCREMENT,
  DonorName       VARCHAR(100)   NOT NULL,
  DonorInfo       TEXT,
  Email           VARCHAR(100)   NOT NULL,
  PhoneNumber     VARCHAR(20),
  AmountDonated   DECIMAL(10, 2) NOT NULL,
  DonationDate    DATE           NOT NULL,
  PrivateDonation BOOLEAN        NOT NULL DEFAULT FALSE,
  PRIMARY KEY (DonorId),
  CONSTRAINT UQ_Donors_Email UNIQUE (Email)
);



INSERT INTO Admin (name, email, password) VALUES 
('mohamad', 'lakkis@gmail.com', '123456');
