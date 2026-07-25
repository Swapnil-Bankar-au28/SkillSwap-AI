// src/App.jsx
// Root component — sets up routing, auth context, and toast notifications

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Profile     from './pages/Profile';
import Chat        from './pages/Chat';
import MatchDetail from './pages/MatchDetail';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/chat"        element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/matches/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
              <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
              <p style={{ color: 'var(--color-muted)' }}>Page not found</p>
            </div>
          } />
        </Routes>

        {/* Toast notification system */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface2)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
