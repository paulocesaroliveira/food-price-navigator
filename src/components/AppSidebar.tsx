
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Egg, 
  ChefHat, 
  Package, 
  ShoppingBag, 
  DollarSign,
  Settings,
  ChevronRight,
  HelpCircle,
  ShoppingCart,
  Users,
  Store,
  Calendar,
  TrendingUp,
  Receipt,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AppSidebar = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  // Buscar dados do perfil do usuário
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('store_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id
  });
  
  const storeName = profile?.store_name || "TastyHub";
  
  const menuGroups = [
    {
      label: "Dashboard",
      items: [
        { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      label: "Cadastros",
      items: [
        { path: "/ingredients", name: "Ingredientes", icon: Egg },
        { path: "/recipes", name: "Receitas", icon: ChefHat },
        { path: "/packaging", name: "Embalagens", icon: Package },
        { path: "/products", name: "Produtos", icon: ShoppingBag },
        { path: "/customers", name: "Clientes", icon: Users },
      ]
    },
    {
      label: "Vendas & Produção",
      items: [
        { path: "/sales", name: "Vendas", icon: TrendingUp },
        { path: "/orders", name: "Pedidos", icon: ShoppingCart },
        { path: "/resale", name: "Revenda", icon: UserCheck },
        { path: "/production-schedule", name: "Agenda de Produção", icon: Calendar },
      ]
    },
    {
      label: "Gestão",
      items: [
        { path: "/pricing", name: "Precificação", icon: DollarSign },
        { path: "/accounts-payable", name: "Contas a Pagar", icon: Receipt },
      ]
    },
    {
      label: "Relatórios",
      items: [
        { path: "/relatorios", name: "Relatórios", icon: BarChart3 },
      ]
    }
  ];

  return (
    <Sidebar className="bg-sidebar-background border-sidebar-border">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-5">
          <Store className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-poppins font-semibold tracking-tight text-sidebar-foreground">{storeName}</span>
            <span className="text-xs text-sidebar-foreground/70">
              {loading ? "Carregando..." : user?.email || "usuario@exemplo.com"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="px-3 py-4 space-y-6">
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                        <Link to={item.path} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-4 space-y-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/settings"}>
                <Link to="/settings" className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span className="text-sm font-medium">Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/help" className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Ajuda</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-4 py-4 mt-4 text-xs text-muted-foreground text-center">
            TastyHub v1.0.0
            <div className="mt-1">Sistema de Gestão</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
