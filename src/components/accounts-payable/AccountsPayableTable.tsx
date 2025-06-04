
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import type { AccountPayable } from "@/types/accountsPayable";

interface AccountsPayableTableProps {
  accounts: AccountPayable[];
  onEdit: (account: AccountPayable) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (account: AccountPayable) => void;
  isLoading?: boolean;
}

export const AccountsPayableTable = ({
  accounts,
  onEdit,
  onDelete,
  onMarkAsPaid,
  isLoading = false
}: AccountsPayableTableProps) => {
  const getStatusIcon = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return due < today ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (status === 'paid') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Pago</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge variant="secondary">Cancelado</Badge>;
    }
    if (status === 'pending' && due < today) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Carregando contas...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma conta encontrada
            </h3>
            <p className="text-gray-500">
              Não há contas a pagar para os filtros selecionados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(account.status, account.due_date)}
                    {getStatusBadge(account.status, account.due_date)}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{account.description}</div>
                    {account.notes && (
                      <div className="text-sm text-gray-500 mt-1">
                        {account.notes}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatCurrency(account.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDate(account.due_date)}
                </TableCell>
                <TableCell>
                  {account.category ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: account.category.color }}
                      />
                      <span className="text-sm">{account.category.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Sem categoria</span>
                  )}
                </TableCell>
                <TableCell>
                  {account.supplier || <span className="text-gray-400 text-sm">-</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {account.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkAsPaid(account)}
                        className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Pagar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(account)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(account.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
