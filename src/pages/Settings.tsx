
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Bell, 
  Database, 
  Users, 
  Package, 
  ShoppingCart,
  TrendingUp,
  Save,
  CheckCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [companySettings, setCompanySettings] = useState({
    name: "",
    tradingName: "",
    address: "",
    phone: "",
    email: "",
    cnpj: ""
  });

  const [systemSettings, setSystemSettings] = useState({
    orderNotifications: true,
    emailNotifications: false,
    autoBackup: true,
    darkMode: false
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCompanyInfo = async () => {
    setIsSaving(true);
    
    // Simular salvamento
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configurações salvas",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  const handleToggleSetting = (setting: keyof typeof systemSettings) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast({
      title: "Configuração atualizada",
      description: `${setting} foi ${systemSettings[setting] ? 'desativado' : 'ativado'}.`,
    });
  };

  const moduleStats = [
    { name: "Clientes", count: 45, icon: Users, active: true },
    { name: "Produtos", count: 23, icon: Package, active: true },
    { name: "Pedidos", count: 128, icon: ShoppingCart, active: true },
    { name: "Vendas", count: 89, icon: TrendingUp, active: true },
  ];

  return (
    <div className="container mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Gerencie as configurações do seu sistema</p>
          </div>
        </div>
      </div>

      {/* Status dos Módulos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status dos Módulos
          </CardTitle>
          <CardDescription>
            Visão geral dos módulos ativos no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleStats.map((module) => (
              <div key={module.name} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <module.icon className="h-5 w-5 text-gray-600" />
                  <Badge variant={module.active ? "default" : "secondary"}>
                    {module.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{module.name}</p>
                  <p className="text-2xl font-bold text-blue-600">{module.count}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>
              Configure os dados básicos da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da sua empresa"
                />
              </div>
              
              <div>
                <Label htmlFor="tradingName">Nome Fantasia</Label>
                <Input
                  id="tradingName"
                  value={companySettings.tradingName}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, tradingName: e.target.value }))}
                  placeholder="Nome fantasia"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Endereço completo"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={companySettings.cnpj}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            
            <Separator />
            
            <Button 
              onClick={handleSaveCompanyInfo}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Informações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como deseja receber as notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar Novos Pedidos</Label>
                  <p className="text-sm text-gray-500">
                    Receba notificações quando novos pedidos chegarem
                  </p>
                </div>
                <Switch
                  checked={systemSettings.orderNotifications}
                  onCheckedChange={() => handleToggleSetting('orderNotifications')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-mails de Notificação</Label>
                  <p className="text-sm text-gray-500">
                    Receba resumos por e-mail
                  </p>
                </div>
                <Switch
                  checked={systemSettings.emailNotifications}
                  onCheckedChange={() => handleToggleSetting('emailNotifications')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Personalize a experiência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-gray-500">
                    Backup automático dos dados do sistema
                  </p>
                </div>
                <Switch
                  checked={systemSettings.autoBackup}
                  onCheckedChange={() => handleToggleSetting('autoBackup')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-gray-500">
                    Ative o tema escuro da interface
                  </p>
                </div>
                <Switch
                  checked={systemSettings.darkMode}
                  onCheckedChange={() => handleToggleSetting('darkMode')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Banco de Dados</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Conectado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Última Sincronização</span>
                  <span className="text-sm text-gray-500">Há 2 minutos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Versão do Sistema</span>
                  <span className="text-sm text-gray-500">v1.0.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
