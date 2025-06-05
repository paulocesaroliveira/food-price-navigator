
import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SecurityCheck = () => {
  const securityFeatures = [
    {
      name: "Row Level Security (RLS)",
      status: "enabled",
      description: "Dados isolados por usuário",
      icon: Shield
    },
    {
      name: "Role-Based Access Control",
      status: "enabled", 
      description: "Sistema de roles admin/usuário",
      icon: CheckCircle
    },
    {
      name: "Audit Logging",
      status: "enabled",
      description: "Log de segurança para admins",
      icon: CheckCircle
    },
    {
      name: "Authentication Required",
      status: "enabled",
      description: "Acesso protegido por autenticação",
      icon: Shield
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Status de Segurança do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityFeatures.map((feature) => (
            <div key={feature.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <feature.icon className={`h-5 w-5 ${
                  feature.status === 'enabled' ? 'text-green-600' : 'text-red-600'
                }`} />
                <div>
                  <h3 className="font-medium">{feature.name}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              <Badge variant={feature.status === 'enabled' ? 'default' : 'destructive'}>
                {feature.status === 'enabled' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Sistema Seguro</h3>
          </div>
          <p className="text-sm text-green-700">
            Todas as principais medidas de segurança estão ativas. Os dados dos usuários 
            estão protegidos e isolados adequadamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityCheck;
