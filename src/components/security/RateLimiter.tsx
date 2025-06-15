
import React from 'react';

interface RateLimiterProps {
  children: React.ReactNode;
}

export const RateLimiter: React.FC<RateLimiterProps> = ({ children }) => {
  // Este componente é apenas um wrapper simples - sem lógica de rate limiting
  // A lógica de rate limiting é tratada pelos hooks específicos nos componentes que precisam
  return <>{children}</>;
};
