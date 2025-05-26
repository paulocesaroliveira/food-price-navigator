
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Users, 
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  ShoppingCart
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  commission: number;
  totalSales: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface ResaleTransaction {
  id: string;
  sellerId: string;
  sellerName: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  commission: number;
  status: 'pending' | 'delivered' | 'paid';
  date: string;
  notes?: string;
}

const Resale = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // Mock data
  const [sellers] = useState<Seller[]>([
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-9999",
      commission: 15,
      totalSales: 2500,
      status: 'active',
      joinDate: "2024-01-15"
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@email.com",
      phone: "(11) 88888-8888",
      commission: 12,
      totalSales: 1800,
      status: 'active',
      joinDate: "2024-02-01"
    }
  ]);

  const [transactions] = useState<ResaleTransaction[]>([
    {
      id: "T001",
      sellerId: "1",
      sellerName: "Maria Silva",
      products: [
        { id: "P1", name: "Bolo de Chocolate", quantity: 5, unitPrice: 25, total: 125 },
        { id: "P2", name: "Doce de Leite", quantity: 10, unitPrice: 8, total: 80 }
      ],
      totalAmount: 205,
      commission: 30.75,
      status: 'delivered',
      date: "2024-01-20",
      notes: "Entrega para evento corporativo"
    }
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "delivered": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const SellerForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cadastrar Novo Vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sellerName">Nome Completo</Label>
            <Input id="sellerName" placeholder="Nome do vendedor" />
          </div>
          <div>
            <Label htmlFor="sellerEmail">Email</Label>
            <Input id="sellerEmail" type="email" placeholder="email@exemplo.com" />
          </div>
          <div>
            <Label htmlFor="sellerPhone">Telefone</Label>
            <Input id="sellerPhone" placeholder="(11) 99999-9999" />
          </div>
          <div>
            <Label htmlFor="commission">Comissão (%)</Label>
            <Input id="commission" type="number" placeholder="15" />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" placeholder="Informações adicionais sobre o vendedor" />
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => {
            toast({ title: "Sucesso", description: "Vendedor cadastrado com sucesso!" });
            setShowSellerForm(false);
          }}>
            Cadastrar Vendedor
          </Button>
          <Button variant="outline" onClick={() => setShowSellerForm(false)}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const TransactionForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Nova Transação de Revenda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transactionSeller">Vendedor</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o vendedor" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="transactionDate">Data</Label>
            <Input id="transactionDate" type="date" />
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-4">Produtos</h4>
          <div className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Produto</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bolo-chocolate">Bolo de Chocolate</SelectItem>
                    <SelectItem value="doce-leite">Doce de Leite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade</Label>
                <Input type="number" placeholder="1" />
              </div>
              <div>
                <Label>Preço Unitário</Label>
                <Input type="number" placeholder="25.00" />
              </div>
              <div className="flex items-end">
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="transactionNotes">Observações</Label>
          <Textarea id="transactionNotes" placeholder="Informações sobre a transação" />
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={() => {
            toast({ title: "Sucesso", description: "Transação registrada com sucesso!" });
            setShowTransactionForm(false);
          }}>
            Registrar Transação
          </Button>
          <Button variant="outline" onClick={() => setShowTransactionForm(false)}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Revenda</h1>
          <p className="text-muted-foreground">Gerencie vendedores e transações de revenda</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowSellerForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Vendedor
          </Button>
          <Button onClick={() => setShowTransactionForm(true)}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers.length}</div>
            <p className="text-xs text-muted-foreground">
              {sellers.filter(s => s.status === 'active').length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(4300)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(645)}</div>
            <p className="text-xs text-muted-foreground">
              Para 2 vendedores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações Pendentes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Aguardando entrega
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      {showSellerForm && <SellerForm />}
      {showTransactionForm && <TransactionForm />}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vendedores ou transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="sellers">Vendedores</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações de Revenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{transaction.id}</span>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status === 'pending' ? 'Pendente' :
                             transaction.status === 'delivered' ? 'Entregue' : 'Pago'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Vendedor: {transaction.sellerName} • {transaction.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total:</span>
                        <p>{formatCurrency(transaction.totalAmount)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Comissão:</span>
                        <p>{formatCurrency(transaction.commission)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Produtos:</span>
                        <p>{transaction.products.length} itens</p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <p className="capitalize">{transaction.status}</p>
                      </div>
                    </div>

                    {transaction.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Observações: </span>
                        <span className="text-sm">{transaction.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendedores Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <div key={seller.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{seller.name}</h3>
                          <Badge className={getStatusColor(seller.status)}>
                            {seller.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Email:</span>
                            <p>{seller.email}</p>
                          </div>
                          <div>
                            <span className="font-medium">Telefone:</span>
                            <p>{seller.phone}</p>
                          </div>
                          <div>
                            <span className="font-medium">Comissão:</span>
                            <p>{seller.commission}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Total Vendas:</span>
                            <p>{formatCurrency(seller.totalSales)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resale;
