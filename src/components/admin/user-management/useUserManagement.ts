
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserWithDetails {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  store_name?: string | null;
  salesCount: number;
  productsCount: number;
  ordersCount: number;
  is_blocked: boolean;
  phone?: string | null;
  address?: string | null;
  avatar_url?: string | null;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  lastActivity: string;
  totalIngredients: number;
  totalRecipes: number;
  totalPackaging: number;
  totalProducts: number;
  totalSales: number;
  totalResales: number;
  totalCustomers: number;
}

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<UserWithDetails[]> => {
      try {
        console.log("Buscando usuários para admin...");
        
        // Verificar se o usuário atual é admin
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          console.log("Usuário não autenticado");
          return [];
        }

        // Verificar se o usuário é admin
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .single();

        if (!userRole || userRole.role !== 'admin') {
          console.log("Usuário não é admin");
          return [];
        }

        // Buscar todos os perfis (agora com acesso admin)
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (profilesError) {
          console.error("Erro ao buscar perfis:", profilesError);
          throw profilesError;
        }

        console.log("Perfis encontrados:", profilesData?.length || 0);

        if (!profilesData || profilesData.length === 0) {
          return [];
        }

        const usersWithDetails: UserWithDetails[] = [];

        for (const profile of profilesData) {
          try {
            // Para admin, buscar dados de autenticação do perfil e estatísticas
            const userEmail = profile.id; // Usar o ID como placeholder, pois não temos acesso direto ao email

            // Buscar contadores de vendas, produtos e pedidos
            const [salesResult, productsResult, ordersResult] = await Promise.allSettled([
              supabase.from("sales").select("id", { count: 'exact' }).eq("user_id", profile.id),
              supabase.from("products").select("id", { count: 'exact' }).eq("user_id", profile.id),
              supabase.from("orders").select("id", { count: 'exact' }).eq("user_id", profile.id)
            ]);

            const userWithDetails: UserWithDetails = {
              id: profile.id,
              email: `Usuário ${profile.store_name || profile.id.substring(0, 8)}`, // Mostrar nome da loja ou parte do ID
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              store_name: profile.store_name,
              phone: profile.phone,
              address: profile.address,
              avatar_url: profile.avatar_url,
              is_blocked: profile.is_blocked || false,
              salesCount: salesResult.status === 'fulfilled' ? (salesResult.value.count || 0) : 0,
              productsCount: productsResult.status === 'fulfilled' ? (productsResult.value.count || 0) : 0,
              ordersCount: ordersResult.status === 'fulfilled' ? (ordersResult.value.count || 0) : 0,
            };

            usersWithDetails.push(userWithDetails);

          } catch (error) {
            console.error(`Erro ao processar usuário ${profile.id}:`, error);
            continue;
          }
        }

        console.log("Usuários processados com sucesso:", usersWithDetails.length);
        return usersWithDetails;

      } catch (error) {
        console.error("Erro geral na query de usuários:", error);
        toast({
          title: "Erro ao carregar usuários",
          description: "Verifique se você tem permissões de administrador",
          variant: "destructive"
        });
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const blockedCount = useMemo(() => 
    users.filter(user => user.is_blocked).length
  , [users]);

  const activeCount = useMemo(() => 
    users.filter(user => !user.is_blocked).length
  , [users]);

  const blockUnblockMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      console.log(`${isBlocked ? 'Desbloqueando' : 'Bloqueando'} usuário:`, userId);
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_blocked: !isBlocked,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) {
        console.error("Erro ao atualizar status do usuário:", error);
        throw error;
      }
      
      console.log("Status do usuário atualizado com sucesso");
    },
    onSuccess: (_, { isBlocked }) => {
      toast({
        title: isBlocked ? "✅ Usuário desbloqueado com sucesso!" : "🚫 Usuário bloqueado com sucesso!",
        description: isBlocked 
          ? "O usuário agora tem acesso completo ao sistema." 
          : "O usuário só poderá acessar Dashboard e Suporte."
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      console.error("Erro na mutation de bloqueio:", error);
      toast({
        title: "❌ Erro ao atualizar usuário",
        description: error.message || "Verifique suas permissões de administrador",
        variant: "destructive"
      });
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        await supabase
          .from("user_removal_log")
          .insert([{
            user_id: userId,
            removed_by: currentUser.id,
            reason: "Remoção administrativa"
          }]);
      }

      // Remover perfil (o usuário auth será removido por cascata se configurado)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "🗑️ Usuário removido permanentemente",
        description: "O usuário e todos os seus dados foram removidos do sistema."
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao remover usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleViewDetails = async (user: UserWithDetails) => {
    setSelectedUser(user);
    setUserProfile(user);
    
    try {
      const [orders, sales, ingredients, recipes, packaging, products, customers] = await Promise.all([
        supabase.from("orders").select("total_amount, created_at").eq("user_id", user.id),
        supabase.from("sales").select("total_amount, created_at").eq("user_id", user.id),
        supabase.from("ingredients").select("id").eq("user_id", user.id),
        supabase.from("recipes").select("id").eq("user_id", user.id),
        supabase.from("packaging").select("id").eq("user_id", user.id),
        supabase.from("products").select("id").eq("user_id", user.id),
        supabase.from("customers").select("id").eq("user_id", user.id)
      ]);

      const totalOrders = orders?.data?.length || 0;
      const totalSales = sales?.data?.length || 0;
      const totalSpent = (orders?.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0) +
                        (sales?.data?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0);

      const allActivities = [
        ...(orders?.data?.map(o => o.created_at) || []),
        ...(sales?.data?.map(s => s.created_at) || [])
      ];
      const lastActivity = allActivities.length > 0 
        ? Math.max(...allActivities.map(date => new Date(date).getTime()))
        : null;

      setUserStats({
        totalOrders,
        totalSpent,
        lastActivity: lastActivity ? new Date(lastActivity).toLocaleDateString('pt-BR') : 'Nunca',
        totalIngredients: ingredients?.data?.length || 0,
        totalRecipes: recipes?.data?.length || 0,
        totalPackaging: packaging?.data?.length || 0,
        totalProducts: products?.data?.length || 0,
        totalSales,
        totalResales: 0,
        totalCustomers: customers?.data?.length || 0
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas do usuário:", error);
      setUserStats({
        totalOrders: 0,
        totalSpent: 0,
        lastActivity: 'Erro ao carregar',
        totalIngredients: 0,
        totalRecipes: 0,
        totalPackaging: 0,
        totalProducts: 0,
        totalSales: 0,
        totalResales: 0,
        totalCustomers: 0
      });
    }

    setIsModalOpen(true);
  };

  const handleBlockUnblock = (user: UserWithDetails) => {
    const action = user.is_blocked ? "desbloquear" : "bloquear";
    const confirmed = window.confirm(
      `Tem certeza que deseja ${action} o usuário "${user.store_name || user.email}"?\n\n` +
      (user.is_blocked 
        ? "O usuário terá acesso completo ao sistema novamente." 
        : "O usuário só poderá acessar Dashboard e Suporte.")
    );

    if (confirmed) {
      setIsUpdating(true);
      blockUnblockMutation.mutate(
        { userId: user.id, isBlocked: user.is_blocked },
        {
          onSettled: () => setIsUpdating(false)
        }
      );
    }
  };

  const handlePermanentDelete = (user: UserWithDetails) => {
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n` +
      `Deseja DELETAR PERMANENTEMENTE o usuário "${user.store_name || user.email}"?\n\n` +
      `Todos os dados do usuário serão removidos do sistema, incluindo:\n` +
      `• Perfil e informações pessoais\n` +
      `• Pedidos e vendas\n` +
      `• Histórico de atividades\n` +
      `• Todos os dados relacionados\n\n` +
      `Digite "DELETAR" para confirmar:`
    );

    if (confirmed) {
      const confirmation = prompt(
        `Para confirmar a exclusão permanente, digite: DELETAR`
      );

      if (confirmation === "DELETAR") {
        setIsUpdating(true);
        permanentDeleteMutation.mutate(user.id, {
          onSettled: () => setIsUpdating(false)
        });
      } else {
        toast({
          title: "❌ Exclusão cancelada",
          description: "Texto de confirmação incorreto."
        });
      }
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedUser,
    userStats,
    userProfile,
    isModalOpen,
    setIsModalOpen,
    isUpdating,
    users: filteredUsers,
    isLoading,
    blockedCount,
    activeCount,
    handleViewDetails,
    handleBlockUnblock,
    handlePermanentDelete
  };
};
