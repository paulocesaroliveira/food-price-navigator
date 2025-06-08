
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSecurity } from '@/components/SecurityProvider';
import { toast } from '@/hooks/use-toast';

interface EnhancedAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSessionExpired: boolean;
  lastActivity: Date | null;
}

export const useEnhancedAuth = () => {
  const [authState, setAuthState] = useState<EnhancedAuthState>({
    user: null,
    session: null,
    loading: true,
    isSessionExpired: false,
    lastActivity: null,
  });

  const { logSecurityEvent } = useSecurity();

  // Session timeout configuration (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

  const updateLastActivity = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      lastActivity: new Date()
    }));
  }, []);

  const checkSessionExpiry = useCallback(() => {
    const { lastActivity, session } = authState;
    
    if (!session || !lastActivity) return;

    const timeSinceLastActivity = Date.now() - lastActivity.getTime();
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      // Session expired
      setAuthState(prev => ({ ...prev, isSessionExpired: true }));
      logSecurityEvent('SESSION_EXPIRED');
      
      toast({
        title: "Sessão expirada",
        description: "Por segurança, você foi desconectado automaticamente.",
        variant: "destructive",
      });
      
      supabase.auth.signOut();
    } else if (timeSinceLastActivity > (SESSION_TIMEOUT - WARNING_TIME)) {
      // Session expiring soon
      const remainingMinutes = Math.ceil((SESSION_TIMEOUT - timeSinceLastActivity) / (1000 * 60));
      
      toast({
        title: "Sessão expirando",
        description: `Sua sessão expirará em ${remainingMinutes} minutos. Mova o mouse para renovar.`,
      });
    }
  }, [authState, logSecurityEvent]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Failed to refresh session:', error);
        setAuthState(prev => ({ ...prev, isSessionExpired: true }));
        return false;
      }

      if (data.session) {
        setAuthState(prev => ({
          ...prev,
          session: data.session,
          user: data.session.user,
          isSessionExpired: false,
          lastActivity: new Date()
        }));
        
        logSecurityEvent('SESSION_REFRESHED');
        return true;
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
    
    return false;
  }, [logSecurityEvent]);

  // Monitor user activity
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [updateLastActivity]);

  // Session monitoring
  useEffect(() => {
    const sessionInterval = setInterval(checkSessionExpiry, 60 * 1000); // Check every minute
    
    return () => clearInterval(sessionInterval);
  }, [checkSessionExpiry]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          isSessionExpired: false,
          lastActivity: session ? new Date() : null,
        });

        if (session) {
          logSecurityEvent('SESSION_RESTORED');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          isSessionExpired: false,
          lastActivity: session ? new Date() : null,
        });

        // Log security events
        switch (event) {
          case 'SIGNED_IN':
            logSecurityEvent('USER_SIGNED_IN');
            break;
          case 'SIGNED_OUT':
            logSecurityEvent('USER_SIGNED_OUT');
            break;
          case 'TOKEN_REFRESHED':
            logSecurityEvent('TOKEN_REFRESHED');
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [logSecurityEvent]);

  return {
    ...authState,
    refreshSession,
    updateLastActivity,
  };
};
