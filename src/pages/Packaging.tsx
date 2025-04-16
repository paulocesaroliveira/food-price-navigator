
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  PlusCircle, 
  Search, 
  Pencil, 
  Trash2, 
  FilterX,
  Filter
} from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PackagingForm } from "@/components/packaging/PackagingForm";
import { DeletePackagingDialog } from "@/components/packaging/DeletePackagingDialog";
import { useToast } from "@/hooks/use-toast";
import { Packaging as PackagingType } from "@/types";
import { 
  getPackagingList, 
  createPackaging, 
  updatePackaging, 
  deletePackaging,
  searchPackaging
} from "@/services/packagingService";

const Packaging = () => {
  const [packagingList, setPackagingList] = useState<PackagingType[]>([]);
  const [filteredList, setFilteredList] = useState<PackagingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPackaging, setCurrentPackaging] = useState<PackagingType | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packagingToDelete, setPackagingToDelete] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  // Carregar lista de embalagens
  const loadPackagingList = async () => {
    try {
      setLoading(true);
      const data = await getPackagingList();
      setPackagingList(data);
      setFilteredList(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar embalagens",
        description: "Não foi possível carregar a lista de embalagens.",
        variant: "destructive",
      });
      console.error("Erro ao carregar embalagens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackagingList();
  }, []);

  // Filtragem e pesquisa
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredList(packagingList);
      return;
    }

    try {
      const results = await searchPackaging(searchQuery);
      setFilteredList(results);
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      toast({
        title: "Erro na pesquisa",
        description: "Não foi possível realizar a pesquisa.",
        variant: "destructive",
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredList(packagingList);
  };

  // Gerenciamento do formulário
  const openNewPackagingForm = () => {
    setCurrentPackaging(undefined);
    setIsFormOpen(true);
  };

  const openEditPackagingForm = (packaging: PackagingType) => {
    setCurrentPackaging(packaging);
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setCurrentPackaging(undefined);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (currentPackaging) {
        // Editar embalagem existente
        await updatePackaging(currentPackaging.id, {
          ...formData,
          image: formData.image || currentPackaging.image,
        });
        toast({
          title: "Embalagem atualizada",
          description: "A embalagem foi atualizada com sucesso.",
        });
      } else {
        // Criar nova embalagem
        await createPackaging(formData);
        toast({
          title: "Embalagem adicionada",
          description: "A nova embalagem foi adicionada com sucesso.",
        });
      }
      setIsFormOpen(false);
      setCurrentPackaging(undefined);
      loadPackagingList();
    } catch (error) {
      console.error("Erro ao salvar embalagem:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a embalagem.",
        variant: "destructive",
      });
    }
  };

  // Gerenciamento de exclusão
  const openDeleteConfirmation = (id: string, name: string) => {
    setPackagingToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packagingToDelete) return;

    try {
      await deletePackaging(packagingToDelete.id);
      toast({
        title: "Embalagem excluída",
        description: "A embalagem foi excluída com sucesso.",
      });
      loadPackagingList();
    } catch (error) {
      console.error("Erro ao excluir embalagem:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a embalagem.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPackagingToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Embalagens
        </h1>
        <Button className="gap-2" onClick={openNewPackagingForm}>
          <PlusCircle className="h-4 w-4" />
          Nova Embalagem
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Cadastre embalagens com seu custo para adicionar ao valor final do produto.
      </p>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Lista de Embalagens</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar embalagem..."
                  className="pl-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                variant="outline" 
                size="icon"
                onClick={handleSearch}
                title="Pesquisar"
              >
                <Search className="h-4 w-4" />
              </Button>
              {searchQuery && (
                <Button
                  variant="outline" 
                  size="icon"
                  onClick={clearSearch}
                  title="Limpar pesquisa"
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                title="Filtros"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="bg-muted p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtros podem ser adicionados aqui no futuro */}
                <p className="text-muted-foreground">Filtros avançados serão implementados em breve.</p>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Qtd. Fardo</TableHead>
                  <TableHead>Preço Fardo</TableHead>
                  <TableHead>Custo Unitário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p>Carregando embalagens...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <p className="text-muted-foreground">Nenhuma embalagem encontrada.</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={openNewPackagingForm}
                      >
                        Adicionar embalagem
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredList.map((pkg) => (
                    <TableRow key={pkg.id} className="hover:bg-muted/50">
                      <TableCell>
                        {pkg.image ? (
                          <div className="h-10 w-10 rounded-md overflow-hidden">
                            <img 
                              src={pkg.image} 
                              alt={pkg.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.type}</TableCell>
                      <TableCell>{pkg.bulkQuantity}</TableCell>
                      <TableCell>{formatCurrency(pkg.bulkPrice)}</TableCell>
                      <TableCell>{formatCurrency(pkg.unitCost)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditPackagingForm(pkg)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => openDeleteConfirmation(pkg.id, pkg.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentPackaging ? "Editar Embalagem" : "Nova Embalagem"}
            </DialogTitle>
          </DialogHeader>
          <PackagingForm
            packaging={currentPackaging}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <DeletePackagingDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        packagingName={packagingToDelete?.name || ""}
      />
    </div>
  );
};

export default Packaging;
