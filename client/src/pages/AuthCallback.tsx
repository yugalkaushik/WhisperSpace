import { useEffect, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const AuthCallback = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const token = new URLSearchParams(location.search).get('token');
      if (token) {
        await login({ token });
        navigate('/chat');
      } else if (isAuthenticated && user) {
        try {
          const auth0Token = await getAccessTokenSilently();
          await login({
            email: user.email!,
            name: user.name || user.nickname || '',
            token: auth0Token,
          });
          navigate('/chat');
        } catch (error) {
          console.error('Auth0 token error:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [isAuthenticated, user, getAccessTokenSilently, login, navigate, location]);

  return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">Authenticating...</div>;
};

export default AuthCallback;