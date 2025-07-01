import { useState } from 'react';
import Button from '../ui/Button';
import { ChromeIcon } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';

const GoogleAuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    try {
      // Redirect to server's Google OAuth endpoint
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error) {
      console.error('Google OAuth redirect failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <ChromeIcon className="inline-block mr-2 w-4 h-4" />
      {isLoading ? 'Redirecting...' : 'Sign in with Google'}
    </Button>
  );
};

export default GoogleAuthButton;