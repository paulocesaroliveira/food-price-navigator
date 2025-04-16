
import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Bell, Sun, Moon, User } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 h-16">
            <div className="container h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => toast({ title: "Sem notificações", description: "Você não tem novas notificações." })}>
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium">Seu Perfil</p>
                      <p className="text-xs text-muted-foreground">usuario@exemplo.com</p>
                    </div>
                    <DropdownMenuItem>Perfil</DropdownMenuItem>
                    <DropdownMenuItem>Configurações</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Sair</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <div className="container py-6 px-4 md:px-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
