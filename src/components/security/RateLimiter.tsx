import React, { useState, useCallback, useEffect } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  blocked: boolean;
  blockExpiry: number;
}

export const useRateLimit = (key: string, config: RateLimitConfig) => {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    windowStart: Date.now(),
    blocked: false,
    blockExpiry: 0,
  });

  const checkLimit = useCallback(() => {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    
    // Get stored state
    const stored = localStorage.getItem(storageKey);
    let currentState: RateLimitState = stored ? JSON.parse(stored) : {
      attempts: 0,
      windowStart: now,
      blocked: false,
      blockExpiry: 0,
    };

    // Check if block has expired
    if (currentState.blocked && now > currentState.blockExpiry) {
      currentState = {
        attempts: 0,
        windowStart: now,
        blocked: false,
        blockExpiry: 0,
      };
    }

    // Check if window has expired
    if (now - currentState.windowStart > config.windowMs) {
      currentState = {
        attempts: 0,
        windowStart: now,
        blocked: currentState.blocked,
        blockExpiry: currentState.blockExpiry,
      };
    }

    setState(currentState);
    localStorage.setItem(storageKey, JSON.stringify(currentState));
    
    return !currentState.blocked;
  }, [key, config]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    
    setState(prev => {
      const newAttempts = prev.attempts + 1;
      const newState: RateLimitState = {
        ...prev,
        attempts: newAttempts,
      };

      // Check if limit exceeded
      if (newAttempts >= config.maxAttempts) {
        newState.blocked = true;
        newState.blockExpiry = now + config.blockDurationMs;
        newState.attempts = 0;
        newState.windowStart = now;
      }

      localStorage.setItem(storageKey, JSON.stringify(newState));
      return newState;
    });
  }, [key, config]);

  const getRemainingTime = useCallback(() => {
    if (!state.blocked) return 0;
    return Math.max(0, Math.ceil((state.blockExpiry - Date.now()) / 1000));
  }, [state]);

  const reset = useCallback(() => {
    const newState: RateLimitState = {
      attempts: 0,
      windowStart: Date.now(),
      blocked: false,
      blockExpiry: 0,
    };
    
    setState(newState);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(newState));
  }, [key]);

  // Initialize on mount
  useEffect(() => {
    checkLimit();
  }, [checkLimit]);

  return {
    isBlocked: state.blocked,
    attempts: state.attempts,
    maxAttempts: config.maxAttempts,
    remainingTime: getRemainingTime(),
    checkLimit,
    recordAttempt,
    reset,
  };
};

export const RateLimiter = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
