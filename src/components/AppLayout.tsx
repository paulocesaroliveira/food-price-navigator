import React, { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, User, HelpCircle, LogOut } from "lucide-react";
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
import ThemeSelector from "./ThemeSelector";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AppLayout = () => {
  const { toast } = useToast();
  const { theme, changeTheme } = useTheme();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="animate-spin rounded-full h-16 w-16 lg:h-32 lg:w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border shadow-sm h-14 lg:h-16">
            <div className="h-full flex items-center justify-between px-3 lg:px-6">
              <div className="flex items-center gap-3 lg:gap-4">
                <SidebarTrigger className="text-foreground hover:text-primary transition-colors h-8 w-8 lg:h-10 lg:w-10" />
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                {/* Desktop tooltips */}
                <div className="hidden sm:block">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast({ 
                            title: "Sem notificações", 
                            description: "Você não tem novas notificações." 
                          })}
                          className="text-foreground hover:text-primary hover:bg-accent transition-colors h-8 w-8 lg:h-10 lg:w-10 p-0"
                        >
                          <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Notificações</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Mobile notifications without tooltip */}
                <div className="block sm:hidden">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toast({ 
                      title: "Sem notificações", 
                      description: "Você não tem novas notificações." 
                    })}
                    className="text-foreground hover:text-primary hover:bg-accent transition-colors h-8 w-8 p-0"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="hidden sm:block">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Alterar tema</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="block sm:hidden">
                  <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
                </div>
                
                <div className="hidden sm:block">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate("/help")}
                          className="text-foreground hover:text-primary hover:bg-accent transition-colors h-8 w-8 lg:h-10 lg:w-10 p-0"
                        >
                          <HelpCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ajuda</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="rounded-full hover:bg-accent transition-colors h-8 w-8 lg:h-10 lg:w-10 p-0"
                    >
                      <User className="h-4 w-4 lg:h-5 lg:w-5 text-foreground hover:text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 sm:w-56 bg-card border-border shadow-lg"
                    sideOffset={5}
                  >
                    <div className="px-3 lg:px-4 py-2 lg:py-3 border-b border-border">
                      <p className="text-xs lg:text-sm font-medium font-poppins">Seu Perfil</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuItem 
                      className="cursor-pointer text-xs lg:text-sm p-3 sm:p-2"
                      onClick={() => navigate("/settings")}
                    >
                      Configurações
                    </DropdownMenuItem>
                    {/* Mobile help link */}
                    <div className="block sm:hidden">
                      <DropdownMenuItem 
                        className="cursor-pointer text-xs lg:text-sm p-3 sm:p-2"
                        onClick={() => navigate("/help")}
                      >
                        <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                        Ajuda
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive text-xs lg:text-sm p-3 sm:p-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <div className="p-3 sm:p-4 lg:p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
