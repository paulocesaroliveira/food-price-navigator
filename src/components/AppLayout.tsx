
import React, { useEffect } from "react";
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
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // Check for saved theme in localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle theme function with localStorage persistence
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      toast({
        title: "Modo escuro ativado",
        description: "O tema foi alterado com sucesso.",
        duration: 2000,
      });
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      toast({
        title: "Modo claro ativado",
        description: "O tema foi alterado com sucesso.",
        duration: 2000,
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 bg-background border-b shadow-sm h-16">
            <div className="h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-foreground hover:text-primary transition-colors" />
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary md:hidden" />
                  <span className="font-poppins font-semibold text-lg hidden md:block">TastyHub</span>
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
                        className="text-foreground hover:text-primary hover:bg-accent transition-colors"
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
                        className="text-foreground hover:text-primary hover:bg-accent transition-colors"
                      >
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
                        className="text-foreground hover:text-primary hover:bg-accent transition-colors"
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
                      className="rounded-full hover:bg-accent transition-colors"
                    >
                      <User className="h-5 w-5 text-foreground hover:text-primary" />
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
