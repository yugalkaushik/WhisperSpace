import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GoogleAuthButton from './GoogleAuthButton';
import { isValidEmail, isValidUsername } from '../../utils/formatters';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, error: authError } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidUsername(username)) {
      setError('Username must be 2-30 characters, alphanumeric and underscores only');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email format');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(username, email, password);
    } catch (err) {
      setError(authError || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
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
      <Button type="submit" disabled={!username || !email || !password}>
        Register
      </Button>
      <GoogleAuthButton />
    </form>
  );
};

export default RegisterForm;