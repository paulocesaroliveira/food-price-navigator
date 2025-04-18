import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, ImagePlus, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Packaging } from "@/types";
import { createPackaging, getPackagingList, updatePackaging, deletePackaging, searchPackaging } from "@/services/packagingService";
import { uploadFile } from "@/integrations/supabase/storage";
import { PackagingForm } from "@/components/packaging/PackagingForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const PackagingPage = () => {
  const [packagingList, setPackagingList] = useState<Packaging[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<Packaging | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packagingToDelete, setPackagingToDelete] = useState<Packaging | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<Packaging | null>(null);

  const fetchPackagingList = async () => {
    setLoading(true);
    const data = await getPackagingList();
    setPackagingList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPackagingList();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery) {
        const results = await searchPackaging(searchQuery);
        setPackagingList(results);
      } else {
        fetchPackagingList();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openPackagingDialog = (packaging?: Packaging) => {
    setEditingPackaging(packaging || null);
    setDialogOpen(true);
    setSelectedPackaging(packaging || null);
  };

  const openDeleteDialog = (packaging: Packaging) => {
    setPackagingToDelete(packaging);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (packagingToDelete) {
      const success = await deletePackaging(packagingToDelete.id);
      if (success) {
        setPackagingList(prev => prev.filter(p => p.id !== packagingToDelete.id));
        setDeleteDialogOpen(false);
        setPackagingToDelete(null);
      }
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
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-food-coral" />
                <span className="ml-2">Carregando embalagens...</span>
              </div>
            ) : packagingList.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma embalagem encontrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Comece adicionando sua primeira embalagem
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Embalagem</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preço Unitário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packagingList.map((packaging) => (
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
                            <span className="text-sm text-muted-foreground">{packaging.type}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{packaging.type}</TableCell>
                      <TableCell>R$ {packaging.unitCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedPackaging(packaging);
                              openPackagingDialog(packaging);
                            }}
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
            editingPackaging={editingPackaging}
            onClose={() => {
              setDialogOpen(false);
              fetchPackagingList();
            }}
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
