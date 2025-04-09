import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing.js';
import Calender from './pages/calender.js';
import AssistAI from './pages/AssistAI.js';
import ScheduleAssist from './pages/ScheduleAssist.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/calender" element={<Calender />} />
        <Route path="/AssistAI" element={<AssistAI />} />
        <Route path="/schedule-assist" element={<ScheduleAssist />} />
      </Routes>
    </Router>
  );
}

export default App;