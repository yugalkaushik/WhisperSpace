import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GoogleAuthButton from './GoogleAuthButton';
import { isValidEmail } from '../../utils/formatters';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, error: authError } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Invalid email format');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setError(authError || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button type="submit" disabled={!email || !password}>
        Login
      </Button>
      <GoogleAuthButton />
    </form>
  );
};

export default LoginForm;