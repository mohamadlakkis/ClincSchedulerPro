import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing.js';
import Calender from './pages/calender.js';
import AssistAI from './pages/AssistAI.js';
import Login from './pages/login.js';
import Home from './pages/home.js';

import Doctors from './pages/Doctors.js';

import ScheduleAssist from './pages/ScheduleAssist.js';
import NavBar from './components/NavBar.js';
import './styles/App.css';

function Layout({ children }) {
  return (
    <div className="app-container">
      <NavBar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        
        <Route path="/landing" element={
          <Layout>
            <Landing />
          </Layout>
        } />
        <Route path="/calender" element={
          <Layout>
            <Calender />
          </Layout>
        } />
        <Route path="/AssistAI" element={
          <Layout>
            <AssistAI />
          </Layout>
        } />
        <Route path="/schedule-assist" element={
          <Layout>
            <ScheduleAssist />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/doctors" element={
          <Layout>
            <Doctors />
          </Layout>
        } />
        
      </Routes>
    </Router>
  );
}

export default App;