
import { useState, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { maxRequests, windowMs, message = "Muitas tentativas. Tente novamente em alguns segundos." } = config;
  const [isLimited, setIsLimited] = useState(false);
  const requestCount = useRef(0);
  const windowStart = useRef(Date.now());

  const checkRateLimit = (): boolean => {
    const now = Date.now();

    // Reset window if expired
    if (now - windowStart.current >= windowMs) {
      requestCount.current = 0;
      windowStart.current = now;
      setIsLimited(false);
    }

    // Check if limit exceeded
    if (requestCount.current >= maxRequests) {
      setIsLimited(true);
      toast({
        title: "Limite de requisições",
        description: message,
        variant: "destructive",
      });
      return false;
    }

    // Increment counter
    requestCount.current++;
    return true;
  };

  return {
    checkRateLimit,
    isLimited,
  };
};
