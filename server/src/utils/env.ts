const missingEnvError = (key: string) =>
  new Error(`[env] Missing required environment variable: ${key}`);

export const requireEnv = (key: string): string => {
  const rawValue = process.env[key];
  if (!rawValue || rawValue.trim().length === 0) {
    throw missingEnvError(key);
  }

  return rawValue.trim();
};

export const requireNumberEnv = (key: string): number => {
  const value = requireEnv(key);
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`[env] ${key} must be a valid number. Received: ${value}`);
  }

  return parsed;
};

export const getClientBaseUrl = (): string => requireEnv('CLIENT_URL');

export const getServerPort = (): number => requireNumberEnv('PORT');

export const getMongoUri = (): string => requireEnv('MONGODB_URI');

export const getSessionSecret = (): string => requireEnv('SESSION_SECRET');

export const getGoogleCallbackUrl = (): string => requireEnv('GOOGLE_CALLBACK_URL');
