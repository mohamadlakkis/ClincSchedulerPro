// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Landing from './pages/landing.js';
// import Calender from './pages/calender.js';
// import AssistAI from './pages/AssistAI.js';
// import Login from './pages/login.js';
// import Home from './pages/home.js';

// import Doctors from './pages/Doctors.js';

// import ScheduleAssist from './pages/ScheduleAssist.js';
// import NavBar from './components/NavBar.js';
// import './styles/App.css';

// function Layout({ children }) {
//   return (
//     <div className="app-container">
//       <NavBar />
//       <main className="main-content">
//         {children}
//       </main>
//     </div>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={
//           <Layout>
//             <Home />
//           </Layout>
//         } />
        
//         <Route path="/landing" element={
//           <Layout>
//             <Landing />
//           </Layout>
//         } />
//         <Route path="/calender" element={
//           <Layout>
//             <Calender />
//           </Layout>
//         } />
//         <Route path="/AssistAI" element={
//           <Layout>
//             <AssistAI />
//           </Layout>
//         } />
//         <Route path="/schedule-assist" element={
//           <Layout>
//             <ScheduleAssist />
//           </Layout>
//         } />
//         <Route path="/login" element={
//           <Layout>
//             <Login />
//           </Layout>
//         } />
//         <Route path="/doctors" element={
//           <Layout>
//             <Doctors />
//           </Layout>
//         } />
        
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import Landing   from './pages/landing';
import Login     from './pages/login';
import Home      from './pages/home';
import Calender  from './pages/calender';
import AssistAI  from './pages/AssistAI';
import Doctors   from './pages/Doctors';
import ScheduleAssist from './pages/ScheduleAssist';

function Layout() {
  return (
    <div className="app-container">
      <NavBar />
      <main className="main-content">
        <Outlet />   {/* renders any child <Route> element */}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* these routes will all render inside Layout (with NavBar) */}
        <Route element={<Layout />}>
          <Route path="/landing"                element={<Landing />} />
          <Route path="/calender"        element={<Calender />} />
          <Route path="/AssistAI"        element={<AssistAI />} />
          <Route path="/schedule-assist" element={<ScheduleAssist />} />
          <Route path="/doctors"         element={<Doctors />} />
        </Route>

        {/* these routes render *outside* of Layout, so no NavBar */}
        <Route path="/" element={<Home />} />
        <Route path="/login"   element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
