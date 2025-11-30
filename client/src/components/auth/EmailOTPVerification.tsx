import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';

interface EmailOTPVerificationProps {
  email: string;
  purpose: 'registration' | 'login';
  onVerifySuccess: (otp: string) => void;
  onResendOTP: () => void;
  onBack: () => void;
  isVerifying: boolean;
  error: string | null;
}

const EmailOTPVerification = ({
  email,
  onVerifySuccess,
  onResendOTP,
  onBack,
  isVerifying,
  error
}: EmailOTPVerificationProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      onVerifySuccess(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setOtp(newOtp);

    // Focus the next empty field or last field
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (newOtp.every(digit => digit !== '')) {
      onVerifySuccess(newOtp.join(''));
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(600);
    setCanResend(false);
    onResendOTP();
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onVerifySuccess(otpString);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.substring(0, 2) + '***' + local.substring(local.length - 1);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-full mb-2">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">Verify Your Email</h3>
        <p className="text-sm text-slate-400">
          We've sent a 6-digit code to<br />
          <span className="text-white font-medium">{maskEmail(email)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isVerifying}
              className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all disabled:opacity-50"
              style={{ borderRadius: 'var(--border-radius)' }}
            />
          ))}
        </div>

        {error && (
          <div 
            className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100" 
            style={{ borderRadius: 'var(--border-radius)' }}
          >
            {error}
          </div>
        )}

        <div className="text-center text-sm">
          {timeLeft > 0 ? (
            <p className="text-slate-400">
              Code expires in <span className="text-white font-semibold">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-red-400">Code expired. Please request a new one.</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isVerifying || otp.some(digit => !digit)}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify & Continue'}
        </Button>

        <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onBack}
            disabled={isVerifying}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            ← Change email
          </button>
          
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isVerifying}
            className="text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canResend ? 'Resend code' : 'Resend code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailOTPVerification;
