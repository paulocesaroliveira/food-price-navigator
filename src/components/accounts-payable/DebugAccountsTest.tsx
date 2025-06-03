
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAccountPayable, getAccountsPayable } from "@/services/accountsPayableService";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DebugAccountsTest = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const createTestAccount = async () => {
    setIsCreating(true);
    try {
      const testAccount = {
        description: "Conta de Teste - " + new Date().toISOString(),
        amount: 100.50,
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        supplier: "Fornecedor Teste",
        notes: "Esta é uma conta criada para teste"
      };

      console.log("Criando conta de teste:", testAccount);
      const success = await createAccountPayable(testAccount);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Conta de teste criada com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro ao criar conta de teste:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar conta de teste",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const checkUserAndAccounts = async () => {
    setIsChecking(true);
    try {
      // Verificar usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("=== VERIFICAÇÃO DE DEBUG ===");
      console.log("Usuário autenticado:", user);
      console.log("Erro de usuário:", userError);

      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Buscar contas do usuário
      console.log("Buscando contas para o usuário:", user.id);
      const accounts = await getAccountsPayable();
      console.log("Contas encontradas:", accounts.length);
      console.log("Primeiras 3 contas:", accounts.slice(0, 3));

      // Verificar diretamente no banco
      const { data: directData, error: directError } = await supabase
        .from("accounts_payable")
        .select("*")
        .eq("user_id", user.id);

      console.log("Consulta direta ao banco:");
      console.log("Dados:", directData);
      console.log("Erro:", directError);
      console.log("Total de registros:", directData?.length || 0);

      toast({
        title: "Verificação completa",
        description: `Encontradas ${accounts.length} contas via service e ${directData?.length || 0} via consulta direta`,
      });

    } catch (error) {
      console.error("Erro na verificação:", error);
      toast({
        title: "Erro",
        description: "Falha na verificação",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">🔧 Teste de Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-orange-700">
          Use estes botões para testar e verificar o funcionamento do sistema de contas a pagar.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={createTestAccount} 
            disabled={isCreating}
            variant="outline"
            className="border-orange-300 text-orange-800 hover:bg-orange-100"
          >
            {isCreating ? "Criando..." : "Criar Conta de Teste"}
          </Button>
          <Button 
            onClick={checkUserAndAccounts} 
            disabled={isChecking}
            variant="outline"
            className="border-blue-300 text-blue-800 hover:bg-blue-100"
          >
            {isChecking ? "Verificando..." : "Verificar Dados"}
          </Button>
        </div>
        <p className="text-xs text-orange-600">
          Abra o console do navegador (F12) para ver logs detalhados.
        </p>
      </CardContent>
    </Card>
  );
};

export default DebugAccountsTest;
