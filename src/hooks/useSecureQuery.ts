
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useSecurity } from '@/components/SecurityProvider';
import { useRateLimit } from './useRateLimit';
import { toast } from "@/hooks/use-toast";

interface SecureQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
  operation?: string;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export const useSecureQuery = <T>({
  queryFn,
  operation = 'database_query',
  rateLimit = { maxRequests: 50, windowMs: 60000 },
  ...options
}: SecureQueryOptions<T>) => {
  const { logSecurityEvent } = useSecurity();
  const { checkRateLimit } = useRateLimit(rateLimit);

  const secureQueryFn = async (): Promise<T> => {
    // Check rate limit before executing
    if (!checkRateLimit()) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { operation });
      throw new Error('Rate limit exceeded');
    }

    const startTime = performance.now();
    
    try {
      // Log query start
      logSecurityEvent('QUERY_START', { operation });
      
      const result = await queryFn();
      
      const duration = performance.now() - startTime;
      
      // Log successful query
      logSecurityEvent('QUERY_SUCCESS', { 
        operation, 
        duration: Math.round(duration) 
      });
      
      // Warn on slow queries
      if (duration > 2000) {
        console.warn(`Slow query detected: ${operation} took ${duration.toFixed(0)}ms`);
        toast({
          title: "Performance",
          description: "Consulta demorou mais que o esperado.",
          variant: "default",
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Log failed query
      logSecurityEvent('QUERY_ERROR', { 
        operation, 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Math.round(duration)
      });
      
      throw error;
    }
  };

  return useQuery({
    ...options,
    queryFn: secureQueryFn,
  });
};
