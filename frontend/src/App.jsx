import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Grades from './pages/Grades';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';
import TerminalReport from './pages/TerminalReport';
import TeacherAccounts from './pages/TeacherAccounts';
import StudentAccounts from './pages/StudentAccounts';
import StudentPortal from './pages/StudentPortal';
import Layout from './components/ui/Layout';
import PasswordModal from './components/ui/PasswordModal';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="font-display text-primary text-2xl">EM</span>
        </div>
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/*" element={
      <ProtectedRoute>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/reports/terminal" element={<TerminalReport />} />
            <Route path="/teacher-accounts" element={<TeacherAccounts />} />
            <Route path="/student-accounts" element={<StudentAccounts />} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ProtectedRoute>
    } />
  </Routes>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(22,163,74,0.3)',
              borderRadius: '12px'
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' }
            }
          }}
        />
        <PasswordModal />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;