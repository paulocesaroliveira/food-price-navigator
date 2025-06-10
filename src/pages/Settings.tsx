
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/shared/PageHeader";
import { User, Store, Bell, Shield, Palette, Download } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const profileData = {
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      store_name: formData.get('store_name') as string,
    };
    
    updateProfileMutation.mutate(profileData);
  };

  const handleExportData = () => {
    toast({
      title: "Exportando dados",
      description: "Seus dados estão sendo preparados para download.",
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie suas preferências e configurações da conta"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Loja</span>
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
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={profile?.phone || ''}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    name="address"
                    defaultValue={profile?.address || ''}
                    placeholder="Seu endereço completo"
                  />
                </div>
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Nome da Loja</Label>
                  <Input
                    id="store_name"
                    name="store_name"
                    defaultValue={profile?.store_name || ''}
                    placeholder="Nome do seu negócio"
                  />
                </div>
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Novos Pedidos</h4>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações quando houver novos pedidos
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ativado
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Estoque Baixo</h4>
                    <p className="text-sm text-muted-foreground">
                      Alertas quando ingredientes estiverem com estoque baixo
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ativado
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios Semanais</h4>
                    <p className="text-sm text-muted-foreground">
                      Receba um resumo semanal das suas vendas
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Desativado
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Alterar Senha</h4>
                  <Button variant="outline">
                    Redefinir Senha
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Exportar Dados</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Baixe uma cópia de todos os seus dados
                  </p>
                  <Button variant="outline" onClick={handleExportData} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Dados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Tema</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Escolha como o sistema deve aparecer para você
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <div className="w-6 h-6 bg-white border rounded"></div>
                      Claro
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <div className="w-6 h-6 bg-black rounded"></div>
                      Escuro
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-white to-black rounded"></div>
                      Sistema
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
