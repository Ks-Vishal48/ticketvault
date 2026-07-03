import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LiveNotifications from './components/common/LiveNotifications';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <LiveNotifications />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/vendor" element={
          <ProtectedRoute roles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <p style={{ fontSize: '4rem' }}>🎟️</p>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page Not Found</h2>
            <p style={{ color: '#8892a4', marginBottom: '1.5rem' }}>The page you're looking for doesn't exist.</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid #2a2a4a',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a2e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' } },
          }}
        />
      </AuthProvider>
    </Router>
  );
}
