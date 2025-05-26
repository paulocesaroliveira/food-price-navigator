
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sale } from "@/types/sales";
import { ArrowLeft, ShoppingCart, Receipt, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalesDetailProps {
  sale: Sale;
  onClose: () => void;
}

const SalesDetail = ({ sale, onClose }: SalesDetailProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getExpenseTypeText = (type: string) => {
    switch (type) {
      case 'expense': return 'Despesa';
      case 'tax': return 'Taxa';
      case 'fee': return 'Comissão';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{sale.sale_number}</h1>
            <Badge className={getStatusColor(sale.status)}>
              {getStatusText(sale.status)}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">
            {format(new Date(sale.sale_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da venda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Itens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Itens da Venda
              </CardTitle>
              <CardDescription>
                {sale.items?.length || 0} {(sale.items?.length || 0) === 1 ? 'item' : 'itens'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sale.items && sale.items.length > 0 ? (
                <div className="space-y-4">
                  {sale.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="md:col-span-2">
                        <p className="font-medium">{item.product?.name || 'Produto não encontrado'}</p>
                        <p className="text-sm text-gray-500">Custo unitário: R$ {item.unit_cost.toFixed(2)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Quantidade</p>
                        <p className="font-medium">{item.quantity}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Preço Total</p>
                        <p className="font-medium">R$ {item.total_price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Unit: R$ {item.unit_price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum item encontrado</p>
              )}
            </CardContent>
          </Card>

          {/* Despesas */}
          {sale.expenses && sale.expenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Despesas e Taxas
                </CardTitle>
                <CardDescription>
                  {sale.expenses.length} {sale.expenses.length === 1 ? 'despesa' : 'despesas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sale.expenses.map((expense) => (
                    <div key={expense.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{expense.name}</p>
                        <p className="text-sm text-gray-500">{getExpenseTypeText(expense.type)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Valor</p>
                        <p className="font-medium text-red-600">R$ {expense.amount.toFixed(2)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Descrição</p>
                        <p className="text-sm">{expense.description || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {sale.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{sale.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumo financeiro */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total da Venda:</span>
                  <span className="font-bold text-lg">R$ {sale.total_amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Custo dos Produtos:</span>
                  <span className="font-medium text-red-600">R$ {sale.total_cost.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Lucro Bruto:</span>
                  <span className="font-medium text-green-600">R$ {sale.gross_profit.toFixed(2)}</span>
                </div>
                
                {sale.expenses && sale.expenses.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de Despesas:</span>
                    <span className="font-medium text-red-600">
                      R$ {sale.expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold">Lucro Líquido:</span>
                    <span className="font-bold text-xl text-green-600">R$ {sale.net_profit.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">Margem de Lucro:</span>
                    <span className="text-sm font-medium">
                      {sale.total_amount > 0 ? ((sale.net_profit / sale.total_amount) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Data da Venda</p>
                <p className="font-medium">
                  {format(new Date(sale.sale_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Registrado em</p>
                <p className="font-medium">
                  {format(new Date(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Última atualização</p>
                <p className="font-medium">
                  {format(new Date(sale.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesDetail;
