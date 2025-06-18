import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface SecurityMetrics {
  failedAttempts: number;
  lastActivity: Date;
  sessionDuration: number;
  suspiciousActivity: boolean;
}

interface SecurityContextType {
  metrics: SecurityMetrics;
  logSecurityEvent: (event: string, data?: any) => void;
  checkSuspiciousActivity: () => boolean;
  enforceSessionLimits: () => void;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedAttempts: 0,
    lastActivity: new Date(),
    sessionDuration: 0,
    suspiciousActivity: false
  });

  const logSecurityEvent = async (event: string, data?: any) => {
    if (!user) return;

    try {
      const eventData = {
        user_id: user.id,
        action: event,
        table_name: data?.table || null,
        record_id: data?.recordId || null,
        old_values: data?.oldValues || null,
        new_values: data?.newValues || null,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('security_audit_log')
        .insert(eventData);

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      // In production, this should get real IP from headers
      return 'client-ip';
    } catch {
      return 'unknown';
    }
  };

  const checkSuspiciousActivity = (): boolean => {
    const now = new Date();
    const sessionTime = now.getTime() - metrics.lastActivity.getTime();
    
    // Check for suspicious patterns
    const isSuspicious = 
      metrics.failedAttempts > 3 ||
      sessionTime > 8 * 60 * 60 * 1000; // 8 hours

    if (isSuspicious && !metrics.suspiciousActivity) {
      setMetrics(prev => ({ ...prev, suspiciousActivity: true }));
      
      logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', {
        failedAttempts: metrics.failedAttempts,
        sessionDuration: sessionTime
      });

      toast({
        title: "Atividade suspeita detectada",
        description: "Por segurança, sua sessão será monitorada.",
        variant: "destructive",
      });
    }

    return isSuspicious;
  };

  const enforceSessionLimits = () => {
    const MAX_SESSION_TIME = 12 * 60 * 60 * 1000; // 12 hours
    const now = new Date();
    
    if (metrics.sessionDuration > MAX_SESSION_TIME) {
      toast({
        title: "Sessão expirada",
        description: "Por segurança, você precisa fazer login novamente.",
        variant: "destructive",
      });
      
      logSecurityEvent('SESSION_TIMEOUT');
      supabase.auth.signOut();
    }
  };

  // Activity tracking
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      setMetrics(prev => ({
        ...prev,
        lastActivity: new Date(),
        sessionDuration: Date.now() - (prev.lastActivity?.getTime() || Date.now())
      }));
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    // Session monitoring interval
    const sessionInterval = setInterval(() => {
      enforceSessionLimits();
      checkSuspiciousActivity();
    }, 60 * 1000); // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(sessionInterval);
    };
  }, [user]);

  // Log login/logout events
  useEffect(() => {
    if (user) {
      logSecurityEvent('USER_LOGIN');
    }

    return () => {
      if (user) {
        logSecurityEvent('USER_LOGOUT');
      }
    };
  }, [user]);

  const contextValue: SecurityContextType = {
    metrics,
    logSecurityEvent,
    checkSuspiciousActivity,
    enforceSessionLimits
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
