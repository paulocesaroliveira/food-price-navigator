
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Log failed login attempt for security monitoring
        try {
          await supabase.rpc('track_failed_login', { user_email: email });
        } catch (logError) {
          console.warn('Failed to log security event:', logError);
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, options?: any) => {
    const redirectUrl = `${window.location.origin}/app`;
    
    return await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        ...options
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
    }
    return { error };
  }, []);

  // Initialize auth state with proper session handling
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Listen for auth changes with simplified session validation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Secure auth state changed:', event);
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });

        // Only validate session expiry if we have a session and it's a sign-in event
        if (session && event === 'SIGNED_IN') {
          const now = new Date().getTime();
          const sessionExpiry = new Date(session.expires_at || 0).getTime();
          
          // Give a 5-minute buffer to account for clock differences
          const bufferTime = 5 * 60 * 1000;
          
          if (sessionExpiry <= (now - bufferTime)) {
            console.warn('Received expired session, signing out');
            await supabase.auth.signOut();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...authState,
    signInWithPassword,
    signUp,
    signOut,
  };
};
