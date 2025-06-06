
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Shield, User } from "lucide-react";
import UserDetailsModal from "./UserDetailsModal";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  store_name: string;
  salesCount: number;
  productsCount: number;
  ordersCount: number;
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

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Buscar usuários com informações básicas
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, store_name, created_at')
        .order('created_at', { ascending: false });

      if (!profiles) return [];

      // Buscar emails dos usuários (apenas admins podem ver)
      const userIds = profiles.map(p => p.id);
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      // Combinar dados e calcular estatísticas básicas
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const authUser = authUsers?.users.find(u => u.id === profile.id);
          
          // Contar vendas, produtos e pedidos básicos
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
          };
        })
      );

      return usersWithStats;
    }
  });

  const handleViewDetails = async (user: UserData) => {
    setSelectedUser(user);
    
    // Buscar estatísticas detalhadas do usuário
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

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.store_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {filteredUsers.length} usuários
            </Badge>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-center">Vendas</TableHead>
                  <TableHead className="text-center">Produtos</TableHead>
                  <TableHead className="text-center">Pedidos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.store_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{user.salesCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{user.productsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{user.ordersCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        userStats={userStats}
        userProfile={userProfile}
      />
    </div>
  );
};

export default UserManagement;
