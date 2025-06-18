
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useProfileBlocked } from "@/hooks/useProfileBlocked";

/**
 * Componente que gerencia o acesso baseado no status de bloqueio do usuário.
 * - Se bloqueado: só pode acessar /dashboard e /suporte
 * - Se não bloqueado: acesso normal a todas as rotas
 */
export const BlockedOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isBlocked, loading } = useProfileBlocked();
  const location = useLocation();

  // Mostrar loading enquanto verifica o status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se o usuário está bloqueado
  if (isBlocked) {
    // Só permite acesso ao dashboard e suporte
    const allowedRoutes = ["/dashboard", "/suporte"];
    const isAllowedRoute = allowedRoutes.some(route => location.pathname.startsWith(route));
    
    if (!isAllowedRoute) {
      console.log("Usuário bloqueado tentando acessar:", location.pathname, "- Redirecionando para /dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Se não está bloqueado ou está acessando uma rota permitida para bloqueados, renderiza os filhos
  return <>{children}</>;
};
