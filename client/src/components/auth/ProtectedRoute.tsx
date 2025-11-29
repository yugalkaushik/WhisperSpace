import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context';
import { useProfile } from '../../hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileSetup?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfileSetup = true 
}) => {
  const { user, loading } = useContext(AuthContext);
  const { profile } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#010613] via-[#041434] to-[#00040a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireProfileSetup && !profile.nickname) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
