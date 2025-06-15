
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFeatureTracking = () => {
  const location = useLocation();
  const { user } = useAuth();

  const trackFeatureUsage = async (featureName: string, action: string = 'view') => {
    if (!user) return;
    
    try {
      await supabase
        .from('feature_usage_log')
        .insert([{
          user_id: user.id,
          feature_name: featureName,
          page_path: location.pathname,
          action
        }]);
    } catch (error) {
      // Silently fail to avoid breaking the app
      console.debug('Feature tracking error:', error);
    }
  };

  const trackError = async (error: Error) => {
    if (!user) return;
    
    try {
      await supabase
        .from('error_logs')
        .insert([{
          user_id: user.id,
          error_message: error.message,
          error_stack: error.stack,
          page_path: location.pathname,
          user_agent: navigator.userAgent
        }]);
    } catch (err) {
      console.debug('Error logging failed:', err);
    }
  };

  // Track page views automatically
  useEffect(() => {
    if (user && location.pathname !== '/') {
      const pageName = location.pathname.split('/')[1] || 'dashboard';
      trackFeatureUsage(pageName, 'page_view');
    }
  }, [location.pathname, user]);

  return {
    trackFeatureUsage,
    trackError
  };
};
