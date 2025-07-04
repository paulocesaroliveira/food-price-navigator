
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  PlusCircle, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp,
  DollarSign,
  Receipt,
  Target,
  ShoppingBag,
  Users
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { getSales, createSale, deleteSale } from "@/services/salesService";
import { getProductList } from "@/services/productService";
import SalesForm from "@/components/sales/SalesForm";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { Link } from "react-router-dom";

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: getSales
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProductList
  });

  const createMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Venda criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao criar venda: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Venda excluída com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir venda: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Calculate summary data
  const totalRevenue = Array.isArray(sales) ? sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) : 0;
  const totalCost = Array.isArray(sales) ? sales.reduce((sum, sale) => sum + (sale.total_cost || 0), 0) : 0;
  const totalSales = Array.isArray(sales) ? sales.filter(sale => sale.status === "completed").length : 0;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const grossProfit = totalRevenue - totalCost;

  // Filter sales based on search term
  const filteredSales = Array.isArray(sales) ? sales.filter(sale =>
    sale.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleDeleteSale = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta venda?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Vendas"
        subtitle="Gerencie vendas e acompanhe performance financeira"
        icon={ShoppingBag}
        gradient="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500"
        badges={[
          { icon: ShoppingBag, text: `${totalSales} vendas` },
          { icon: DollarSign, text: `Receita: ${formatCurrency(totalRevenue)}` },
          { icon: TrendingUp, text: `Lucro: ${formatCurrency(grossProfit)}` }
        ]}
        actions={
          <div className="flex gap-2">
            <Link to="/resale">
              <Button 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto"
              >
                <Users className="h-4 w-4 mr-2" />
                Revendedores
              </Button>
            </Link>
            <Button 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto" 
              onClick={() => setShowForm(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Lucro Bruto</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{formatCurrency(grossProfit)}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total de Vendas</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{totalSales}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{formatCurrency(averageTicket)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Lista de Vendas</CardTitle>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar vendas..."
                className="pl-9 md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando vendas...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente alterar os termos de busca" : "Comece criando sua primeira venda"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.sale_number}</TableCell>
                      <TableCell>{formatDate(sale.sale_date)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(sale.total_amount)}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {formatCurrency(sale.total_cost)}
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatCurrency(sale.gross_profit)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={sale.status === "completed" ? "default" : "secondary"}
                          className={
                            sale.status === "completed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {sale.status === "completed" ? "Concluída" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteSale(sale.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Sales Form Dialog */}
      <SalesForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={(saleData) => createMutation.mutate(saleData)}
        products={products}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};

export default Sales;


