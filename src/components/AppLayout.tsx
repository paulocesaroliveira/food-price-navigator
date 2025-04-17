
import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Bell, Sun, Moon, User, HelpCircle, BarChart3 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AppLayout = () => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // This would be implemented with actual theme toggling 
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: !isDarkMode ? "Modo escuro ativado" : "Modo claro ativado",
      description: "O tema foi alterado com sucesso.",
      duration: 2000,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 bg-food-white shadow-soft h-16">
            <div className="h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-food-dark hover:text-food-coral transition-colors" />
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-food-coral md:hidden" />
                  <span className="font-poppins font-semibold text-lg hidden md:block">FoodPrice</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toast({ 
                          title: "Sem notificações", 
                          description: "Você não tem novas notificações." 
                        })}
                        className="text-food-dark hover:text-food-coral hover:bg-food-cream transition-colors"
                      >
                        <Bell className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notificações</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleTheme}
                        className="text-food-dark hover:text-food-coral hover:bg-food-cream transition-colors"
                      >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Alternar tema</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-food-dark hover:text-food-coral hover:bg-food-cream transition-colors"
                      >
                        <HelpCircle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ajuda</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-food-cream transition-colors"
                    >
                      <User className="h-5 w-5 text-food-dark hover:text-food-coral" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium font-poppins">Seu Perfil</p>
                      <p className="text-xs text-muted-foreground">usuario@exemplo.com</p>
                    </div>
                    <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Configurações</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">Sair</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <div className="py-6 px-4 md:px-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
