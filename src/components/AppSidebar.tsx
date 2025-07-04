import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileBlocked } from "@/hooks/useProfileBlocked";
import {
  Home, 
  ShoppingBasket, 
  Package, 
  Users, 
  FileText, 
  Calculator,
  DollarSign,
  ShoppingCart, 
  TrendingUp,
  Settings,
  HelpCircle,
  BarChart3,
  CreditCard
} from "lucide-react";

interface AppSidebarProps {
  children?: React.ReactNode;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ children }) => {
  const { signOut } = useAuth();
  const { isBlocked } = useProfileBlocked();

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/app",
      icon: Home,
    },
    {
      title: "Ingredientes", 
      url: "/app/ingredients",
      icon: ShoppingBasket,
    },
    {
      title: "Receitas",
      url: "/app/recipes", 
      icon: FileText,
    },
    {
      title: "Produtos",
      url: "/app/products",
      icon: Package,
    },
    {
      title: "Precificação",
      url: "/app/pricing",
      icon: Calculator,
    },
    {
      title: "Pedidos",
      url: "/app/orders",
      icon: ShoppingCart,
    },
    {
      title: "Vendas",
      url: "/app/sales",
      icon: TrendingUp,
    },
    {
      title: "Financeiro",
      url: "/app/financeiro", 
      icon: DollarSign,
    },
    {
      title: "Contas a Pagar",
      url: "/app/accounts-payable",
      icon: CreditCard,
    },
    {
      title: "Revenda",
      url: "/app/resale",
      icon: Users,
    },
    {
      title: "Relatórios",
      url: "/app/relatorios",
      icon: BarChart3,
    },
    {
      title: "Clientes",
      url: "/app/customers",
      icon: Users,
    },
  ];

  const restrictedNavigationItems = [
    {
      title: "Dashboard",
      url: "/app",
      icon: Home,
    },
    {
      title: "Suporte",
      url: "/app/support",
      icon: HelpCircle,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navegue pelas opções do sistema.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />

        <Accordion type="single" collapsible>
          {(!isBlocked ? navigationItems : restrictedNavigationItems).map((item) => (
            <AccordionItem value={item.title} key={item.title}>
              <AccordionTrigger asChild>
                <Link to={item.url} className="w-full flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              </AccordionTrigger>
              <AccordionContent>
                {/* Submenu content can be added here if needed */}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Separator className="my-4" />
        <button onClick={signOut} className="w-full text-left py-2">
          Sair
        </button>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
