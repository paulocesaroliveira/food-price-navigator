
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SessionMetrics {
  startTime: Date;
  lastActivity: Date;
  renewalCount: number;
  warningShown: boolean;
}

export const useSecureSession = () => {
  const [metrics, setMetrics] = useState<SessionMetrics>({
    startTime: new Date(),
    lastActivity: new Date(),
    renewalCount: 0,
    warningShown: false
  });

  // Session configuration
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
  const MAX_RENEWALS = 10; // Maximum automatic renewals

  const updateActivity = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      lastActivity: new Date(),
      warningShown: false
    }));
  }, []);

  const renewSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session renewal failed:', error);
        toast({
          title: "Erro de sessão",
          description: "Não foi possível renovar a sessão. Faça login novamente.",
          variant: "destructive",
        });
        return false;
      }

      if (data.session) {
        setMetrics(prev => ({
          ...prev,
          renewalCount: prev.renewalCount + 1,
          lastActivity: new Date(),
          warningShown: false
        }));
        
        console.log('Session renewed successfully');
        return true;
      }
    } catch (error) {
      console.error('Session renewal error:', error);
      return false;
    }
    
    return false;
  }, []);

  const checkSessionStatus = useCallback(() => {
    const now = new Date();
    const timeSinceActivity = now.getTime() - metrics.lastActivity.getTime();
    const timeUntilExpiry = SESSION_TIMEOUT - timeSinceActivity;

    // Session expired
    if (timeSinceActivity >= SESSION_TIMEOUT) {
      toast({
        title: "Sessão expirada",
        description: "Por segurança, você foi desconectado automaticamente.",
        variant: "destructive",
      });
      
      supabase.auth.signOut();
      return;
    }

    // Session expiring soon
    if (timeUntilExpiry <= WARNING_TIME && !metrics.warningShown) {
      const minutesLeft = Math.ceil(timeUntilExpiry / (60 * 1000));
      
      setMetrics(prev => ({ ...prev, warningShown: true }));
      
      toast({
        title: "Sessão expirando",
        description: `Sua sessão expirará em ${minutesLeft} minutos. Clique em qualquer lugar para renovar.`,
        duration: 10000,
      });
    }

    // Auto-renewal if too many renewals haven't happened
    if (timeUntilExpiry <= WARNING_TIME && metrics.renewalCount < MAX_RENEWALS) {
      renewSession();
    }
  }, [metrics, renewSession]);

  // Activity listeners
  useEffect(() => {
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'focus'
    ];
    
    const handleActivity = () => updateActivity();

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);

  // Session monitoring
  useEffect(() => {
    const interval = setInterval(checkSessionStatus, 60 * 1000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkSessionStatus]);

  // Visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateActivity]);

  return {
    sessionDuration: Date.now() - metrics.startTime.getTime(),
    lastActivity: metrics.lastActivity,
    renewalCount: metrics.renewalCount,
    renewSession,
    updateActivity,
  };
};
