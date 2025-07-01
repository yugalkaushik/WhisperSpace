import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileSetup?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfileSetup = true 
}) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEditing = searchParams.get('edit') === 'true';

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if profile setup is required and user hasn't completed it
  if (requireProfileSetup && (!user.nickname || !user.selectedAvatar)) {
    return <Navigate to="/profile-setup" replace />;
  }

  // If user is on profile setup page but has already completed setup, redirect to rooms
  // UNLESS they're explicitly editing their profile
  if (!requireProfileSetup && user.nickname && user.selectedAvatar && !isEditing) {
    return <Navigate to="/rooms" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
