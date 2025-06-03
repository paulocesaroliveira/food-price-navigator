
import React, { useState } from "react";
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
  Filter
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { getAccountsPayable } from "@/services/accountsPayableService";
import type { AccountPayable } from "@/types/accountsPayable";

interface AccountsPayableListPaginatedProps {
  onEdit: (account: AccountPayable) => void;
  onDelete: (id: string) => void;
  refresh?: number;
}

const ITEMS_PER_PAGE = 10;

const AccountsPayableListPaginated = ({ 
  onEdit, 
  onDelete, 
  refresh = 0 
}: AccountsPayableListPaginatedProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  });

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['accounts-payable', refresh, dateFilter],
    queryFn: () => getAccountsPayable(dateFilter)
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Carregando contas...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-8">
          <p className="text-red-600">Erro ao carregar contas: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Lista de Contas</CardTitle>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar contas..."
                className="pl-9 md:w-[250px]"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          {/* Filtros de Data */}
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filtrar por período:</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <Input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                className="w-full md:w-auto"
              />
              <span className="text-sm text-gray-500">até</span>
              <Input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                className="w-full md:w-auto"
              />
              <Button variant="outline" size="sm" onClick={clearDateFilter}>
                Limpar
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
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">Nenhuma conta encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente alterar os termos de busca" : "Comece criando sua primeira conta a pagar"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.description}</TableCell>
                      <TableCell>{account.supplier || '-'}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(account.amount)}
                      </TableCell>
                      <TableCell>{formatDate(account.due_date)}</TableCell>
                      <TableCell>
                        {getStatusBadge(account.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(account)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
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
              <div className="mt-6">
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
    </Card>
  );
};

export default AccountsPayableListPaginated;
