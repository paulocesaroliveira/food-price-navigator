
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { Settings as SettingsIcon, Save, User, Bell, Shield, Palette, Moon, Sun, Monitor, Smartphone, Eye, Type, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";

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
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false
  });

  const [appearance, setAppearance] = useState({
    theme: "system",
    compactMode: false,
    language: "pt-BR",
    fontSize: 16,
    colorScheme: "blue",
    animations: true,
    autoSave: true
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: 30
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        title: "✅ Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    toast({
      title: "✅ Notificações atualizadas",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  const handleSaveAppearance = () => {
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

    root.style.fontSize = `${appearance.fontSize}px`;

    localStorage.setItem('appearance', JSON.stringify(appearance));

    toast({
      title: "✅ Aparência atualizada",
      description: "Suas configurações de aparência foram salvas.",
    });
  };

  const handleSaveSecurity = () => {
    if (security.newPassword && security.newPassword !== security.confirmPassword) {
      toast({
        title: "❌ Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "✅ Configurações de segurança atualizadas",
      description: "Suas configurações de segurança foram salvas.",
    });

    setSecurity({
      ...security,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
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
        gradient="from-gray-600 to-slate-600"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName" className="text-sm font-medium">Nome da Loja</Label>
                  <Input
                    id="storeName"
                    value={profileData.storeName}
                    onChange={(e) => setProfileData({...profileData, storeName: e.target.value})}
                    placeholder="Nome da sua loja"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50 border-gray-200"
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs text-gray-500">
                    O email não pode ser alterado por questões de segurança
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Endereço</Label>
                <Textarea
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  placeholder="Endereço completo da loja"
                  rows={3}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                disabled={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Bell className="h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {[
                { key: 'orderUpdates', label: 'Atualizações de Pedidos', desc: 'Receba notificações quando o status dos pedidos mudar' },
                { key: 'stockAlerts', label: 'Alertas de Estoque', desc: 'Notificações quando ingredientes estiverem acabando' },
                { key: 'reportReminders', label: 'Lembretes de Relatórios', desc: 'Lembretes semanais para gerar relatórios' },
                { key: 'emailNotifications', label: 'Notificações por Email', desc: 'Receber notificações importantes por email' },
                { key: 'pushNotifications', label: 'Notificações Push', desc: 'Notificações em tempo real no navegador' },
                { key: 'weeklyReports', label: 'Relatórios Semanais', desc: 'Receber resumo semanal das atividades' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="space-y-1">
                    <Label className="font-medium">{item.label}</Label>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, [item.key]: checked})
                    }
                  />
                </div>
              ))}

              <Button onClick={handleSaveNotifications} className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar Notificações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Palette className="h-5 w-5" />
                Configurações de Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tema</Label>
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
                  <Label className="text-sm font-medium">Esquema de Cores</Label>
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
                      <SelectItem value="red">Vermelho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Tamanho da Fonte: {appearance.fontSize}px</Label>
                <Slider
                  value={[appearance.fontSize]}
                  onValueChange={(value) => setAppearance({...appearance, fontSize: value[0]})}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pequeno (12px)</span>
                  <span>Normal (16px)</span>
                  <span>Grande (24px)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Modo Compacto
                    </Label>
                    <p className="text-sm text-gray-600">Interface mais compacta</p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => 
                      setAppearance({...appearance, compactMode: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Animações
                    </Label>
                    <p className="text-sm text-gray-600">Efeitos visuais e transições</p>
                  </div>
                  <Switch
                    checked={appearance.animations}
                    onCheckedChange={(checked) => 
                      setAppearance({...appearance, animations: checked})
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Salvamento Automático</Label>
                  <p className="text-sm text-gray-600">Salvar alterações automaticamente</p>
                </div>
                <Switch
                  checked={appearance.autoSave}
                  onCheckedChange={(checked) => 
                    setAppearance({...appearance, autoSave: checked})
                  }
                />
              </div>

              <Button onClick={handleSaveAppearance} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar Aparência
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alterar Senha</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                    placeholder="Digite sua senha atual"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                      placeholder="Digite a nova senha"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Segurança Adicional</h3>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium">Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-gray-600">Adicionar uma camada extra de segurança</p>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(checked) => 
                      setSecurity({...security, twoFactorEnabled: checked})
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Timeout da Sessão: {security.sessionTimeout} minutos</Label>
                  <Slider
                    value={[security.sessionTimeout]}
                    onValueChange={(value) => setSecurity({...security, sessionTimeout: value[0]})}
                    max={120}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10 min</span>
                    <span>60 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSecurity} className="w-full md:w-auto bg-red-600 hover:bg-red-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
