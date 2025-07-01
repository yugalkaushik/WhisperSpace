import { useAuth0 } from '@auth0/auth0-react';
import Button from '../ui/Button';
import { FaGoogle } from 'react-icons/fa';

const GoogleAuthButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      variant="secondary"
      onClick={() => loginWithRedirect({ connection: 'google-oauth2' })}
    >
      <FaGoogle className="inline-block mr-2" />
      Sign in with Google
    </Button>
  );
};

export default GoogleAuthButton;