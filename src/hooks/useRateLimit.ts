
import { useState, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitState {
  count: number;
  resetTime: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { maxRequests, windowMs, message = "Muitas tentativas. Tente novamente em alguns segundos." } = config;
  const [isLimited, setIsLimited] = useState(false);
  const stateRef = useRef<RateLimitState>({ count: 0, resetTime: Date.now() + windowMs });

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Reset window if expired
    if (now >= state.resetTime) {
      state.count = 0;
      state.resetTime = now + windowMs;
      setIsLimited(false);
    }

    // Check if limit exceeded
    if (state.count >= maxRequests) {
      setIsLimited(true);
      
      const remainingTime = Math.ceil((state.resetTime - now) / 1000);
      
      toast({
        title: "Limite de requisições",
        description: `${message} Tente novamente em ${remainingTime}s.`,
        variant: "destructive",
      });
      
      return false;
    }

    // Increment counter
    state.count++;
    return true;
  };

  const getRemainingTime = (): number => {
    const now = Date.now();
    return Math.max(0, Math.ceil((stateRef.current.resetTime - now) / 1000));
  };

  const getRemainingRequests = (): number => {
    return Math.max(0, maxRequests - stateRef.current.count);
  };

  return {
    checkRateLimit,
    isLimited,
    getRemainingTime,
    getRemainingRequests,
  };
};

// Rate limiter específico para autenticação
export const useAuthRateLimit = () => {
  return useRateLimit({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: "Muitas tentativas de login. Por segurança, aguarde antes de tentar novamente."
  });
};

// Rate limiter para operações de CRUD
export const useCrudRateLimit = () => {
  return useRateLimit({
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minuto
    message: "Muitas operações realizadas rapidamente."
  });
};

// Rate limiter para relatórios
export const useReportRateLimit = () => {
  return useRateLimit({
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minuto
    message: "Muitas consultas de relatórios. Aguarde antes de gerar novos relatórios."
  });
};
