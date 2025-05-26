
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
  BarChart3,
  ChevronRight,
  HelpCircle,
  ShoppingCart,
  Users,
  Store,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  
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
  ];

  return (
    <Sidebar className="bg-food-cream dark:bg-food-carddark">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-5">
          <Store className="h-8 w-8 text-food-coral dark:text-food-coralDark" />
          <div className="flex flex-col">
            <span className="text-xl font-poppins font-semibold tracking-tight text-food-textlight dark:text-food-textdark">TastyHub</span>
            <span className="text-xs text-food-dark/70 dark:text-food-textdark/70">Gestão de Confeitaria</span>
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
              <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-white dark:text-food-dark' : 'text-food-coral dark:text-food-coralDark'}`} />
              <span className="flex-1 text-sm font-medium">{item.name}</span>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
            </Link>
          ))}
        </nav>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-4 space-y-1">
          <Link to="/settings" className="sidebar-link">
            <Settings className="h-5 w-5 text-food-coral dark:text-food-coralDark" />
            <span className="text-sm font-medium">Configurações</span>
          </Link>
          <Link to="/help" className="sidebar-link">
            <HelpCircle className="h-5 w-5 text-food-coral dark:text-food-coralDark" />
            <span className="text-sm font-medium">Ajuda</span>
          </Link>
          <div className="px-4 py-4 mt-4 text-xs text-food-dark/60 dark:text-food-textdark/60 text-center">
            TastyHub v1.0.0
            <div className="mt-1">Gestão de Confeitaria</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
