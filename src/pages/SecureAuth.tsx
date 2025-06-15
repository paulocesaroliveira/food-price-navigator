
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import SecureAuthForm from '@/components/security/SecureAuthForm';
import { useRateLimit } from '@/hooks/useRateLimit';

const SecureAuth: React.FC = () => {
  const { user, loading } = useSecureAuth();
  
  // Rate limiting for the auth page
  const { checkRateLimit } = useRateLimit({
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Muitas tentativas. Aguarde um momento."
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SecureAuthForm />;
};

export default SecureAuth;
