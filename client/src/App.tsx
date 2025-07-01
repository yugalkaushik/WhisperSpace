import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AuthCallback from './pages/AuthCallback';
import RoomManagerPage from './pages/RoomManagerPage';
import TransitionScreen from './pages/TransitionScreen';
import ProfileSetupPage from './pages/ProfileSetup';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
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
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;