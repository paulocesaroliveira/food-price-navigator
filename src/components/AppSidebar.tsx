
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
  UtensilsCrossed, 
  Package, 
  ShoppingBag, 
  DollarSign,
  Settings,
  BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", name: "Dashboard", icon: LayoutDashboard },
    { path: "/ingredients", name: "Ingredientes", icon: Egg },
    { path: "/recipes", name: "Receitas", icon: UtensilsCrossed },
    { path: "/packaging", name: "Embalagens", icon: Package },
    { path: "/products", name: "Produtos", icon: ShoppingBag },
    { path: "/pricing", name: "Precificação", icon: DollarSign },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3">
          <BarChart2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold">FoodPrice</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <nav className="space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-link",
                location.pathname === item.path && "active"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-2">
          <Link to="/settings" className="sidebar-link">
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
