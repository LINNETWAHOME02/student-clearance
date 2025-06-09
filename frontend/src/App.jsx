import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';

import Auth from './auth/Auth';
import StudentDashboard from './pages/student/StudentDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/system-admin/AdminDashboard';

function App() {
  const { user } = useAuth();

  // Redirect logged-in users to their dashboard
  const RedirectToDashboard = () => {
    if (!user) return <Navigate to="/auth" />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" />;
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" />;
    if (user.role === 'systemadmin') return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/auth" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RedirectToDashboard />} />
        <Route path="/auth" element={<Auth />} />

        {/* Role-protected routes */}
        <Route path="/student/dashboard" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/auth" />} />
        
        <Route path="/staff/dashboard" element={user?.role === 'staff' ? <StaffDashboard /> : <Navigate to="/auth" />} />
        
        <Route path="/admin/dashboard" element={user?.role === 'systemadmin' ? <AdminDashboard /> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;