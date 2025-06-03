
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Calendar,
  FileText,
  DollarSign,
  CheckSquare
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { getAccountsPayable, markAsPaid } from "@/services/accountsPayableService";
import type { AccountPayable } from "@/types/accountsPayable";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface AccountsPayableListPaginatedProps {
  onEdit: (account: AccountPayable) => void;
  onDelete: (id: string) => void;
  refresh?: number;
  defaultStatus?: string;
}

const ITEMS_PER_PAGE = 10;

const AccountsPayableListPaginated = ({ 
  onEdit, 
  onDelete, 
  refresh = 0,
  defaultStatus
}: AccountsPayableListPaginatedProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  
  const [dateFilter, setDateFilter] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      status: defaultStatus || ""
    };
  });

  // Atualizar filtro de status quando a prop defaultStatus mudar
  useEffect(() => {
    setDateFilter(prev => ({...prev, status: defaultStatus || ""}));
  }, [defaultStatus]);

  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['accounts-payable', refresh, dateFilter],
    queryFn: () => getAccountsPayable(dateFilter)
  });

  useEffect(() => {
    refetch();
  }, [refresh, refetch]);

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account =>
    account.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'pending';
    
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Pago</Badge>;
    } else if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Vencido</Badge>;
    } else if (status === 'cancelled') {
      return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">Cancelado</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" />Pendente</Badge>;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDateFilterChange = (field: 'startDate' | 'endDate' | 'status', value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateFilter({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      status: defaultStatus || ""
    });
    setCurrentPage(1);
  };

  const handleOpenPaymentDialog = (account) => {
    setSelectedAccount(account);
    setShowPaymentDialog(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedAccount) return;
    
    const success = await markAsPaid(selectedAccount.id, paymentDate, paymentMethod);
    
    if (success) {
      refetch();
      setShowPaymentDialog(false);
    }
  };

  const categoryColors = {};
  accounts.forEach(account => {
    if (account.category?.id && account.category?.color) {
      categoryColors[account.category.id] = account.category.color;
    }
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-b-purple-500 border-l-purple-200 border-r-purple-200 animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando contas...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg bg-red-50">
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium text-lg">Erro ao carregar contas</p>
          <p className="text-red-500">{error.message}</p>
          <Button className="mt-4" onClick={() => refetch()} variant="outline">Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Lista de Contas
            </CardTitle>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar contas..."
                className="pl-9 md:w-[280px]"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          {/* Filtros de Data - visualmente melhorados */}
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-slate-50 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Filtrar por período:</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 grow">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                  className="w-full md:w-auto"
                />
              </div>
              <span className="text-sm text-gray-500">até</span>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                  className="w-full md:w-auto"
                />
              </div>
              
              {!defaultStatus && (
                <Select 
                  value={dateFilter.status} 
                  onValueChange={(value) => handleDateFilterChange('status', value)}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="paid">Pagos</SelectItem>
                    <SelectItem value="overdue">Vencidos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Button variant="outline" size="sm" onClick={clearDateFilter} className="ml-auto">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
        
        {filteredAccounts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Mostrando {Math.min(startIndex + 1, filteredAccounts.length)}-{Math.min(endIndex, filteredAccounts.length)} de {filteredAccounts.length} contas
          </p>
        )}
      </CardHeader>
      <CardContent>
        {currentAccounts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Nenhuma conta encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              {searchTerm ? 
                "Tente alterar os termos de busca ou filtros aplicados" : 
                "Não há contas registradas para o período selecionado. Comece criando sua primeira conta a pagar."}
            </p>
            <Button 
              className="mt-6 gap-2" 
              variant="outline" 
              onClick={() => clearDateFilter()}
            >
              <Calendar className="h-4 w-4" /> Ver todos os períodos
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-medium">Descrição</TableHead>
                    <TableHead className="font-medium">Categoria</TableHead>
                    <TableHead className="font-medium">Fornecedor</TableHead>
                    <TableHead className="font-medium">Valor</TableHead>
                    <TableHead className="font-medium">Vencimento</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="text-right font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAccounts.map((account) => (
                    <TableRow key={account.id} className="group hover:bg-slate-50">
                      <TableCell className="font-medium">{account.description}</TableCell>
                      <TableCell>
                        {account.category ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: account.category.color || '#CBD5E0' }}
                            />
                            <span>{account.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{account.supplier || '-'}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(account.amount)}
                      </TableCell>
                      <TableCell>{formatDate(account.due_date)}</TableCell>
                      <TableCell>
                        {getStatusBadge(account.status, account.due_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {account.status !== 'paid' && (
                              <DropdownMenuItem 
                                onClick={() => handleOpenPaymentDialog(account)}
                                className="text-green-600 focus:text-green-600"
                              >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Marcar como paga
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem onClick={() => onEdit(account)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => onDelete(account.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Dialog para marcar como pago */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Marcar como Pago
            </DialogTitle>
            <DialogDescription>
              Preencha as informações de pagamento abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium col-span-1" htmlFor="payment-date">
                Data
              </label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium col-span-1" htmlFor="payment-method">
                Método
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Método de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Métodos de Pagamento</SelectLabel>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {selectedAccount && (
              <div className="bg-green-50 p-3 rounded-md mt-2 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{selectedAccount.description}</h4>
                  <p className="text-sm text-gray-500">
                    Vencimento: {formatDate(selectedAccount.due_date)}
                  </p>
                </div>
                <div className="font-bold text-green-700">
                  {formatCurrency(selectedAccount.amount)}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMarkAsPaid} className="gap-2">
              <DollarSign className="h-4 w-4" />
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AccountsPayableListPaginated;
