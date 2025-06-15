
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { removeUserAndLog } from "@/services/adminUserService";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  store_name: string;
  salesCount: number;
  productsCount: number;
  ordersCount: number;
  is_blocked?: boolean;
}

interface UserStats {
  totalIngredients: number;
  totalRecipes: number;
  totalPackaging: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  totalResales: number;
  totalCustomers: number;
}

interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
}

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { user: currentAdmin } = useAuth();
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log("Buscando usuários...");
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, store_name, created_at, is_blocked')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error("Erro ao buscar profiles:", profilesError);
        throw profilesError;
      }

      if (!profiles) return [];

      const { data: authUsersResponse } = await supabase.auth.admin.listUsers();
      const authUsers: AuthUser[] = authUsersResponse?.users || [];
      
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const authUser = authUsers.find((u: AuthUser) => u.id === profile.id);
          
          const [salesResult, productsResult, ordersResult] = await Promise.all([
            supabase.from('sales').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
            supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', profile.id)
          ]);

          return {
            id: profile.id,
            email: authUser?.email || 'N/A',
            created_at: profile.created_at,
            store_name: profile.store_name || 'Sem nome',
            salesCount: salesResult.count || 0,
            productsCount: productsResult.count || 0,
            ordersCount: ordersResult.count || 0,
            is_blocked: !!profile.is_blocked,
          };
        })
      );

      console.log("Usuários carregados:", usersWithStats);
      return usersWithStats;
    }
  });

  const handleViewDetails = async (user: UserData) => {
    setSelectedUser(user);
    
    const [
      ingredients, recipes, packaging, products, 
      orders, sales, resales, customers, profile
    ] = await Promise.all([
      supabase.from('ingredients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('packaging').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('sales').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('resale_transactions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('profiles').select('store_name, phone').eq('id', user.id).single()
    ]);

    setUserStats({
      totalIngredients: ingredients.count || 0,
      totalRecipes: recipes.count || 0,
      totalPackaging: packaging.count || 0,
      totalProducts: products.count || 0,
      totalOrders: orders.count || 0,
      totalSales: sales.count || 0,
      totalResales: resales.count || 0,
      totalCustomers: customers.count || 0,
    });

    setUserProfile(profile.data);
    setIsModalOpen(true);
  };

  const handleBlockUnblock = async (user: UserData, block: boolean) => {
    const action = block ? "BLOQUEAR" : "DESBLOQUEAR";
    const message = block 
      ? `Deseja BLOQUEAR o usuário "${user.store_name}"? Ele só poderá acessar o dashboard.`
      : `Deseja DESBLOQUEAR o usuário "${user.store_name}" e restaurar acesso normal?`;

    if (!window.confirm(message)) return;

    setIsUpdating(user.id);
    
    try {
      console.log(`Tentando ${action} usuário:`, user.id, "Novo status de bloqueio:", block);
      
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_blocked: block })
        .eq("id", user.id)
        .select('is_blocked');
        
      if (error) {
        console.error("Erro ao atualizar bloqueio:", error);
        toast({ 
          title: "Erro ao atualizar bloqueio", 
          description: error.message, 
          variant: "destructive" 
        });
        return;
      }

      console.log("Resultado da atualização:", data);
      
      const successMessage = block ? "Usuário bloqueado com sucesso!" : "Usuário desbloqueado com sucesso!";
      toast({ 
        title: successMessage,
        description: block 
          ? "O usuário só poderá acessar o dashboard"
          : "O usuário tem acesso completo ao sistema"
      });
      
      console.log("Forçando atualização da lista...");
      await refetch();
      
    } catch (err: any) {
      console.error("Erro inesperado ao bloquear/desbloquear:", err);
      toast({ 
        title: "Erro inesperado", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePermanentDelete = async (user: UserData) => {
    if (!window.confirm(`Tem certeza que deseja remover permanentemente o usuário "${user.store_name}" (${user.email})? Esta ação não pode ser desfeita.`)) return;
    
    setIsUpdating(user.id);
    try {
      await removeUserAndLog(user.id, currentAdmin?.id || "", "Remoção pelo painel Admin");
      toast({ title: "Usuário removido permanentemente!" });
      await refetch();
    } catch (err: any) {
      toast({ title: "Erro ao remover usuário", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.store_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
    handleViewDetails,
    handleBlockUnblock,
    handlePermanentDelete
  };
};
