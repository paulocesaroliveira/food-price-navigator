
import React, { useEffect, useState } from 'react';
import { useSecurity } from '@/components/SecurityProvider';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

export const SecurityMonitor: React.FC = () => {
  const { metrics, logSecurityEvent } = useSecurity();
  const { session } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [lastActivityCheck, setLastActivityCheck] = useState(Date.now());

  // Monitor session health
  useEffect(() => {
    if (!session) return;

    const checkSessionHealth = () => {
      const now = Date.now();
      const sessionExpiry = new Date(session.expires_at || 0).getTime();
      const timeUntilExpiry = sessionExpiry - now;
      
      // Warn 5 minutes before expiry
      if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
        const alert: SecurityAlert = {
          id: `session-expiry-${now}`,
          type: 'warning',
          message: `Sua sessão expirará em ${Math.ceil(timeUntilExpiry / 60000)} minutos.`,
          timestamp: new Date(),
          dismissed: false
        };
        
        setAlerts(prev => [...prev.filter(a => !a.id.startsWith('session-expiry')), alert]);
        
        toast({
          title: "Sessão expirando",
          description: alert.message,
          variant: "default",
        });
      }
    };

    // Check session health every minute
    const interval = setInterval(checkSessionHealth, 60 * 1000);
    checkSessionHealth(); // Initial check

    return () => clearInterval(interval);
  }, [session]);

  // Monitor suspicious activity patterns
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - metrics.lastActivity.getTime();
    
    // Check for unusual inactivity followed by sudden activity
    if (lastActivityCheck > 0 && now - lastActivityCheck > 30 * 60 * 1000) { // 30 min gap
      if (timeSinceLastActivity < 5000) { // But recent activity within 5 seconds
        const alert: SecurityAlert = {
          id: `activity-gap-${now}`,
          type: 'warning',
          message: 'Padrão de atividade incomum detectado.',
          timestamp: new Date(),
          dismissed: false
        };
        
        setAlerts(prev => [...prev, alert]);
        logSecurityEvent('UNUSUAL_ACTIVITY_PATTERN', {
          inactivityDuration: now - lastActivityCheck,
          recentActivity: timeSinceLastActivity
        });
      }
    }
    
    setLastActivityCheck(now);
  }, [metrics.lastActivity, lastActivityCheck, logSecurityEvent]);

  // Monitor failed attempts
  useEffect(() => {
    if (metrics.failedAttempts > 2) {
      const alert: SecurityAlert = {
        id: `failed-attempts-${metrics.failedAttempts}`,
        type: 'error',
        message: `${metrics.failedAttempts} tentativas de acesso falharam recentemente.`,
        timestamp: new Date(),
        dismissed: false
      };
      
      setAlerts(prev => {
        const existing = prev.find(a => a.id.startsWith('failed-attempts'));
        if (existing) {
          return prev.map(a => a.id.startsWith('failed-attempts') ? alert : a);
        }
        return [...prev, alert];
      });
    }
  }, [metrics.failedAttempts]);

  // Auto-dismiss alerts after 5 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts(prev => prev.filter(alert => 
        Date.now() - alert.timestamp.getTime() < 5 * 60 * 1000
      ));
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [alerts]);

  // Component doesn't render anything visible but operates in background
  return null;
};

export default SecurityMonitor;
