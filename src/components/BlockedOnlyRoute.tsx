
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useProfileBlocked } from "@/hooks/useProfileBlocked";

/**
 * Componente que só permite acesso ao Dashboard se o usuário estiver bloqueado,
 * e redireciona para dashboard quaisquer outras rotas tentadas.
 */
export const BlockedOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isBlocked, loading } = useProfileBlocked();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;

  // Se bloqueado, só pode acessar /dashboard
  if (isBlocked && location.pathname !== "/dashboard") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
