import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Input from '../ui/Input';
import Button from '../ui/Button';
import EmailOTPVerification from './EmailOTPVerification';
import { sendOTP, verifyOTP } from '../../services/api';

const EmailAuthForm = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (!isLoginMode && !formData.username) {
      setFormError('Username is required');
      return;
    }

    if (!isLoginMode && formData.username.length < 2) {
      setFormError('Username must be at least 2 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Sending OTP to:', formData.email);
      // Send OTP to email
      const response = await sendOTP({ 
        email: formData.email, 
        purpose: isLoginMode ? 'login' : 'registration' 
      });
      console.log('OTP sent successfully:', response);
      
      // Show OTP verification screen
      setShowOTPVerification(true);
    } catch (error) {
      console.error('OTP send error:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to send OTP. Please try again.';
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await verifyOTP({
        email: formData.email,
        otp,
        purpose: isLoginMode ? 'login' : 'registration',
        username: !isLoginMode ? formData.username : undefined,
        password: formData.password
      });

      // Set auth data and navigate
      setAuthData(response.data.user, response.data.token);
      navigate('/profile-setup');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'OTP verification failed. Please try again.';
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setFormError(null);
    try {
      await sendOTP({ 
        email: formData.email, 
        purpose: isLoginMode ? 'login' : 'registration' 
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to resend OTP. Please try again.';
      setFormError(errorMessage);
    }
  };

  const handleBackFromOTP = () => {
    setShowOTPVerification(false);
    setFormError(null);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormError(null);
    setShowOTPVerification(false);
    setFormData({ username: '', email: '', password: '' });
  };

  // Show OTP verification screen
  if (showOTPVerification) {
    return (
      <EmailOTPVerification
        email={formData.email}
        purpose={isLoginMode ? 'login' : 'registration'}
        onVerifySuccess={handleOTPVerify}
        onResendOTP={handleResendOTP}
        onBack={handleBackFromOTP}
        isVerifying={isSubmitting}
        error={formError}
      />
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoginMode && (
          <Input
            id="username"
            type="text"
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Choose a username"
            autoComplete="username"
            maxLength={30}
          />
        )}

        <Input
          id="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your@email.com"
          autoComplete="email"
        />

        <Input
          id="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter your password"
          autoComplete={isLoginMode ? 'current-password' : 'new-password'}
          helperText={!isLoginMode ? 'Must be at least 6 characters' : ''}
        />

        {formError && (
          <div 
            className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100" 
            style={{ borderRadius: 'var(--border-radius)' }}
          >
            {formError}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting 
            ? (isLoginMode ? 'Signing in...' : 'Creating account...') 
            : (isLoginMode ? 'Sign in with Email' : 'Create Account')}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
        >
          {isLoginMode ? (
            <>
              Don't have an account? <span className="text-indigo-400 font-semibold">Sign up</span>
            </>
          ) : (
            <>
              Already have an account? <span className="text-indigo-400 font-semibold">Sign in</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailAuthForm;
