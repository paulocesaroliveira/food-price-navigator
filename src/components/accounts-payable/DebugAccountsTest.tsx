
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAccountPayable } from "@/services/accountsPayableService";
import { toast } from "@/hooks/use-toast";

const DebugAccountsTest = () => {
  const [isCreating, setIsCreating] = useState(false);

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

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">🔧 Teste de Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-700 mb-3">
          Use este botão para criar uma conta de teste e verificar se o cadastro está funcionando.
        </p>
        <Button 
          onClick={createTestAccount} 
          disabled={isCreating}
          variant="outline"
          className="border-orange-300 text-orange-800 hover:bg-orange-100"
        >
          {isCreating ? "Criando..." : "Criar Conta de Teste"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DebugAccountsTest;
