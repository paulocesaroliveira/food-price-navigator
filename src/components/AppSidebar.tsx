
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
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

const AppSidebar = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
    { path: "/ingredients", name: "Ingredientes", icon: Egg },
    { path: "/recipes", name: "Receitas", icon: ChefHat },
    { path: "/packaging", name: "Embalagens", icon: Package },
    { path: "/products", name: "Produtos", icon: ShoppingBag },
    { path: "/pricing", name: "Precificação", icon: DollarSign },
    { path: "/production-schedule", name: "Agenda de Produção", icon: Calendar },
    { path: "/sales", name: "Vendas", icon: TrendingUp },
    { path: "/orders", name: "Pedidos", icon: ShoppingCart },
    { path: "/customers", name: "Clientes", icon: Users },
    { path: "/resale", name: "Revenda", icon: UserCheck },
    { path: "/accounts-payable", name: "Contas a Pagar", icon: Receipt },
    { path: "/relatorios", name: "Relatórios", icon: BarChart3 },
  ];

  return (
    <Sidebar className="bg-sidebar-background border-sidebar-border">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-5">
          <Store className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-poppins font-semibold tracking-tight text-sidebar-foreground">TastyHub</span>
            <span className="text-xs text-sidebar-foreground/70">
              {loading ? "Carregando..." : user?.email || "usuario@exemplo.com"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-link group",
                location.pathname === item.path && "active"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-sm font-medium">{item.name}</span>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
            </Link>
          ))}
        </nav>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-4 space-y-1">
          <Link to="/settings" className="sidebar-link group">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Configurações</span>
          </Link>
          <Link to="/help" className="sidebar-link group">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Ajuda</span>
          </Link>
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
