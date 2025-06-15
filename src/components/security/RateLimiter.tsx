
import React from 'react';

interface RateLimiterProps {
  children: React.ReactNode;
}

// Componente wrapper simples - não utiliza hooks
export const RateLimiter: React.FC<RateLimiterProps> = ({ children }) => {
  return <>{children}</>;
};
