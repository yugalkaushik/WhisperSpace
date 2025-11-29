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
    <div className="app-shell flex items-center justify-center px-4 py-10 lg:px-10">
      <div className="app-grid" />
      <div className="glow-pill bg-blue-900/40 -top-10 -left-10" />
      <div className="glow-pill bg-sky-500/30 bottom-0 right-0" />

      <div className={`relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_1fr] ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
        <section className="space-y-8">
          <div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
              The modern lounge for private conversations.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
              WhisperSpace keeps your rooms minimal, private and ambient. Spin up a space, invite
              your crew, and let the conversation flow without feeds or noise.
            </p>
          </div>
        </section>

        <section className="frosted-card neon-border p-6 sm:p-8">
          <div className="space-y-6">
            <header className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Sign in</p>
              <h2 className="text-2xl font-semibold text-white">Join your private room</h2>
              <p className="text-sm text-slate-400">Authenticate with Google to sync your rooms and profile.</p>
            </header>

            {authError && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {getErrorMessage(authError)}
              </div>
            )}

            <GoogleAuthButton />

          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;