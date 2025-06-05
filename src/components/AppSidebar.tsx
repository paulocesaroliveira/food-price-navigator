
import { Home, Package2, Beaker, ChefHat, Package, Calculator, ShoppingCart, DollarSign, Users, FileText, CreditCard, BarChart3, TrendingUp, Repeat, Settings, RefreshCw } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
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
  },
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
  },
  {
    title: "Contas a Pagar",
    url: "/accounts-payable",
    icon: CreditCard,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  },
  {
    title: "Fluxo de Caixa",
    url: "/fluxo-caixa",
    icon: TrendingUp,
  },
  {
    title: "Atualizar Custos",
    url: "/cost-update",
    icon: RefreshCw,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão Culinária</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
