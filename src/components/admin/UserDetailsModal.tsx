
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Store, 
  User, 
  Phone, 
  Package, 
  ChefHat, 
  Package2, 
  ShoppingCart, 
  DollarSign, 
  Repeat, 
  Users,
  Beaker
} from "lucide-react";

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

interface UserWithDetails {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  store_name?: string;
  salesCount: number;
  productsCount: number;
  ordersCount: number;
  is_blocked: boolean;
  phone?: string;
  address?: string;
  avatar_url?: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithDetails | null;
  userStats: UserStats | null;
  userProfile: UserWithDetails | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  userStats,
  userProfile
}) => {
  if (!user) return null;

  const stats = [
    {
      label: "Ingredientes",
      value: userStats?.totalIngredients || 0,
      icon: Beaker,
      color: "bg-blue-500"
    },
    {
      label: "Receitas",
      value: userStats?.totalRecipes || 0,
      icon: ChefHat,
      color: "bg-green-500"
    },
    {
      label: "Embalagens",
      value: userStats?.totalPackaging || 0,
      icon: Package2,
      color: "bg-purple-500"
    },
    {
      label: "Produtos",
      value: userStats?.totalProducts || 0,
      icon: Package,
      color: "bg-orange-500"
    },
    {
      label: "Pedidos",
      value: userStats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-red-500"
    },
    {
      label: "Vendas",
      value: userStats?.totalSales || 0,
      icon: DollarSign,
      color: "bg-yellow-500"
    },
    {
      label: "Revendas",
      value: userStats?.totalResales || 0,
      icon: Repeat,
      color: "bg-indigo-500"
    },
    {
      label: "Clientes",
      value: userStats?.totalCustomers || 0,
      icon: Users,
      color: "bg-pink-500"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome da Loja</label>
                  <p className="text-lg font-semibold">
                    {userProfile?.store_name || user.store_name || 'Não informado'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">ID do Usuário</label>
                  <p className="text-sm text-gray-600 font-mono">
                    {user.id}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {userProfile?.phone || user.phone || 'Não informado'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                  <p className="text-lg">
                    {new Date(user.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color} mb-2`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {user.is_blocked ? (
                  <Badge className="bg-red-600 text-white">
                    Bloqueado
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                )}
                <span className="text-sm text-gray-600">
                  {user.is_blocked ? "Usuário com acesso limitado" : "Usuário com acesso completo ao sistema"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
