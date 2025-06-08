
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Activity } from "lucide-react";
import { useSecurity } from "@/components/SecurityProvider";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface SecurityAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  action?: () => void;
  actionLabel?: string;
}

export const SecurityMonitor = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const { metrics, logSecurityEvent } = useSecurity();
  const { user } = useAuth();

  // Monitor security metrics and generate alerts
  useEffect(() => {
    if (!isMonitoring || !user) return;

    const checkSecurityMetrics = () => {
      const newAlerts: SecurityAlert[] = [];

      // Check for excessive failed attempts
      if (metrics.failedAttempts > 3) {
        newAlerts.push({
          id: 'failed-attempts',
          type: 'warning',
          message: `${metrics.failedAttempts} tentativas de login falharam recentemente`,
          timestamp: new Date(),
          action: () => {
            logSecurityEvent('SECURITY_ALERT_ACKNOWLEDGED', { type: 'failed_attempts' });
            dismissAlert('failed-attempts');
          },
          actionLabel: 'Reconhecer'
        });
      }

      // Check for long session duration
      if (metrics.sessionDuration > 8 * 60 * 60 * 1000) { // 8 hours
        newAlerts.push({
          id: 'long-session',
          type: 'info',
          message: 'Sessão ativa há mais de 8 horas. Considere fazer logout.',
          timestamp: new Date(),
          action: () => {
            window.location.href = '/logout';
          },
          actionLabel: 'Logout'
        });
      }

      // Check for suspicious activity
      if (metrics.suspiciousActivity) {
        newAlerts.push({
          id: 'suspicious-activity',
          type: 'critical',
          message: 'Atividade suspeita detectada. Sua sessão está sendo monitorada.',
          timestamp: new Date(),
          action: () => {
            logSecurityEvent('SECURITY_ALERT_ACKNOWLEDGED', { type: 'suspicious_activity' });
            dismissAlert('suspicious-activity');
          },
          actionLabel: 'Reconhecer'
        });
      }

      // Update alerts (only add new ones)
      setAlerts(prev => {
        const existingIds = prev.map(alert => alert.id);
        const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.includes(alert.id));
        return [...prev, ...uniqueNewAlerts];
      });
    };

    const interval = setInterval(checkSecurityMetrics, 30 * 1000); // Check every 30 seconds
    checkSecurityMetrics(); // Initial check

    return () => clearInterval(interval);
  }, [metrics, isMonitoring, user, logSecurityEvent]);

  // Check for unusual login times or patterns
  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const hour = now.getHours();
    
    // Alert for unusual login times (very late night/early morning)
    if ((hour >= 0 && hour <= 5) || hour >= 23) {
      const alert: SecurityAlert = {
        id: 'unusual-time',
        type: 'info',
        message: `Login em horário incomum (${now.toLocaleTimeString()})`,
        timestamp: now,
        action: () => dismissAlert('unusual-time'),
        actionLabel: 'OK'
      };
      
      setAlerts(prev => {
        if (!prev.find(a => a.id === 'unusual-time')) {
          return [...prev, alert];
        }
        return prev;
      });
    }
  }, [user]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const dismissAllAlerts = () => {
    logSecurityEvent('ALL_SECURITY_ALERTS_DISMISSED');
    setAlerts([]);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    logSecurityEvent(isMonitoring ? 'SECURITY_MONITORING_DISABLED' : 'SECURITY_MONITORING_ENABLED');
    
    toast({
      title: isMonitoring ? "Monitoramento desabilitado" : "Monitoramento habilitado",
      description: isMonitoring 
        ? "Alertas de segurança foram pausados" 
        : "Monitoramento de segurança ativo",
    });
  };

  if (!user || alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-80 space-y-2 max-h-96 overflow-y-auto">
      {/* Monitoring status */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-2 shadow-lg">
        <div className="flex items-center gap-2">
          <Activity className={`h-4 w-4 ${isMonitoring ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">
            Monitor: {isMonitoring ? 'Ativo' : 'Pausado'}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleMonitoring}
          className="h-8 w-8 p-0"
        >
          <Shield className="h-4 w-4" />
        </Button>
      </div>

      {/* Security alerts */}
      {alerts.map((alert) => (
        <Alert 
          key={alert.id} 
          variant={alert.type === 'critical' ? 'destructive' : 'default'}
          className="shadow-lg"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="pr-8">
            <div className="space-y-2">
              <p className="text-sm">{alert.message}</p>
              <p className="text-xs text-muted-foreground">
                {alert.timestamp.toLocaleTimeString()}
              </p>
              {alert.action && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={alert.action}
                  className="h-7 text-xs"
                >
                  {alert.actionLabel}
                </Button>
              )}
            </div>
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissAlert(alert.id)}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            ×
          </Button>
        </Alert>
      ))}

      {/* Dismiss all button */}
      {alerts.length > 1 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={dismissAllAlerts}
          className="w-full"
        >
          Dispensar todos os alertas
        </Button>
      )}
    </div>
  );
};
