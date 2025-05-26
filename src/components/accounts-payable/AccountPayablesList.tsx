
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Calendar,
  DollarSign,
  User,
  Clock
} from "lucide-react";
import type { AccountPayable } from "@/types/accountsPayable";

interface AccountPayablesListProps {
  accounts: AccountPayable[];
  onEdit: (account: AccountPayable) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string, paymentDate: string, paymentMethod: string) => void;
}

const AccountPayablesList = ({ 
  accounts, 
  onEdit, 
  onDelete, 
  onMarkAsPaid 
}: AccountPayablesListProps) => {
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    accountId: string;
    paymentDate: string;
    paymentMethod: string;
  }>({
    isOpen: false,
    accountId: "",
    paymentDate: "",
    paymentMethod: ""
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Pago";
      case "pending": return "Pendente";
      case "overdue": return "Vencido";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleMarkAsPaid = () => {
    if (paymentDialog.paymentDate && paymentDialog.paymentMethod) {
      onMarkAsPaid(
        paymentDialog.accountId, 
        paymentDialog.paymentDate, 
        paymentDialog.paymentMethod
      );
      setPaymentDialog({
        isOpen: false,
        accountId: "",
        paymentDate: "",
        paymentMethod: ""
      });
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-4">
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Nenhuma conta encontrada
            </p>
          </CardContent>
        </Card>
      ) : (
        accounts.map((account) => (
          <Card key={account.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {account.description}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {formatCurrency(account.amount)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className={isOverdue(account.due_date, account.status) ? "text-red-600 font-medium" : ""}>
                            Vence: {formatDate(account.due_date)}
                          </span>
                        </div>
                        
                        {account.supplier && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{account.supplier}</span>
                          </div>
                        )}
                        
                        {account.payment_date && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Pago em: {formatDate(account.payment_date)}</span>
                          </div>
                        )}
                      </div>
                      
                      {account.category && (
                        <div className="flex items-center gap-2 mt-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: account.category.color }}
                          />
                          <span className="text-sm text-gray-600">
                            {account.category.name}
                          </span>
                        </div>
                      )}
                      
                      {account.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {account.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(account.status)}>
                        {getStatusText(account.status)}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(account)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          
                          {account.status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => setPaymentDialog({
                                isOpen: true,
                                accountId: account.id,
                                paymentDate: new Date().toISOString().split('T')[0],
                                paymentMethod: ""
                              })}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => onDelete(account.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Dialog para marcar como pago */}
      <Dialog 
        open={paymentDialog.isOpen} 
        onOpenChange={(open) => setPaymentDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Pago</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Data do Pagamento</label>
              <Input
                type="date"
                value={paymentDialog.paymentDate}
                onChange={(e) => setPaymentDialog(prev => ({ 
                  ...prev, 
                  paymentDate: e.target.value 
                }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select 
                value={paymentDialog.paymentMethod}
                onValueChange={(value) => setPaymentDialog(prev => ({ 
                  ...prev, 
                  paymentMethod: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleMarkAsPaid} className="flex-1">
                Confirmar Pagamento
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPaymentDialog(prev => ({ ...prev, isOpen: false }))}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountPayablesList;
