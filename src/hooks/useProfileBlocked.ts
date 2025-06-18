
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook para verificar se o usuário está bloqueado.
 * Atualiza automaticamente quando o status muda.
 */
export function useProfileBlocked() {
  const { user, loading } = useAuth();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["profile-blocked", user?.id],
    enabled: !!user,
    staleTime: 5 * 1000, // Cache por 5 segundos para detectar mudanças rapidamente
    refetchInterval: 10 * 1000, // Revalida a cada 10 segundos
    refetchOnWindowFocus: true, // Revalida quando a janela ganha foco
    queryFn: async () => {
      if (!user) return null;
      
      console.log("Verificando status de bloqueio para usuário:", user.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", user.id)
        .single();
        
      if (error) {
        console.error("Erro ao verificar status de bloqueio:", error);
        throw new Error(error.message);
      }
      
      console.log("Status de bloqueio obtido:", data);
      return data;
    }
  });

  // Função para forçar atualização (útil após mudanças admin)
  const refreshBlockedStatus = () => {
    console.log("Forçando atualização do status de bloqueio");
    refetch();
  };

  return {
    isBlocked: !!profile?.is_blocked,
    loading: loading || isLoading,
    refreshBlockedStatus,
  };
}
