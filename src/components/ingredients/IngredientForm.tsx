
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { formatCurrency } from "@/utils/calculations";

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
      console.log('Loading ingredient data:', ingredient);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      console.log('Loaded categories:', data);
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    console.log('Updating field:', field, 'with value:', value);
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'package_price' || field === 'package_quantity') {
        const price = field === 'package_price' ? value : updated.package_price;
        const quantity = field === 'package_quantity' ? value : updated.package_quantity;
        updated.unit_cost = quantity > 0 ? price / quantity : 0;
      }
      
      console.log('Updated formData:', updated);
      return updated;
    });
  };

  const handlePriceChange = (value: number) => {
    handleInputChange('package_price', value);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadFile(file, "ingredients");
      if (result?.url) {
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
    
    console.log('Submitting form with data:', formData);
    
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const dataToSave = {
        name: formData.name,
        category_id: formData.category_id,
        unit: formData.unit,
        brand: formData.brand,
        supplier: formData.supplier,
        package_quantity: formData.package_quantity,
        package_price: formData.package_price,
        unit_cost: formData.unit_cost,
        image_url: formData.image_url
      };

      console.log('Data to save:', dataToSave);

      if (ingredient) {
        const { error } = await supabase
          .from('ingredients')
          .update(dataToSave)
          .eq('id', ingredient.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ingredients')
          .insert(dataToSave);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <Card className="max-w-4xl mx-auto border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {ingredient ? 'Editar' : 'Novo'} Ingrediente
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-semibold">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome do ingrediente"
                  required
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className="text-lg font-semibold">Categoria *</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger className="h-12 text-lg">
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

              <div className="space-y-3">
                <Label htmlFor="brand" className="text-lg font-semibold">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Marca do ingrediente"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="supplier" className="text-lg font-semibold">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Fornecedor"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="unit" className="text-lg font-semibold">Unidade</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value: "g" | "ml") => handleInputChange('unit', value)}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Gramas (g)</SelectItem>
                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="package_quantity" className="text-lg font-semibold">Quantidade da Embalagem</Label>
                <Input
                  id="package_quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.package_quantity}
                  onChange={(e) => handleInputChange('package_quantity', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="package_price" className="text-lg font-semibold">Preço da Embalagem (R$)</Label>
                <CurrencyInput
                  id="package_price"
                  value={formData.package_price}
                  onValueChange={handlePriceChange}
                  placeholder="R$ 0,00"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="unit_cost" className="text-lg font-semibold">Custo Unitário (R$)</Label>
                <Input
                  id="unit_cost"
                  value={formatCurrency(formData.unit_cost)}
                  readOnly
                  className="bg-muted h-12 text-lg font-semibold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold">Imagem</Label>
              <ImageUpload
                currentImageUrl={formData.image_url}
                onImageUpload={handleImageUpload}
                isUploading={isUploading}
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || isUploading}
                className="h-12 px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isSaving ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {ingredient ? 'Atualizar' : 'Criar'} Ingrediente
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
