import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  failedAttempts: number;
  accountLocked: boolean;
  lockoutExpiry: Date | null;
}

interface LoginAttempt {
  email: string;
  timestamp: Date;
  successful: boolean;
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    session: null,
    loading: true,
    failedAttempts: 0,
    accountLocked: false,
    lockoutExpiry: null,
  });

  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  const getFailedAttempts = useCallback((email: string): number => {
    const attempts = localStorage.getItem(`auth_attempts_${email}`);
    if (!attempts) return 0;
    
    const parsed = JSON.parse(attempts) as LoginAttempt[];
    const recentAttempts = parsed.filter(
      attempt => 
        !attempt.successful && 
        Date.now() - new Date(attempt.timestamp).getTime() < LOCKOUT_DURATION
    );
    
    return recentAttempts.length;
  }, []);

  const recordLoginAttempt = useCallback((email: string, successful: boolean) => {
    const storageKey = `auth_attempts_${email}`;
    const existing = localStorage.getItem(storageKey);
    const attempts: LoginAttempt[] = existing ? JSON.parse(existing) : [];
    
    attempts.push({
      email,
      timestamp: new Date(),
      successful
    });
    
    // Keep only attempts from the last 24 hours
    const filtered = attempts.filter(
      attempt => Date.now() - new Date(attempt.timestamp).getTime() < 24 * 60 * 60 * 1000
    );
    
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    
    if (successful) {
      // Clear failed attempts on successful login
      localStorage.removeItem(storageKey);
    }
  }, []);

  const isAccountLocked = useCallback((email: string): boolean => {
    const failedCount = getFailedAttempts(email);
    return failedCount >= MAX_FAILED_ATTEMPTS;
  }, [getFailedAttempts]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    // Check if account is locked
    if (isAccountLocked(email)) {
      toast({
        title: "Conta bloqueada",
        description: `Muitas tentativas falharam. Tente novamente em ${Math.ceil(LOCKOUT_DURATION / (60 * 1000))} minutos.`,
        variant: "destructive",
      });
      return { data: null, error: { message: "Account locked" } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        recordLoginAttempt(email, false);
        
        // Track failed login in audit log
        await supabase.rpc('track_failed_login', { user_email: email });
        
        const attempts = getFailedAttempts(email);
        if (attempts >= MAX_FAILED_ATTEMPTS - 1) {
          toast({
            title: "Aviso de segurança",
            description: "Próxima tentativa bloqueará a conta temporariamente.",
            variant: "destructive",
          });
        }
        
        return { data: null, error };
      }

      recordLoginAttempt(email, true);
      return { data, error: null };
    } catch (error) {
      recordLoginAttempt(email, false);
      throw error;
    }
  }, [isAccountLocked, recordLoginAttempt, getFailedAttempts]);

  const signUp = useCallback(async (email: string, password: string, options?: any) => {
    // Validate password strength
    const isStrong = await supabase.rpc('validate_password_strength', { password });
    
    if (!isStrong) {
      return {
        data: null,
        error: { message: "Password does not meet security requirements" }
      };
    }

    return await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options,
    });
  }, []);

  const signOut = useCallback(async () => {
    return await supabase.auth.signOut();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }
      return !!data.session;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
        }));
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...authState,
    signInWithPassword,
    signUp,
    signOut,
    refreshSession,
    getFailedAttempts,
    isAccountLocked,
  };
};
