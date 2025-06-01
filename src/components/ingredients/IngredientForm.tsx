import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIngredientCategories } from "@/services/categoryService";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Ingredient {
  id?: string;
  name: string;
  category_id?: string;
  unit: string;
  brand: string;
  supplier?: string;
  package_quantity: number;
  package_price: number;
  unit_cost: number;
  image_url?: string;
}

interface IngredientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient | null;
  onSuccess?: () => void;
}

export const IngredientForm: React.FC<IngredientFormProps> = ({
  open,
  onOpenChange,
  ingredient,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Ingredient>({
    name: "",
    category_id: "",
    unit: "",
    brand: "",
    supplier: "",
    package_quantity: 0,
    package_price: 0,
    unit_cost: 0,
    image_url: ""
  });

  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: getIngredientCategories
  });

  // Populate form when editing
  useEffect(() => {
    if (ingredient && open) {
      setFormData({
        name: ingredient.name || "",
        category_id: ingredient.category_id || "",
        unit: ingredient.unit || "",
        brand: ingredient.brand || "",
        supplier: ingredient.supplier || "",
        package_quantity: ingredient.package_quantity || 0,
        package_price: ingredient.package_price || 0,
        unit_cost: ingredient.unit_cost || 0,
        image_url: ingredient.image_url || ""
      });
    } else if (!ingredient && open) {
      // Reset form for new ingredient
      setFormData({
        name: "",
        category_id: "",
        unit: "",
        brand: "",
        supplier: "",
        package_quantity: 0,
        package_price: 0,
        unit_cost: 0,
        image_url: ""
      });
    }
  }, [ingredient, open]);

  // Calculate unit cost when package data changes
  useEffect(() => {
    if (formData.package_quantity > 0 && formData.package_price > 0) {
      const unitCost = formData.package_price / formData.package_quantity;
      setFormData(prev => ({ ...prev, unit_cost: Number(unitCost.toFixed(4)) }));
    }
  }, [formData.package_quantity, formData.package_price]);

  const createMutation = useMutation({
    mutationFn: async (data: Ingredient) => {
      const { data: result, error } = await supabase
        .from('ingredients')
        .insert([{
          name: data.name,
          category_id: data.category_id || null,
          unit: data.unit,
          brand: data.brand,
          supplier: data.supplier,
          package_quantity: data.package_quantity,
          package_price: data.package_price,
          unit_cost: data.unit_cost,
          image_url: data.image_url
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Ingrediente criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar ingrediente: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Ingredient) => {
      if (!ingredient?.id) throw new Error('ID do ingrediente não encontrado');
      
      const { data: result, error } = await supabase
        .from('ingredients')
        .update({
          name: data.name,
          category_id: data.category_id || null,
          unit: data.unit,
          brand: data.brand,
          supplier: data.supplier,
          package_quantity: data.package_quantity,
          package_price: data.package_price,
          unit_cost: data.unit_cost,
          image_url: data.image_url
        })
        .eq('id', ingredient.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Ingrediente atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar ingrediente: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (ingredient) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = async (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {ingredient ? 'Editar' : 'Novo'} Ingrediente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do ingrediente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="g">Grama (g)</SelectItem>
                  <SelectItem value="l">Litro (l)</SelectItem>
                  <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  <SelectItem value="unidade">Unidade</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                  <SelectItem value="pacote">Pacote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Marca do ingrediente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                placeholder="Fornecedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_quantity">Quantidade da Embalagem *</Label>
              <Input
                id="package_quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.package_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, package_quantity: parseFloat(e.target.value) || 0 }))}
                placeholder="Ex: 1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_price">Preço da Embalagem (R$) *</Label>
              <Input
                id="package_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.package_price}
                onChange={(e) => setFormData(prev => ({ ...prev, package_price: parseFloat(e.target.value) || 0 }))}
                placeholder="Ex: 25.90"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_cost">Custo Unitário (R$)</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.0001"
                value={formData.unit_cost}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">Calculado automaticamente</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagem URL</Label>
            <Input
              type="url"
              value={formData.image_url}
              onChange={(e) => handleImageUpload(e.target.value)}
              placeholder="URL da imagem do ingrediente"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (ingredient ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
