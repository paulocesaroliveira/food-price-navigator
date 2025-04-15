import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  PlusCircle,
  Trash2,
  Upload,
  X,
  Loader2,
  PercentIcon
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/calculations";
import { useFileUpload } from "@/hooks/useFileUpload";
import { 
  RecipeCategoryDialog 
} from "@/components/recipes/RecipeCategoryDialog";
import { 
  IngredientCompositionChart 
} from "@/components/recipes/IngredientCompositionChart";
import { fetchRecipeWithIngredients } from "@/services/recipeService";

interface RecipeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingRecipe?: any;
  categories: any[];
  ingredients: any[];
}

const RecipeForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  editingRecipe, 
  categories,
  ingredients
}: RecipeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { uploadFile, isUploading } = useFileUpload();
  
  const form = useForm({
    defaultValues: {
      name: "",
      image_url: "",
      category_id: "",
      baseIngredients: [{ ingredient_id: "", quantity: "0", cost: "0" }],
      portionIngredients: [{ ingredient_id: "", quantity: "0", cost: "0" }],
      portions: "1",
      notes: ""
    }
  });

  const { fields: baseFields, append: appendBase, remove: removeBase } = 
    useFieldArray({ control: form.control, name: "baseIngredients" });
  
  const { fields: portionFields, append: appendPortion, remove: removePortion } = 
    useFieldArray({ control: form.control, name: "portionIngredients" });

  const baseIngredients = form.watch("baseIngredients");
  const portionIngredients = form.watch("portionIngredients");
  const portions = form.watch("portions");

  const baseTotalCost = baseIngredients.reduce(
    (sum, { cost }) => sum + (parseFloat(cost) || 0), 
    0
  );
  
  const portionTotalCost = portionIngredients.reduce(
    (sum, { cost }) => sum + (parseFloat(cost) || 0), 
    0
  );
  
  const totalCost = baseTotalCost + portionTotalCost;
  const unitCost = parseFloat(portions) > 0 ? totalCost / parseFloat(portions) : 0;

  useEffect(() => {
    if (editingRecipe) {
      const fetchRecipeIngredients = async () => {
        try {
          setLoading(true);
          
          const completeRecipe = await fetchRecipeWithIngredients(editingRecipe.id);
          
          console.log("Complete recipe data:", completeRecipe);
          
          setPreviewImage(completeRecipe.image_url || null);
          
          const baseIngs = completeRecipe.baseIngredients?.length > 0 
            ? completeRecipe.baseIngredients.map((ing: any) => ({
                ingredient_id: ing.ingredient_id,
                quantity: String(ing.quantity),
                cost: String(ing.cost)
              }))
            : [{ ingredient_id: "", quantity: "0", cost: "0" }];
          
          const portionIngs = completeRecipe.portionIngredients?.length > 0 
            ? completeRecipe.portionIngredients.map((ing: any) => ({
                ingredient_id: ing.ingredient_id,
                quantity: String(ing.quantity),
                cost: String(ing.cost)
              }))
            : [{ ingredient_id: "", quantity: "0", cost: "0" }];
          
          console.log("Mapped base ingredients:", baseIngs);
          console.log("Mapped portion ingredients:", portionIngs);
          
          form.reset({
            name: completeRecipe.name,
            image_url: completeRecipe.image_url || "",
            category_id: completeRecipe.category_id || "",
            baseIngredients: baseIngs,
            portionIngredients: portionIngs,
            portions: String(completeRecipe.portions),
            notes: completeRecipe.notes || ""
          });
        } catch (error) {
          console.error("Erro ao buscar ingredientes da receita:", error);
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os ingredientes da receita.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchRecipeIngredients();
    } else {
      form.reset({
        name: "",
        image_url: "",
        category_id: "",
        baseIngredients: [{ ingredient_id: "", quantity: "0", cost: "0" }],
        portionIngredients: [{ ingredient_id: "", quantity: "0", cost: "0" }],
        portions: "1",
        notes: ""
      });
      setPreviewImage(null);
    }
  }, [editingRecipe, form, toast]);

  const calculateIngredientCost = (
    ingredientId: string, 
    quantity: number
  ): number => {
    if (!ingredientId || quantity <= 0) return 0;
    
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return 0;
    
    return (ingredient.unit_cost * quantity);
  };

  const handleIngredientChange = (
    index: number, 
    ingredientId: string, 
    type: "baseIngredients" | "portionIngredients"
  ) => {
    const quantity = parseFloat(form.getValues(`${type}.${index}.quantity`));
    const cost = calculateIngredientCost(ingredientId, quantity);
    form.setValue(`${type}.${index}.cost`, String(cost));
  };

  const handleQuantityChange = (
    index: number, 
    value: number, 
    type: "baseIngredients" | "portionIngredients"
  ) => {
    const ingredientId = form.getValues(`${type}.${index}.ingredient_id`);
    const cost = calculateIngredientCost(ingredientId, value);
    form.setValue(`${type}.${index}.cost`, String(cost));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadFile(file, "recipes");
      if (imageUrl) {
        form.setValue("image_url", imageUrl);
        setPreviewImage(imageUrl);
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image_url", "");
    setPreviewImage(null);
  };

  const getIngredientPercentages = () => {
    if (totalCost === 0) return [];

    const allIngredients = [...baseIngredients, ...portionIngredients]
      .filter(item => item.ingredient_id && item.cost)
      .map(item => {
        const ingredient = ingredients.find(i => i.id === item.ingredient_id);
        return {
          name: ingredient?.name || "Desconhecido",
          cost: parseFloat(item.cost) || 0,
        };
      });

    const grouped = allIngredients.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = { name: item.name, cost: 0 };
      }
      acc[item.name].cost += item.cost;
      return acc;
    }, {} as Record<string, { name: string, cost: number }>);

    return Object.values(grouped)
      .map(item => ({
        name: item.name,
        cost: item.cost,
        percentage: (item.cost / totalCost) * 100
      }))
      .sort((a, b) => b.cost - a.cost);
  };

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      const filteredBaseIngredients = data.baseIngredients.filter(
        (i: any) => i.ingredient_id && parseFloat(i.quantity) > 0
      ).map((i: any) => ({
        ...i,
        quantity: parseFloat(i.quantity),
        cost: parseFloat(i.cost)
      }));
      
      const filteredPortionIngredients = data.portionIngredients.filter(
        (i: any) => i.ingredient_id && parseFloat(i.quantity) > 0
      ).map((i: any) => ({
        ...i,
        quantity: parseFloat(i.quantity),
        cost: parseFloat(i.cost)
      }));
      
      const submitData = {
        ...data,
        portions: parseInt(data.portions),
        baseIngredients: filteredBaseIngredients,
        portionIngredients: filteredPortionIngredients,
        total_cost: totalCost,
        unit_cost: unitCost
      };
      
      await onSubmit(submitData);
      form.reset();
      onClose();
      
      toast({
        title: editingRecipe ? "Receita atualizada" : "Receita criada",
        description: editingRecipe 
          ? "A receita foi atualizada com sucesso." 
          : "A nova receita foi criada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a receita. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecipe ? "Editar Receita" : "Nova Receita"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Carregando dados da receita...</span>
                </div>
              ) : (
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="base">Ingredientes Base</TabsTrigger>
                    <TabsTrigger value="portion">Ingredientes por Porção</TabsTrigger>
                    <TabsTrigger value="costs">Custos e Rendimento</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          rules={{ required: "Nome é obrigatório" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Receita</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Brigadeiro de Chocolate" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-center justify-between">
                          <FormField
                            control={form.control}
                            name="category_id"
                            rules={{ required: "Categoria é obrigatória" }}
                            render={({ field }) => (
                              <FormItem className="flex-1 mr-2">
                                <FormLabel>Categoria</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            className="mt-8"
                            onClick={() => setShowCategoryDialog(true)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Notas sobre a receita..." 
                                  className="min-h-32"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormLabel>Imagem da Receita (opcional)</FormLabel>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2">
                        {previewImage ? (
                          <div className="relative">
                            <img 
                              src={previewImage} 
                              alt="Preview da receita" 
                              className="w-full h-64 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-64">
                            <Upload className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-2">
                              Clique para fazer upload da imagem
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="recipe-image"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                            <label htmlFor="recipe-image">
                              <Button 
                                type="button" 
                                variant="outline" 
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  "Selecionar imagem"
                                )}
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="base" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">
                        Ingredientes Base (usados na receita completa)
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendBase({ ingredient_id: "", quantity: "0", cost: "0" })}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar Ingrediente
                      </Button>
                    </div>
                    
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ingrediente</TableHead>
                              <TableHead>Quantidade</TableHead>
                              <TableHead>Unidade</TableHead>
                              <TableHead>Custo</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {baseFields.map((field, index) => (
                              <TableRow key={field.id}>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`baseIngredients.${index}.ingredient_id`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <Select
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            handleIngredientChange(index, value, "baseIngredients");
                                          }}
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {ingredients.map((ingredient) => (
                                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                                {ingredient.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`baseIngredients.${index}.quantity`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              handleQuantityChange(
                                                index,
                                                parseFloat(e.target.value),
                                                "baseIngredients"
                                              );
                                            }}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const ingredientId = form.watch(`baseIngredients.${index}.ingredient_id`);
                                    const ingredient = ingredients.find(i => i.id === ingredientId);
                                    return ingredient?.unit || '-';
                                  })()}
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`baseIngredients.${index}.cost`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...field}
                                            disabled
                                            className="bg-muted"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeBase(index)}
                                    disabled={baseFields.length === 1}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-medium">
                                Total de ingredientes base:
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(baseTotalCost)}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="portion" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">
                        Ingredientes por Porção (usados em cada unidade)
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendPortion({ ingredient_id: "", quantity: "0", cost: "0" })}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar Ingrediente
                      </Button>
                    </div>
                    
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ingrediente</TableHead>
                              <TableHead>Quantidade</TableHead>
                              <TableHead>Unidade</TableHead>
                              <TableHead>Custo</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {portionFields.map((field, index) => (
                              <TableRow key={field.id}>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`portionIngredients.${index}.ingredient_id`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <Select
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            handleIngredientChange(index, value, "portionIngredients");
                                          }}
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {ingredients.map((ingredient) => (
                                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                                {ingredient.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`portionIngredients.${index}.quantity`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              handleQuantityChange(
                                                index,
                                                parseFloat(e.target.value),
                                                "portionIngredients"
                                              );
                                            }}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const ingredientId = form.watch(`portionIngredients.${index}.ingredient_id`);
                                    const ingredient = ingredients.find(i => i.id === ingredientId);
                                    return ingredient?.unit || '-';
                                  })()}
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`portionIngredients.${index}.cost`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-0">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...field}
                                            disabled
                                            className="bg-muted"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePortion(index)}
                                    disabled={portionFields.length === 1}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-medium">
                                Total de ingredientes por porção:
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(portionTotalCost)}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="costs" className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="portions"
                          rules={{ 
                            required: "Número de porções é obrigatório",
                            min: { value: 1, message: "Mínimo de 1 porção" }
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>N��mero de Porções/Unidades</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                                />
                              </FormControl>
                              <FormDescription>
                                Quantidade total produzida pela receita
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="border rounded-md p-4 space-y-3">
                          <h4 className="font-medium">Resumo de Custos</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>Custo dos ingredientes base:</div>
                            <div className="text-right font-medium">{formatCurrency(baseTotalCost)}</div>
                            
                            <div>Custo dos ingredientes por porção:</div>
                            <div className="text-right font-medium">{formatCurrency(portionTotalCost)}</div>
                            
                            <div className="border-t pt-2 font-medium">Custo total da receita:</div>
                            <div className="border-t pt-2 text-right font-medium">{formatCurrency(totalCost)}</div>
                            
                            <div className="font-medium">Custo por unidade/porção:</div>
                            <div className="text-right font-medium text-primary">{formatCurrency(unitCost)}</div>
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowChart(!showChart)}
                        >
                          <PercentIcon className="h-4 w-4 mr-2" />
                          {showChart ? "Ocultar composição percentual" : "Ver composição percentual"}
                        </Button>
                      </div>
                      
                      {showChart && (
                        <div className="border rounded-md p-4">
                          <h4 className="font-medium mb-4">Composição percentual dos ingredientes</h4>
                          <IngredientCompositionChart data={getIngredientPercentages()} />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRecipe ? "Atualizar" : "Criar"} Receita
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <RecipeCategoryDialog
        open={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
      />
    </>
  );
};

export default RecipeForm;
