import React from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfileBlocked } from "@/hooks/useProfileBlocked";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas administrativas.
 * Só permite acesso se o usuário for admin e não estiver bloqueado.
 */
export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isBlocked, loading: blockedLoading } = useProfileBlocked();

  // Mostrar loading enquanto verifica permissões
  if (roleLoading || blockedLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Usuários bloqueados não podem acessar admin
  if (isBlocked) {
    console.log("Usuário bloqueado tentando acessar admin - Redirecionando para /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Só admins podem acessar
  if (!isAdmin) {
    console.log("Usuário não-admin tentando acessar admin - Redirecionando para /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
