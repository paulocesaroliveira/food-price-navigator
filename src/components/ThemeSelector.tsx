
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Palette, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type Theme = 'light' | 'coral' | 'mint' | 'amber' | 'dark';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const themes = [
  {
    name: 'light',
    label: 'Claro Padrão',
    colors: {
      primary: '#E76F51',
      secondary: '#2A9D8F',
      background: '#FFFFFF'
    }
  },
  {
    name: 'coral',
    label: 'Coral Vibrante',
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      background: '#FFF8F0'
    }
  },
  {
    name: 'mint',
    label: 'Menta Fresca',
    colors: {
      primary: '#26A69A',
      secondary: '#81C784',
      background: '#F0FFFF'
    }
  },
  {
    name: 'amber',
    label: 'Âmbar Aconchegante',
    colors: {
      primary: '#FFC107',
      secondary: '#FF9800',
      background: '#FFF8DC'
    }
  },
  {
    name: 'dark',
    label: 'Escuro Elegante',
    colors: {
      primary: '#E76F51',
      secondary: '#2A9D8F',
      background: '#1A1A1A'
    }
  }
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const { toast } = useToast();

  const handleThemeChange = (theme: Theme) => {
    onThemeChange(theme);
    const selectedTheme = themes.find(t => t.name === theme);
    toast({
      title: "Tema alterado",
      description: `Tema ${selectedTheme?.label} aplicado com sucesso.`,
      duration: 2000,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground hover:text-primary hover:bg-accent transition-colors h-8 w-8 lg:h-10 lg:w-10"
        >
          <Palette className="h-4 w-4 lg:h-5 lg:w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 sm:w-56 bg-card border-border shadow-lg"
        sideOffset={5}
      >
        {themes.map((theme) => (
          <DropdownMenuItem 
            key={theme.name}
            onClick={() => handleThemeChange(theme.name as Theme)}
            className="cursor-pointer flex items-center justify-between hover:bg-accent p-3 sm:p-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-border/50 -ml-1"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
              </div>
              <span className="text-sm sm:text-base">{theme.label}</span>
            </div>
            {currentTheme === theme.name && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
