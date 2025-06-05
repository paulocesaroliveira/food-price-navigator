
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Key, 
  Database, 
  Globe, 
  Lock,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SecurityCheckItem {
  id: string;
  title: string;
  description: string;
  status: 'good' | 'warning' | 'error';
  action?: string;
  icon: React.ElementType;
}

export const SecurityCheck = () => {
  const [checks, setChecks] = useState<SecurityCheckItem[]>([]);
  const [loading, setLoading] = useState(true);

  const runSecurityChecks = async () => {
    setLoading(true);
    const securityChecks: SecurityCheckItem[] = [];

    // Check 1: Autenticação
    const { data: { user } } = await supabase.auth.getUser();
    securityChecks.push({
      id: 'auth',
      title: 'Autenticação de Usuário',
      description: user ? 'Usuário autenticado' : 'Nenhum usuário logado',
      status: user ? 'good' : 'error',
      action: !user ? 'Faça login para acessar o sistema' : undefined,
      icon: Key
    });

    // Check 2: Conexão com Database
    try {
      const { data, error } = await supabase.from('ingredients').select('id').limit(1);
      securityChecks.push({
        id: 'database',
        title: 'Conexão com Banco de Dados',
        description: error ? 'Erro na conexão' : 'Conexão estável',
        status: error ? 'error' : 'good',
        action: error ? 'Verifique as configurações do Supabase' : undefined,
        icon: Database
      });
    } catch (error) {
      securityChecks.push({
        id: 'database',
        title: 'Conexão com Banco de Dados',
        description: 'Erro na conexão',
        status: 'error',
        action: 'Verifique as configurações do Supabase',
        icon: Database
      });
    }

    // Check 3: HTTPS
    const isHTTPS = window.location.protocol === 'https:';
    securityChecks.push({
      id: 'https',
      title: 'Conexão Segura (HTTPS)',
      description: isHTTPS ? 'Site servido via HTTPS' : 'Site servido via HTTP',
      status: isHTTPS ? 'good' : 'warning',
      action: !isHTTPS ? 'Configure SSL/TLS para produção' : undefined,
      icon: Lock
    });

    // Check 4: Environment Variables
    const hasSupabaseConfig = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    securityChecks.push({
      id: 'env',
      title: 'Variáveis de Ambiente',
      description: hasSupabaseConfig ? 'Configurações carregadas' : 'Configurações ausentes',
      status: hasSupabaseConfig ? 'good' : 'error',
      action: !hasSupabaseConfig ? 'Configure as variáveis do Supabase' : undefined,
      icon: Globe
    });

    // Check 5: Performance - Local Storage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      securityChecks.push({
        id: 'storage',
        title: 'Armazenamento Local',
        description: 'Local Storage disponível',
        status: 'good',
        icon: Database
      });
    } catch (error) {
      securityChecks.push({
        id: 'storage',
        title: 'Armazenamento Local',
        description: 'Local Storage bloqueado',
        status: 'warning',
        action: 'Habilite cookies e local storage',
        icon: Database
      });
    }

    setChecks(securityChecks);
    setLoading(false);
  };

  useEffect(() => {
    runSecurityChecks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return AlertTriangle;
    }
  };

  const overallStatus = checks.every(check => check.status === 'good') ? 'good' :
                      checks.some(check => check.status === 'error') ? 'error' : 'warning';

  return (
    <Card className="custom-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verificação de Segurança e Performance
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runSecurityChecks}
            disabled={loading}
            className="rounded-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Verificar Novamente
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className={`p-4 rounded-xl border-2 ${
          overallStatus === 'good' ? 'border-green-200 bg-green-50' :
          overallStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            {overallStatus === 'good' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {overallStatus === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-600" />}
            {overallStatus === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
            <div>
              <h3 className="font-semibold">
                {overallStatus === 'good' && 'Sistema Seguro ✅'}
                {overallStatus === 'warning' && 'Atenção Requerida ⚠️'}
                {overallStatus === 'error' && 'Problemas Detectados ❌'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {overallStatus === 'good' && 'Todas as verificações passaram com sucesso'}
                {overallStatus === 'warning' && 'Algumas melhorias são recomendadas'}
                {overallStatus === 'error' && 'Corrija os problemas antes de ir para produção'}
              </p>
            </div>
          </div>
        </div>

        {/* Itens de Verificação */}
        <div className="space-y-3">
          {checks.map((check) => {
            const StatusIcon = getStatusIcon(check.status);
            const ItemIcon = check.icon;
            
            return (
              <div key={check.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <div className="p-2 rounded-lg bg-background">
                  <ItemIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{check.title}</h4>
                    <Badge className={`${getStatusColor(check.status)} border-0 rounded-full`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {check.status === 'good' ? 'OK' : 
                       check.status === 'warning' ? 'Atenção' : 'Erro'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{check.description}</p>
                  {check.action && (
                    <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                      📝 {check.action}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recomendações para Produção */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Checklist para Produção</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Configure domínio personalizado</li>
            <li>✅ Habilite SSL/TLS (HTTPS)</li>
            <li>✅ Configure backup automático do banco</li>
            <li>✅ Teste todas as funcionalidades</li>
            <li>✅ Configure monitoramento de erros</li>
            <li>✅ Defina políticas de segurança (RLS)</li>
            <li>✅ Configure limites de rate limiting</li>
            <li>✅ Otimize imagens e assets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
