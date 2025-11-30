/**
 * Keep-Alive Service
 * Prevents free-tier servers (Render, Railway, etc.) from spinning down due to inactivity
 * Self-pings the server every 5 minutes to keep it active
 */

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private serverUrl: string = '';

  constructor() {
    // Will be set when start() is called
  }

  /**
   * Start the keep-alive service
   * @param serverUrl - The base URL of the server (e.g., https://your-app.onrender.com)
   */
  start(serverUrl?: string) {
    if (this.intervalId) {
      console.log('⚠️  Keep-alive service is already running');
      return;
    }

    // Use provided URL or construct from environment
    this.serverUrl = serverUrl || this.getServerUrl();

    if (!this.serverUrl) {
      console.log('⚠️  No server URL provided. Keep-alive service not started.');
      console.log('💡 Set SERVER_URL environment variable or pass URL to start()');
      return;
    }

    console.log(`🔄 Starting keep-alive service...`);
    console.log(`📡 Pinging ${this.serverUrl}/api/health every ${this.PING_INTERVAL / 1000 / 60} minutes`);

    // Initial ping
    this.ping();

    // Schedule regular pings
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);
  }

  /**
   * Stop the keep-alive service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Keep-alive service stopped');
    }
  }

  /**
   * Ping the server to keep it alive
   */
  private async ping() {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.serverUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      const duration = Date.now() - startTime;

      if (response.ok) {
        console.log(`✅ Keep-alive ping successful (${duration}ms) - Server is active`);
      } else {
        console.log(`⚠️  Keep-alive ping returned status ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ Keep-alive ping failed: ${error.message}`);
      } else {
        console.error('❌ Keep-alive ping failed:', error);
      }
    }
  }

  /**
   * Get server URL from environment or construct it
   */
  private getServerUrl(): string {
    // Check for explicit SERVER_URL environment variable
    if (process.env.SERVER_URL) {
      return process.env.SERVER_URL;
    }

    // Try to construct from PORT and NODE_ENV
    if (process.env.NODE_ENV === 'production') {
      // Common free-tier hosting patterns
      if (process.env.RENDER_EXTERNAL_URL) {
        return process.env.RENDER_EXTERNAL_URL; // Render.com
      }
      if (process.env.RAILWAY_STATIC_URL) {
        return process.env.RAILWAY_STATIC_URL; // Railway.app
      }
      // Add more hosting platforms as needed
    }

    // Development fallback
    const port = process.env.PORT || 5000;
    return `http://localhost:${port}`;
  }

  /**
   * Get the current status of the keep-alive service
   */
  getStatus() {
    return {
      isRunning: this.intervalId !== null,
      serverUrl: this.serverUrl,
      pingInterval: this.PING_INTERVAL,
    };
  }
}

export const keepAliveService = new KeepAliveService();
