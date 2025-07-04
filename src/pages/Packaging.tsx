import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Package2, Box } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PackagingForm } from "@/components/packaging/PackagingForm";
import { DeletePackagingDialog } from "@/components/packaging/DeletePackagingDialog";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/calculations";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle } from "@/components/shared/ViewToggle";

const Packaging = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState(null);
  const [deletingPackaging, setDeletingPackaging] = useState(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();

  // Query para buscar embalagens
  const { data: packaging = [], isLoading } = useQuery({
    queryKey: ['packaging'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('packaging')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredPackaging = packaging.filter(pack =>
    pack.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalPackaging = packaging.length;

  const handleEdit = (pack: any) => {
    setEditingPackaging(pack);
    setShowForm(true);
  };

  const handleDelete = (pack: any) => {
    setDeletingPackaging(pack);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (editingPackaging) {
        // Atualizar embalagem
        const { error } = await supabase
          .from('packaging')
          .update({
            name: data.name,
            type: data.type,
            bulk_quantity: data.bulkQuantity,
            bulk_price: data.bulkPrice,
            unit_cost: data.bulkQuantity > 0 ? data.bulkPrice / data.bulkQuantity : 0,
            notes: data.notes
          })
          .eq('id', editingPackaging.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "✨ Sucesso",
          description: "Embalagem atualizada com sucesso!",
        });
      } else {
        // Criar nova embalagem
        const { error } = await supabase
          .from('packaging')
          .insert({
            user_id: user.id,
            name: data.name,
            type: data.type,
            bulk_quantity: data.bulkQuantity,
            bulk_price: data.bulkPrice,
            unit_cost: data.bulkQuantity > 0 ? data.bulkPrice / data.bulkQuantity : 0,
            notes: data.notes
          });

        if (error) throw error;

        toast({
          title: "✨ Sucesso",
          description: "Embalagem criada com sucesso!",
        });
      }

      setShowForm(false);
      setEditingPackaging(null);
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: `Erro ao salvar embalagem: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPackaging) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('packaging')
        .delete()
        .eq('id', deletingPackaging.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "✨ Sucesso",
        description: "Embalagem excluída com sucesso!",
      });

      setDeletingPackaging(null);
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: `Erro ao excluir embalagem: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="custom-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : filteredPackaging.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Package2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">Nenhuma embalagem encontrada</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente alterar os termos de busca" : "Comece criando sua primeira embalagem"}
          </p>
          {!searchTerm && (
            <Button 
              className="mt-4 btn-gradient"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Embalagem
            </Button>
          )}
        </div>
      ) : (
        filteredPackaging.map((pack) => (
          <Card key={pack.id} className="custom-card card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{pack.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{pack.type}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade (bulk):</span>
                  <span className="font-medium">{pack.bulk_quantity} unidades</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço bulk:</span>
                  <span className="font-medium text-green-600">{formatCurrency(pack.bulk_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo unitário:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(pack.unit_cost)}</span>
                </div>
                {pack.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Observações:</span>
                    <p className="text-sm mt-1 line-clamp-2">{pack.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(pack)}
                  className="rounded-full"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(pack)}
                  className="text-red-500 hover:text-red-700 rounded-full"
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredPackaging.map((pack) => (
        <Card key={pack.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{pack.name}</h3>
                <p className="text-sm text-purple-600">{pack.type}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {pack.bulk_quantity} unidades
              </div>
              <div className="text-sm font-medium text-green-600 min-w-0">
                {formatCurrency(pack.bulk_price)}
              </div>
              <div className="text-sm font-medium text-blue-600 min-w-0">
                {formatCurrency(pack.unit_cost)}
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(pack)}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(pack)}
                className="text-red-500 hover:text-red-700"
              >
                Excluir
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Embalagens"
        subtitle="Gerencie embalagens e tipos de packaging"
        icon={Package2}
        gradient="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500"
        badges={[
          { icon: Box, text: `${totalPackaging} embalagens` }
        ]}
        actions={
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Plus className="mr-2 h-4 w-4" />
                Nova Embalagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPackaging ? 'Editar' : 'Nova'} Embalagem
                </DialogTitle>
              </DialogHeader>
              <PackagingForm
                packaging={editingPackaging}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingPackaging(null);
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Controles de busca e visualização */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <Input
            placeholder="Buscar embalagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-focus"
          />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Lista de Embalagens */}
      {view === 'grid' ? renderGridView() : renderListView()}

      {/* Dialog de Confirmação de Exclusão */}
      {deletingPackaging && (
        <DeletePackagingDialog
          open={!!deletingPackaging}
          onOpenChange={(open) => {
            if (!open) setDeletingPackaging(null);
          }}
          onConfirm={handleDeleteConfirm}
          packagingName={deletingPackaging.name}
        />
      )}
    </div>
  );
};

export default Packaging;
