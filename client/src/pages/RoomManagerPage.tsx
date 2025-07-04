import { useEffect, useContext, useState } from 'react';
import { AuthContext } from '../contexts/auth-context';
import RoomManager from '../components/room/RoomManager';

const RoomManagerPage = () => {
  const { user } = useContext(AuthContext);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      const hasRefreshed = sessionStorage.getItem('roomManagerRefreshed');
      
      if (!hasRefreshed) {
        sessionStorage.setItem('roomManagerRefreshed', 'true');
        setIsRefreshing(true);
        
        const refreshTimer = setTimeout(() => {
          window.location.reload();
        }, 1500);

        return () => clearTimeout(refreshTimer);
      }
    }
  }, [user]);

  if (isRefreshing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-medium">Refreshing...</p>
        </div>
      </div>
    );
  }

  return <RoomManager />;
};

export default RoomManagerPage;
