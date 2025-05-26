
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
      primary: '#26D0CE',
      secondary: '#A8E6CF',
      background: '#F0FFFF'
    }
  },
  {
    name: 'amber',
    label: 'Âmbar Aconchegante',
    colors: {
      primary: '#FFB347',
      secondary: '#DEB887',
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
          className="text-foreground hover:text-primary hover:bg-accent transition-colors"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((theme) => (
          <DropdownMenuItem 
            key={theme.name}
            onClick={() => handleThemeChange(theme.name as Theme)}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <span>{theme.label}</span>
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
