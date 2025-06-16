import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  is_blocked: boolean;
  avatar_url?: string;
  store_name?: string;
  phone?: string;
  address?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface UserWithDetails extends UserProfile {
  user_roles?: UserRole[];
  email: string;
  salesCount: number;
  productsCount: number;
  ordersCount: number;
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

  // Query para buscar usuários
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Buscar emails dos usuários do auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Combinar dados e adicionar contadores
      const usersWithEmails = await Promise.all(profiles.map(async (profile) => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        
        // Buscar estatísticas para cada usuário
        const [salesData, productsData, ordersData] = await Promise.all([
          supabase.from("sales").select("id").eq("user_id", profile.id),
          supabase.from("products").select("id").eq("user_id", profile.id),
          supabase.from("orders").select("id").eq("user_id", profile.id)
        ]);

        return {
          ...profile,
          email: authUser?.email || 'N/A',
          salesCount: salesData.data?.length || 0,
          productsCount: productsData.data?.length || 0,
          ordersCount: ordersData.data?.length || 0,
          user_roles: [] // Initialize as empty array to avoid query errors
        } as UserWithDetails;
      }));

      return usersWithEmails;
    }
  });

  // Filtrar usuários com base no termo de pesquisa
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );
  }, [users, searchTerm]);

  // Contar usuários bloqueados e ativos
  const blockedCount = useMemo(() => 
    users.filter(user => user.is_blocked).length
  , [users]);

  const activeCount = useMemo(() => 
    users.filter(user => !user.is_blocked).length
  , [users]);

  // Mutation para bloquear/desbloquear usuário
  const blockUnblockMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_blocked: !isBlocked,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;
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
      toast({
        title: "❌ Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar usuário permanentemente
  const permanentDeleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Primeiro, registrar no log de remoção
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

      // Deletar usuário do auth (isso irá cascatear para profiles devido ao ON DELETE CASCADE)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
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
    
    // Buscar estatísticas detalhadas do usuário
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

      // Última atividade (mais recente entre orders e sales)
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
        totalResales: 0, // Implementar quando houver tabela de revendas
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
