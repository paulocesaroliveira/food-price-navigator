
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
  Store 
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

// Menu items organizados por grupos
const menuGroups = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Visão Geral",
        url: "/dashboard",
        icon: Home,
      }
    ]
  },
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
  },
  {
    label: "Configurações",
    items: [
      {
        title: "Configurações",
        url: "/settings",
        icon: Settings,
      }
    ]
  }
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">Loja Teste</h1>
            <p className="text-xs text-gray-600 truncate" title={user?.email || ''}>
              {user?.email || 'Usuário não logado'}
            </p>
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
