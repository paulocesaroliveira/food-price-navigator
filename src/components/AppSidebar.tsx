
import { 
  Home, 
  Package2, 
  Beaker, 
  ChefHat, 
  Package, 
  Calculator, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart3, 
  TrendingUp, 
  Repeat, 
  Settings, 
  RefreshCw,
  Store,
  HelpCircle,
  Shield,
  MessageSquare
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AvatarUpload from "@/components/ui/avatar-upload";
import { useProfileBlocked } from "@/hooks/useProfileBlocked";

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const { isBlocked } = useProfileBlocked();

  // Buscar dados do perfil do usuário
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('store_name, avatar_url')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  // Check if user has admin role using the new system
  const { data: isAdmin } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      return !!data;
    },
    enabled: !!user?.id
  });

  const storeName = profile?.store_name || 'TastyHub';

  // Menu items organizados por grupos - modificado para usuários bloqueados
  const menuGroups = [
    {
      label: "Dashboard",
      items: [
        {
          title: "Visão Geral",
          url: "/dashboard",
          icon: Home,
        },
        // Mostrar página Admin apenas para usuários com role admin
        ...(isAdmin ? [{
          title: "Admin",
          url: "/admin",
          icon: Shield,
        }] : [])
      ]
    },
    // Se o usuário está bloqueado, só mostrar Dashboard e Configurações
    ...(!isBlocked ? [
      {
        label: "Produção",
        items: [
          {
            title: "Ingredientes",
            url: "/ingredients",
            icon: Beaker,
          },
          {
            title: "Receitas",
            url: "/recipes",
            icon: ChefHat,
          },
          {
            title: "Embalagens",
            url: "/packaging",
            icon: Package2,
          },
          {
            title: "Produtos",
            url: "/products",
            icon: Package,
          },
          {
            title: "Precificação",
            url: "/pricing",
            icon: Calculator,
          }
        ]
      },
      {
        label: "Vendas & Pedidos",
        items: [
          {
            title: "Pedidos",
            url: "/orders",
            icon: ShoppingCart,
          },
          {
            title: "Vendas",
            url: "/sales",
            icon: DollarSign,
          },
          {
            title: "Revenda",
            url: "/resale",
            icon: Repeat,
          },
          {
            title: "Clientes",
            url: "/customers",
            icon: Users,
          }
        ]
      },
      {
        label: "Financeiro",
        items: [
          {
            title: "Contas a Pagar",
            url: "/accounts-payable",
            icon: CreditCard,
          },
          {
            title: "Fluxo de Caixa",
            url: "/fluxo-caixa",
            icon: TrendingUp,
          }
        ]
      },
      {
        label: "Relatórios & Ferramentas",
        items: [
          {
            title: "Relatórios",
            url: "/relatorios",
            icon: BarChart3,
          },
          {
            title: "Atualizar Custos",
            url: "/cost-update",
            icon: RefreshCw,
          }
        ]
      }
    ] : []),
    {
      label: "Configurações",
      items: [
        // Se bloqueado, só mostrar Ajuda e Suporte
        ...(!isBlocked ? [{
          title: "Configurações",
          url: "/settings",
          icon: Settings,
        }] : []),
        {
          title: "Ajuda",
          url: "/help",
          icon: HelpCircle,
        },
        {
          title: "Suporte",
          url: "/suporte",
          icon: MessageSquare,
        }
      ]
    }
  ]

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3 px-4 py-4">
          <AvatarUpload
            size="md"
            userName={user?.email || 'Usuário'}
            editable={false}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{storeName}</h1>
            <p className="text-xs text-gray-600 truncate" title={user?.email || ''}>
              {user?.email || 'Usuário não logado'}
            </p>
            {isAdmin && (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-600 font-medium">Admin</span>
              </div>
            )}
            {isBlocked && (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600 font-medium">Bloqueado</span>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-white">
        {menuGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="h-10 mx-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-lg"
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium truncate">{item.title}</span>
                        {item.title === "Admin" && (
                          <Shield className="h-3 w-3 text-red-400" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t bg-gray-50">
        <div className="px-4 py-3 text-xs text-gray-500">
          <p>&copy; 2024 TastyHub</p>
          <p className="text-[10px] text-gray-400 mt-1">Sistema de Gestão</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
