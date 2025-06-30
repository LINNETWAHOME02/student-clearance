import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';

import Auth from './auth/Auth';
import EditProfile from './components/EditProfile';

// Student urls
import StudentDashboard from './pages/student/StudentDashboard';
import { ProjectClearance, LabClearance, LibraryClearance } from './pages/student/ClearanceForm';
import StudentStatus from './pages/student/StudentStatus';
import StudentHistory from './pages/student/StudentHistory';


// Staff urls
import StaffDashboard from './pages/staff/StaffDashboard';
import MyStudents from './pages/staff/MyStudents';
import ViewRequests from './pages/staff/ViewRequests';
import StaffHistory from './pages/staff/StaffHistory';

// Admin urls
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHistory from './pages/admin/AdminHistory';

function App() {
  const { user } = useAuth();

  // Redirect logged-in users to their dashboard
  const RedirectToDashboard = () => {
    if (!user) return <Navigate to="/auth/student" />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" />;
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/auth/student" />;
  };

  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<RedirectToDashboard />} />

        {/* Role-specific auth routes */}
        <Route path="/auth" element={<Auth defaultRole="Student" />} />
        <Route path="/auth/student" element={<Auth defaultRole="Student" />} />
        <Route path="/auth/staff" element={<Auth defaultRole="Staff" />} />
        <Route path="/auth/admin" element={<Auth defaultRole="Admin" />} />

        {/* Student routes */}
        <Route path="/student/*" element={
          user?.role === 'student' ? (
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="project-clearance" element={<ProjectClearance />} />
              <Route path="lab-clearance" element={<LabClearance />} />
              <Route path="library-clearance" element={<LibraryClearance />} />

              <Route path="student-status" element={<StudentStatus/>} />
              <Route path="history" element={<StudentHistory />} />
              <Route path="edit-profile" element={<EditProfile />} />
            </Routes>
          ) : (
            <Navigate to="/auth/student" />
          )
        } />

        {/* Staff routes */}
        <Route path="/staff/*" element={
          user?.role === 'staff' ? (
            <Routes>
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="my-students" element={<MyStudents />} />
              <Route path="requests" element={<ViewRequests />} />
              <Route path="history" element={<StaffHistory />} />
              <Route path="edit-profile" element={<EditProfile />} />
            </Routes>
          ) : (
            <Navigate to="/auth/staff" />
          )
        } />

        {/* Admin routes */}
        <Route path="/admin/*" element={
          user?.role === 'admin' ? (
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />

              <Route path="history/students" element={<AdminHistory tab="students" />} />
              <Route path="history/staff" element={<AdminHistory tab="staff" />} />
              <Route path="history/admin" element={<AdminHistory tab="admin" />} />

              <Route path="edit-profile" element={<EditProfile />} />
            </Routes>
          ) : (
            <Navigate to="/auth/admin" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;