import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { useKeepAlive } from './hooks/useKeepAlive';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AuthCallback from './pages/AuthCallback';
import RoomManagerPage from './pages/RoomManagerPage';
import TransitionScreen from './pages/TransitionScreen';
import ProfileSetupPage from './pages/ProfileSetup';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  
  // Keep server alive on free-tier hosting
  useKeepAlive({ enabled: true, interval: 4 * 60 * 1000 }); // Ping every 4 minutes
  
  // Scroll to top and clear any cached state on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile-setup" element={
        <ProtectedRoute requireProfileSetup={false}>
          <ProfileSetupPage />
        </ProtectedRoute>
      } />
      <Route path="/rooms" element={
        <ProtectedRoute>
          <RoomManagerPage />
        </ProtectedRoute>
      } />
      <Route path="/transition" element={
        <ProtectedRoute>
          <TransitionScreen />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;