
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, ImagePlus, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PackagingForm } from "@/components/packaging/PackagingForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Packaging {
  id: string;
  name: string;
  type: string;
  bulkQuantity: number;
  bulkPrice: number;
  unitCost: number;
  imageUrl?: string;
  notes?: string;
}

const PackagingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<Packaging | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packagingToDelete, setPackagingToDelete] = useState<Packaging | null>(null);

  const queryClient = useQueryClient();

  const { data: packagingList = [], isLoading } = useQuery({
    queryKey: ['packaging'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packaging')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        bulkQuantity: item.bulk_quantity,
        bulkPrice: item.bulk_price,
        unitCost: item.unit_cost,
        imageUrl: item.image_url,
        notes: item.notes,
      }));
    }
  });

  const createPackagingMutation = useMutation({
    mutationFn: async (packaging: Omit<Packaging, "id">) => {
      const { data, error } = await supabase
        .from("packaging")
        .insert({
          name: packaging.name,
          type: packaging.type,
          bulk_quantity: packaging.bulkQuantity,
          bulk_price: packaging.bulkPrice,
          unit_cost: packaging.bulkQuantity > 0 ? packaging.bulkPrice / packaging.bulkQuantity : 0,
          image_url: packaging.imageUrl || null,
          notes: packaging.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      toast({
        title: "Sucesso",
        description: "Embalagem criada com sucesso!",
      });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Não foi possível criar a embalagem: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updatePackagingMutation = useMutation({
    mutationFn: async ({ id, packaging }: { id: string; packaging: Partial<Omit<Packaging, "id">> }) => {
      let unitCost = undefined;
      if (packaging.bulkQuantity && packaging.bulkPrice) {
        unitCost = packaging.bulkPrice / packaging.bulkQuantity;
      }

      const updateData: any = {
        name: packaging.name,
        type: packaging.type,
        bulk_quantity: packaging.bulkQuantity,
        bulk_price: packaging.bulkPrice,
        unit_cost: unitCost,
        image_url: packaging.imageUrl,
        notes: packaging.notes,
      };

      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const { data, error } = await supabase
        .from("packaging")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      toast({
        title: "Sucesso",
        description: "Embalagem atualizada com sucesso!",
      });
      setDialogOpen(false);
      setEditingPackaging(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar a embalagem: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deletePackagingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("packaging")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging'] });
      toast({
        title: "Sucesso",
        description: "Embalagem excluída com sucesso!",
      });
      setDeleteDialogOpen(false);
      setPackagingToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Não foi possível excluir a embalagem: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const filteredPackaging = packagingList.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPackagingDialog = (packaging?: Packaging) => {
    setEditingPackaging(packaging || null);
    setDialogOpen(true);
  };

  const openDeleteDialog = (packaging: Packaging) => {
    setPackagingToDelete(packaging);
    setDeleteDialogOpen(true);
  };

  const handleSubmitPackaging = async (formData: Omit<Packaging, "id" | "unitCost">) => {
    if (editingPackaging) {
      updatePackagingMutation.mutate({
        id: editingPackaging.id,
        packaging: formData
      });
    } else {
      createPackagingMutation.mutate(formData as Omit<Packaging, "id">);
    }
  };

  const confirmDelete = () => {
    if (packagingToDelete) {
      deletePackagingMutation.mutate(packagingToDelete.id);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-poppins font-semibold">Embalagens</h1>
            <p className="text-muted-foreground">Gerenciamento das embalagens cadastradas.</p>
          </div>
          <Button
            className="bg-food-coral hover:bg-food-amber text-white"
            onClick={() => openPackagingDialog()}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Nova Embalagem
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou tipo..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Embalagens</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-food-coral" />
                <span className="ml-2">Carregando embalagens...</span>
              </div>
            ) : filteredPackaging.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma embalagem encontrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? "Nenhuma embalagem encontrada para sua busca." : "Comece adicionando sua primeira embalagem"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Embalagem</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade/Lote</TableHead>
                    <TableHead>Preço/Lote</TableHead>
                    <TableHead>Preço Unitário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackaging.map((packaging) => (
                    <TableRow key={packaging.id}>
                      <TableCell>
                        <div className="flex gap-2">
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                            {packaging.imageUrl ? (
                              <img 
                                src={packaging.imageUrl} 
                                alt={packaging.name} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{packaging.name}</span>
                            {packaging.notes && (
                              <span className="text-sm text-muted-foreground">{packaging.notes}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{packaging.type}</TableCell>
                      <TableCell>{packaging.bulkQuantity}</TableCell>
                      <TableCell>R$ {packaging.bulkPrice.toFixed(2)}</TableCell>
                      <TableCell>R$ {packaging.unitCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openPackagingDialog(packaging)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(packaging)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingPackaging ? "Editar Embalagem" : "Nova Embalagem"}</DialogTitle>
            <DialogDescription>
              {editingPackaging
                ? "Atualize as informações da embalagem abaixo."
                : "Preencha as informações da nova embalagem."}
            </DialogDescription>
          </DialogHeader>

          <PackagingForm
            packaging={editingPackaging || undefined}
            onSubmit={handleSubmitPackaging}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Embalagem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a embalagem "{packagingToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackagingPage;
