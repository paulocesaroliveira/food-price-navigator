
import React from 'react';

interface RateLimiterProps {
  children: React.ReactNode;
}

export const RateLimiter: React.FC<RateLimiterProps> = ({ children }) => {
  // This component is just a wrapper - no logic needed here
  // Rate limiting logic should be handled in the components that need it
  return <>{children}</>;
};
