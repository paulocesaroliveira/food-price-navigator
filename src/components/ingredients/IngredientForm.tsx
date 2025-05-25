
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ImageUpload } from "./ImageUpload";

interface IngredientFormProps {
  ingredient?: any;
  onSave: () => void;
  onCancel: () => void;
}

export const IngredientForm = ({ ingredient, onSave, onCancel }: IngredientFormProps) => {
  const { toast } = useToast();
  const { uploadFile, isUploading } = useFileUpload();
  
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    unit: "g" as "g" | "ml",
    brand: "",
    supplier: "",
    package_quantity: 0,
    package_price: 0,
    unit_cost: 0,
    image_url: ""
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
    if (ingredient) {
      setFormData({
        name: ingredient.name || "",
        category_id: ingredient.category_id || "",
        unit: ingredient.unit || "g",
        brand: ingredient.brand || "",
        supplier: ingredient.supplier || "",
        package_quantity: ingredient.package_quantity || 0,
        package_price: ingredient.package_price || 0,
        unit_cost: ingredient.unit_cost || 0,
        image_url: ingredient.image_url || ""
      });
    }
  }, [ingredient]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalcular custo unitário quando preço ou quantidade mudar
      if (field === 'package_price' || field === 'package_quantity') {
        const price = field === 'package_price' ? value : updated.package_price;
        const quantity = field === 'package_quantity' ? value : updated.package_quantity;
        updated.unit_cost = quantity > 0 ? price / quantity : 0;
      }
      
      return updated;
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadFile(file, "ingredients");
      if (result && typeof result === 'object' && 'url' in result) {
        setFormData(prev => ({ ...prev, image_url: result.url }));
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do ingrediente é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      if (ingredient) {
        // Atualizar ingrediente existente
        const { error } = await supabase
          .from('ingredients')
          .update({
            name: formData.name,
            category_id: formData.category_id,
            unit: formData.unit,
            brand: formData.brand,
            supplier: formData.supplier,
            package_quantity: formData.package_quantity,
            package_price: formData.package_price,
            unit_cost: formData.unit_cost,
            image_url: formData.image_url
          })
          .eq('id', ingredient.id);

        if (error) throw error;
      } else {
        // Criar novo ingrediente
        const { error } = await supabase
          .from('ingredients')
          .insert({
            name: formData.name,
            category_id: formData.category_id,
            unit: formData.unit,
            brand: formData.brand,
            supplier: formData.supplier,
            package_quantity: formData.package_quantity,
            package_price: formData.package_price,
            unit_cost: formData.unit_cost,
            image_url: formData.image_url
          });

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `Ingrediente ${ingredient ? 'atualizado' : 'criado'} com sucesso`,
      });

      onSave();
    } catch (error: any) {
      console.error("Erro ao salvar ingrediente:", error);
      toast({
        title: "Erro",
        description: `Não foi possível ${ingredient ? 'atualizar' : 'criar'} o ingrediente: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{ingredient ? 'Editar' : 'Novo'} Ingrediente</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do ingrediente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleInputChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Marca do ingrediente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Fornecedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value: "g" | "ml") => handleInputChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">Gramas (g)</SelectItem>
                  <SelectItem value="ml">Mililitros (ml)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_quantity">Quantidade da Embalagem</Label>
              <Input
                id="package_quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.package_quantity}
                onChange={(e) => handleInputChange('package_quantity', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_price">Preço da Embalagem (R$)</Label>
              <Input
                id="package_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.package_price}
                onChange={(e) => handleInputChange('package_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_cost">Custo Unitário (R$)</Label>
              <Input
                id="unit_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost.toFixed(4)}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagem</Label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUpload={handleImageUpload}
              isUploading={isUploading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {ingredient ? 'Atualizar' : 'Criar'} Ingrediente
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
