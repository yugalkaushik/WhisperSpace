import GoogleAuthButton from '../components/auth/GoogleAuthButton';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
            WhisperSpace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Connect and chat with people around the world
          </p>
          <GoogleAuthButton />
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;