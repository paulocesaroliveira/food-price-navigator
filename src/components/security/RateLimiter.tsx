
import React from 'react';

interface RateLimiterProps {
  children: React.ReactNode;
}

// Componente wrapper simples sem lógica de rate limiting
// A lógica de rate limiting é implementada diretamente nos componentes que precisam
export const RateLimiter: React.FC<RateLimiterProps> = ({ children }) => {
  return <>{children}</>;
};
