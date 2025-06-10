
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Configurações" 
        icon={SettingsIcon}
        gradient="bg-gradient-to-r from-gray-600 to-slate-600"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure as preferências gerais do sistema.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gerencie suas preferências de notificação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
