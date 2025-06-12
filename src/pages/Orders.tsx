
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import NewOrderForm from "@/components/orders/NewOrderForm";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/calculations";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(id, name),
          items:order_items(
            id,
            product_id,
            quantity,
            price_at_order,
            total_price,
            product:products(id, name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'Novo' || order.status === 'Em Andamento').length;
  const totalValue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);

  const handleOrderCreated = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        subtitle="Gerencie seus pedidos e entregas com eficiência"
        icon={ShoppingCart}
        gradient="from-purple-500 to-pink-600"
        actions={
          <Button 
            onClick={() => setShowForm(true)}
            className="btn-gradient"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar pedidos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-focus"
        />
      </div>

      {showForm ? (
        <Card className="custom-card">
          <CardHeader>
            <CardTitle>Novo Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <NewOrderForm
              onOrderCreated={handleOrderCreated}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="custom-card">
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Nenhum pedido registrado ainda.</p>
                <Button 
                  className="mt-4 btn-gradient"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Pedido
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium">#{order.order_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.name} • {order.status}
                      </p>
                      {order.scheduled_date && (
                        <p className="text-xs text-purple-600">
                          Agendado: {new Date(order.scheduled_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;
