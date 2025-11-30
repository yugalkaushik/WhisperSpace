/**
 * Client-side Keep-Alive Hook
 * Pings the server periodically to prevent it from spinning down on free-tier hosting
 */

import { useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

interface UseKeepAliveOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
}

export const useKeepAlive = (options: UseKeepAliveOptions = {}) => {
  const { 
    enabled = true, 
    interval = 4 * 60 * 1000 // 4 minutes by default
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const ping = async () => {
      try {
        await axios.get(`${API_BASE_URL}/health`, {
          timeout: 5000,
        });
        lastPingRef.current = Date.now();
      } catch (error) {
        console.error('❌ Keep-alive ping failed:', error);
      }
    };

    // Initial ping after 1 second
    const initialTimeout = setTimeout(ping, 1000);

    // Schedule regular pings
    intervalRef.current = setInterval(ping, interval);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval]);

  return {
    lastPing: lastPingRef.current,
  };
};
