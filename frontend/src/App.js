import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import Landing   from './pages/landing';
import Login     from './pages/login';
import Home      from './pages/home';
import Calender  from './pages/calender';
import AssistAI  from './pages/AssistAI';
import Doctors   from './pages/Doctors';
import ScheduleAssist from './pages/ScheduleAssist';
import Admin_Login from './pages/Admin_Login';
import Admin from './pages/Admin';

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
          <Route path="/landing"        element={<Landing />} />
          <Route path="/calender"       element={<Calender />} />
          <Route path="/AssistAI"       element={<AssistAI />} />
          <Route path="/schedule-assist" element={<ScheduleAssist />} />
          <Route path="/doctors"        element={<Doctors />} />
          <Route path="/admin"          element={<Admin />} />
        </Route>

        {/* these routes render *outside* of Layout, so no NavBar */}
        <Route path="/" element={<Home />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/admin-login" element={<Admin_Login />} />
      </Routes>
    </Router>
  );
}

export default App;
