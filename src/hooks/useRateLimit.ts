
import { useState, useRef, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
  blockDuration?: number; // How long to block after limit exceeded
}

interface RequestLog {
  timestamp: number;
  count: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { 
    maxRequests, 
    windowMs, 
    message = "Muitas tentativas. Tente novamente em alguns segundos.",
    blockDuration = 60000 // 1 minute default block
  } = config;
  
  const [isLimited, setIsLimited] = useState(false);
  const requestLog = useRef<RequestLog[]>([]);
  const blockUntil = useRef<number>(0);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();

    // Check if currently blocked
    if (now < blockUntil.current) {
      const remainingSeconds = Math.ceil((blockUntil.current - now) / 1000);
      toast({
        title: "Acesso bloqueado",
        description: `Aguarde ${remainingSeconds} segundos antes de tentar novamente.`,
        variant: "destructive",
      });
      return false;
    }

    // Clean old entries outside the window
    requestLog.current = requestLog.current.filter(
      entry => now - entry.timestamp < windowMs
    );

    // Count current requests in window
    const currentRequests = requestLog.current.reduce(
      (sum, entry) => sum + entry.count, 0
    );

    // Check if limit exceeded
    if (currentRequests >= maxRequests) {
      setIsLimited(true);
      blockUntil.current = now + blockDuration;
      
      toast({
        title: "Limite de requisições excedido",
        description: `${message} Bloqueado por ${blockDuration / 1000} segundos.`,
        variant: "destructive",
      });
      
      return false;
    }

    // Log this request
    const existingEntry = requestLog.current.find(
      entry => now - entry.timestamp < 1000 // Group requests within 1 second
    );

    if (existingEntry) {
      existingEntry.count++;
    } else {
      requestLog.current.push({ timestamp: now, count: 1 });
    }

    setIsLimited(false);
    return true;
  }, [maxRequests, windowMs, message, blockDuration]);

  const resetLimit = useCallback(() => {
    requestLog.current = [];
    blockUntil.current = 0;
    setIsLimited(false);
  }, []);

  return {
    checkRateLimit,
    resetLimit,
    isLimited,
    remainingTime: Math.max(0, blockUntil.current - Date.now())
  };
};
