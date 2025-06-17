
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { Settings as SettingsIcon, Save, User, Bell, Shield, Palette, Moon, Sun, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Settings = () => {
  const [profileData, setProfileData] = useState({
    storeName: "",
    email: "",
    phone: "",
    address: ""
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    stockAlerts: true,
    reportReminders: false,
    emailNotifications: true
  });

  const [appearance, setAppearance] = useState({
    theme: "system",
    compactMode: false,
    language: "pt-BR",
    fontSize: "normal",
    colorScheme: "blue"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados do perfil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return {
        profile: data,
        email: user.email
      };
    }
  });

  // Carregar dados do perfil quando disponível
  useEffect(() => {
    if (profile) {
      setProfileData({
        storeName: profile.profile.store_name || "",
        email: profile.email || "",
        phone: profile.profile.phone || "",
        address: profile.profile.address || ""
      });
    }
  }, [profile]);

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({
          store_name: data.storeName,
          phone: data.phone,
          address: data.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Configurações de notificação atualizadas",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  const handleSaveAppearance = () => {
    // Aplicar tema
    const root = document.documentElement;
    
    switch (appearance.theme) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'light':
        root.classList.remove('dark');
        break;
      case 'system':
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        break;
    }

    // Salvar no localStorage
    localStorage.setItem('theme', appearance.theme);
    localStorage.setItem('compactMode', appearance.compactMode.toString());
    localStorage.setItem('fontSize', appearance.fontSize);
    localStorage.setItem('colorScheme', appearance.colorScheme);

    toast({
      title: "Aparência atualizada",
      description: "Suas configurações de aparência foram salvas.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Configurações" 
        subtitle="Personalize sua experiência no TastyHub"
        icon={SettingsIcon}
        gradient="bg-gradient-to-r from-gray-600 to-slate-600"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nome da Loja</Label>
                  <Input
                    id="storeName"
                    value={profileData.storeName}
                    onChange={(e) => setProfileData({...profileData, storeName: e.target.value})}
                    placeholder="Nome da sua loja"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado por questões de segurança
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  placeholder="Endereço completo da loja"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                className="w-full md:w-auto"
                disabled={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Atualizações de Pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações quando o status dos pedidos mudar
                  </p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, orderUpdates: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertas de Estoque</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações quando ingredientes estiverem acabando
                  </p>
                </div>
                <Switch
                  checked={notifications.stockAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, stockAlerts: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Lembretes de Relatórios</Label>
                  <p className="text-sm text-muted-foreground">
                    Lembretes semanais para gerar relatórios
                  </p>
                </div>
                <Switch
                  checked={notifications.reportReminders}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, reportReminders: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações importantes por email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, emailNotifications: checked})
                  }
                />
              </div>

              <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar Notificações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme a nova senha"
                />
              </div>

              <Button className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configurações de Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Tema</Label>
                <Select
                  value={appearance.theme}
                  onValueChange={(value) => setAppearance({...appearance, theme: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Tamanho da Fonte</Label>
                <Select
                  value={appearance.fontSize}
                  onValueChange={(value) => setAppearance({...appearance, fontSize: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Esquema de Cores</Label>
                <Select
                  value={appearance.colorScheme}
                  onValueChange={(value) => setAppearance({...appearance, colorScheme: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Modo Compacto</Label>
                  <p className="text-sm text-muted-foreground">
                    Interface mais compacta com menos espaçamento
                  </p>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) => 
                    setAppearance({...appearance, compactMode: checked})
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Input
                  id="language"
                  value="Português (Brasil)"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Mais idiomas serão disponibilizados em breve
                </p>
              </div>

              <Button onClick={handleSaveAppearance} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar Aparência
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
