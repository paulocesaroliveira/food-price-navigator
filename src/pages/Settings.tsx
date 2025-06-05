import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Shield, 
  Bell, 
  Database,
  Save,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Store
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import AvatarUpload from '@/components/ui/avatar-upload';
import { useTheme, type Theme } from '@/hooks/useTheme';

const Settings = () => {
  const { user } = useAuth();
  const { theme, changeTheme } = useTheme();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    store_name: '',
    phone: '',
    address: ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { store_name: string; phone: string; address: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      toast({ title: "Perfil atualizado!", description: "Suas informações foram atualizadas com sucesso." });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  });

  const handleProfileUpdate = async () => {
    updateProfileMutation.mutate(profileData);
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  React.useEffect(() => {
    if (profile) {
      setProfileData({
        store_name: profile.store_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const themes: { value: Theme; label: string; preview: string }[] = [
    { value: 'light', label: 'Claro', preview: 'bg-blue-500' },
    { value: 'coral', label: 'Coral', preview: 'bg-orange-500' },
    { value: 'mint', label: 'Menta', preview: 'bg-teal-500' },
    { value: 'amber', label: 'Âmbar', preview: 'bg-yellow-500' },
    { value: 'dark', label: 'Escuro', preview: 'bg-gray-800' }
  ];

  return (
    <>
      <SEOHead 
        title="Configurações - TastyHub"
        description="Configure suas preferências, perfil e dados da empresa no TastyHub"
        keywords="configurações, perfil, preferências, empresa"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container-responsive py-6 lg:py-8 spacing-responsive">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 lg:p-10 text-white shadow-2xl mb-6 lg:mb-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -right-4 -top-4 h-24 w-24 lg:h-32 lg:w-32 rounded-full bg-white/10"></div>
            <div className="absolute -left-4 -bottom-4 h-32 w-32 lg:h-40 lg:w-40 rounded-full bg-white/5"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="rounded-2xl bg-white/20 p-3 lg:p-4 backdrop-blur-sm">
                  <SettingsIcon className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Configurações</h1>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Gerencie suas preferências e dados do perfil</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-white shadow-lg rounded-xl">
              <TabsTrigger value="profile" className="text-sm lg:text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Perfil
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-sm lg:text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Preferências
              </TabsTrigger>
              <TabsTrigger value="security" className="text-sm lg:text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    Informações do Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <AvatarUpload
                      size="lg"
                      editable={true}
                      userName={user?.email || 'Usuário'}
                    />
                    <div>
                      <h3 className="font-semibold text-lg">Foto do Perfil</h3>
                      <p className="text-sm text-gray-600">Clique no ícone da câmera para alterar sua foto</p>
                      <p className="text-xs text-gray-500 mt-1">Formatos aceitos: JPG, PNG, WEBP (máx. 5MB)</p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="store_name">Nome da Loja</Label>
                      <Input 
                        id="store_name" 
                        value={profileData.store_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, store_name: e.target.value }))}
                        placeholder="Nome da sua loja"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Textarea 
                        id="address" 
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Endereço completo da loja"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    onClick={handleProfileUpdate}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-purple-600" />
                    Aparência
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Tema da Interface</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {themes.map((themeOption) => (
                        <div
                          key={themeOption.value}
                          className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                            theme === themeOption.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => changeTheme(themeOption.value)}
                        >
                          <div className={`w-8 h-8 rounded-full ${themeOption.preview} mb-2 mx-auto`}></div>
                          <p className="text-center text-sm font-medium">{themeOption.label}</p>
                          {theme === themeOption.value && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                  <CardTitle className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-orange-600" />
                    Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Notificações por Email</h3>
                    <p className="text-sm text-gray-600">Receba atualizações importantes e novidades por email.</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="text-sm">Ativar notificações por email</Label>
                      {/* Switch component would go here */}
                    </div>
                  </div>
                  <hr className="my-4 border-gray-200" />
                  <div>
                    <h3 className="font-semibold mb-2">Alertas no Sistema</h3>
                    <p className="text-sm text-gray-600">Receba alertas e avisos diretamente no sistema.</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Label htmlFor="system-alerts" className="text-sm">Ativar alertas no sistema</Label>
                      {/* Switch component would go here */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Alterar Senha</h3>
                    <p className="text-sm text-gray-600">Altere sua senha regularmente para manter sua conta segura.</p>
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input type="password" id="current-password" placeholder="Senha atual" />
                      </div>
                      <div>
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input type="password" id="new-password" placeholder="Nova senha" />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input type="password" id="confirm-password" placeholder="Confirmar nova senha" />
                      </div>
                    </div>
                    <Button className="mt-6 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                      <Save className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Settings;
