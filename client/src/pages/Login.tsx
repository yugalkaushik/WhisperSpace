import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const [mounted, setMounted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);

    const error = new URLSearchParams(location.search).get('error');
    if (error) {
      setAuthError(error);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (window.location.pathname === '/login') {
      localStorage.removeItem('auth_attempt_time');
    }
  }, [location.search]);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth_failed':
        return 'Authentication failed. Please try again.';
      case 'invalid_token':
        return 'Your authentication token is invalid. Please sign in again.';
      case 'no_token':
        return 'No authentication token was found. Please sign in.';
      case 'server_error':
        return 'Server error occurred. Please try again later.';
      default:
        return 'An error occurred during sign in. Please try again.';
    }
  };

  return (
    <div className="app-shell flex items-center justify-center px-3 sm:px-4 lg:px-10 overflow-hidden">
      <div className="app-grid" />
      <div className="glow-pill bg-blue-900/40 -top-10 -left-10" />
      <div className="glow-pill bg-sky-500/30 bottom-0 right-0" />

      <div className={`relative z-10 grid w-full max-w-6xl gap-6 sm:gap-8 lg:grid-cols-[1.2fr_1fr] items-center ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
        <section className="space-y-6 sm:space-y-8">
          <div className="hidden lg:block">
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-white md:text-5xl">
              The modern lounge for private conversations.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
              WhisperSpace keeps your rooms minimal, private and ambient. Spin up a space, invite
              your crew, and let the conversation flow without feeds or noise.
            </p>
          </div>
        </section>

        <section className="border border-white/10 bg-[rgba(15,23,42,0.75)] backdrop-blur-md p-6 sm:p-8" style={{ borderRadius: 'var(--border-radius)' }}>
          <div className="space-y-6">
            <header className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sign in</p>
              <h2 className="text-2xl font-semibold text-white">Join your private room</h2>
              <p className="text-sm text-slate-400">Authenticate with Google to sync your rooms and profile.</p>
            </header>

            {authError && (
              <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100" style={{ borderRadius: 'var(--border-radius)' }}>
                {getErrorMessage(authError)}
              </div>
            )}

            <GoogleAuthButton />

            <footer className="pt-2 text-center border-t border-white/5">
              <p className="text-xs text-slate-500 mt-4">
                By signing in, you agree to our privacy practices. No spam, no tracking—just conversations.
              </p>
            </footer>

          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;