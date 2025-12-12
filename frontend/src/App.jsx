import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import PrincipalDashboard from './pages/Dashboard/PrincipalDashboard';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import TestPaper from './pages/TestPaper';
import TestTaking from './pages/TestTaking';
import SuperContestTaking from './pages/SuperContestTaking';
import BattleLobby from './pages/BattleLobby';
// import BattleArena from './pages/BattleArena'; // DELETED
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={`/dashboard/${user?.role}`} replace />;
  }

  return children;
};

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to={`/dashboard/${user?.role}`} replace /> : <Login />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/principal"
            element={
              <ProtectedRoute allowedRoles={['principal']}>
                <PrincipalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/manager"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Test Route */}
          <Route
            path="/test/:testId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <TestTaking />
              </ProtectedRoute>
            }
          />

          {/* Super Contest Route */}
          <Route
            path="/super-contest/:id"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <SuperContestTaking />
              </ProtectedRoute>
            }
          />

          {/* Battle Arena Routes */}
          <Route
            path="/battle"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <BattleLobby />
              </ProtectedRoute>
            }
          />
          {/* BattleArena Removed as checks are now inside BattleLobby */}

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
