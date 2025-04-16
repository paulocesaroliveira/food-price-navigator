
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
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", name: "Dashboard", icon: LayoutDashboard },
    { path: "/ingredients", name: "Ingredientes", icon: Egg },
    { path: "/recipes", name: "Receitas", icon: ChefHat },
    { path: "/packaging", name: "Embalagens", icon: Package },
    { path: "/products", name: "Produtos", icon: ShoppingBag },
    { path: "/pricing", name: "Precificação", icon: DollarSign },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-5">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-display font-semibold tracking-tight">FoodPrice</span>
            <span className="text-xs text-sidebar-foreground/70">Gestão de Custos</span>
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
              <span className="flex-1">{item.name}</span>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
            </Link>
          ))}
        </nav>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-4 space-y-1">
          <Link to="/settings" className="sidebar-link">
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </Link>
          <Link to="/help" className="sidebar-link">
            <HelpCircle className="h-5 w-5" />
            <span>Ajuda</span>
          </Link>
          <div className="px-4 py-4 mt-4 text-xs text-sidebar-foreground/60 text-center">
            FoodPrice v1.0.0
            <div className="mt-1">Gerenciamento de Custos</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
