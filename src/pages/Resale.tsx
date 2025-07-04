
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingCart, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { resaleService } from "@/services/resaleService";
import ResaleTransactionForm from "@/components/resale/ResaleTransactionForm";
import { PageHeader } from "@/components/shared/PageHeader";
import ResellerForm from "@/components/resale/ResellerForm";

const Resale = () => {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isResellerDialogOpen, setIsResellerDialogOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resellers = [], isLoading: isLoadingResellers, refetch: refetchResellers } = useQuery({
    queryKey: ["resellers"],
    queryFn: resaleService.getResellers,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions, refetch: refetchTransactions } = useQuery({
    queryKey: ["resale-transactions"],
    queryFn: resaleService.getTransactions,
  });

  const deleteResellerMutation = useMutation({
    mutationFn: resaleService.deleteReseller,
    onSuccess: () => {
      toast({
        title: "Revendedor excluído",
        description: "O revendedor foi excluído com sucesso.",
      });
      refetchResellers();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir revendedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTransactionSuccess = () => {
    setIsTransactionDialogOpen(false);
    refetchTransactions();
    toast({
      title: "Transação registrada",
      description: "A transação de revenda foi registrada com sucesso.",
    });
  };

  const handleResellerSuccess = () => {
    setIsResellerDialogOpen(false);
    setSelectedReseller(null);
    refetchResellers();
    toast({
      title: "Revendedor salvo",
      description: "O revendedor foi salvo com sucesso.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (isLoadingResellers || isLoadingTransactions) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeResellers = Array.isArray(resellers) ? resellers : [];

  const totalSales = safeTransactions.reduce((sum, transaction) => sum + Number(transaction.total_amount), 0);
  const totalCommissions = safeTransactions.reduce((sum, transaction) => sum + Number(transaction.commission_amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Revenda" 
        icon={ShoppingCart}
        gradient="bg-gradient-to-r from-purple-600 to-pink-600"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revendedores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeResellers.filter(r => r.status === "active").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Revendedores */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Revendedores</h2>
          <Dialog open={isResellerDialogOpen} onOpenChange={setIsResellerDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Revendedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedReseller ? "Editar Revendedor" : "Novo Revendedor"}</DialogTitle>
              </DialogHeader>
              <ResellerForm
                reseller={selectedReseller}
                onSuccess={handleResellerSuccess}
                onCancel={() => setIsResellerDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Revendedores</CardTitle>
          </CardHeader>
          <CardContent>
            {safeResellers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum revendedor cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {safeResellers.map((reseller) => (
                  <div key={reseller.id} className="border rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{reseller.name}</div>
                        <Badge variant={reseller.status === "active" ? "default" : "secondary"}>
                          {reseller.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {reseller.email && (
                        <div className="text-sm text-muted-foreground">{reseller.email}</div>
                      )}
                      {reseller.phone && (
                        <div className="text-sm text-muted-foreground">{reseller.phone}</div>
                      )}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Comissão: </span>
                        <span className="font-medium">{reseller.commission_percentage}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Total de vendas: </span>
                        <span className="font-medium">{formatCurrency(reseller.total_sales)}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedReseller(reseller);
                            setIsResellerDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este revendedor?")) {
                              deleteResellerMutation.mutate(reseller.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção de Transações */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Transações</h2>
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={safeResellers.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Transação de Revenda</DialogTitle>
              </DialogHeader>
              <ResaleTransactionForm
                resellers={safeResellers}
                onSuccess={handleTransactionSuccess}
                open={isTransactionDialogOpen}
                onOpenChange={setIsTransactionDialogOpen}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {safeTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação registrada ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {safeTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {safeResellers.find(r => r.id === transaction.reseller_id)?.name || "Revendedor não encontrado"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.transaction_date)} • Status: {transaction.status}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium">{formatCurrency(Number(transaction.total_amount))}</div>
                      <div className="text-sm text-muted-foreground">
                        Comissão: {formatCurrency(Number(transaction.commission_amount))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resale;


