
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook para saber se o usuário está bloqueado.
 */
export function useProfileBlocked() {
  const { user, loading } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-blocked", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", user.id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
  });

  return {
    isBlocked: !!profile?.is_blocked,
    loading: loading || isLoading,
  };
}
