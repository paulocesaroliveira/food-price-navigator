
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/ingredients/ImageUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Packaging } from "@/types";
import { toast } from "@/hooks/use-toast";

const packagingSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  type: z.string().min(1, { message: "Tipo é obrigatório" }),
  bulkQuantity: z.coerce.number().positive({ message: "Quantidade deve ser maior que 0" }),
  bulkPrice: z.coerce.number().positive({ message: "Preço deve ser maior que 0" }),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

type PackagingFormProps = {
  packaging?: Packaging;
  onSubmit: (data: z.infer<typeof packagingSchema>) => void;
  onCancel: () => void;
};

export const PackagingForm = ({
  packaging,
  onSubmit,
  onCancel,
}: PackagingFormProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    packaging?.imageUrl || null
  );
  const { uploadFile, isUploading, setUploading } = useFileUpload();

  const form = useForm<z.infer<typeof packagingSchema>>({
    resolver: zodResolver(packagingSchema),
    defaultValues: {
      name: packaging?.name || "",
      type: packaging?.type || "",
      bulkQuantity: packaging?.bulkQuantity || 0,
      bulkPrice: packaging?.bulkPrice || 0,
      notes: packaging?.notes || "",
      imageUrl: packaging?.imageUrl || "",
    },
  });

  // Calculate unit cost
  const bulkQuantity = form.watch("bulkQuantity");
  const bulkPrice = form.watch("bulkPrice");
  const unitCost = bulkQuantity && bulkPrice ? bulkPrice / bulkQuantity : 0;

  const handleImageUpload = async (file: File): Promise<void> => {
    try {
      setUploading(true);
      const result = await uploadFile(file, "packaging");
      if (result?.url) {
        setImageUrl(result.url);
        form.setValue("imageUrl", result.url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (values: z.infer<typeof packagingSchema>) => {
    onSubmit({
      ...values,
      bulkQuantity: Number(values.bulkQuantity),
      bulkPrice: Number(values.bulkPrice),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Embalagem</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Caixa para Doces" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo/Unidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Caixa, Pote, Saquinho" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bulkQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade por Fardo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ex: 100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bulkPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço do Fardo (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 120.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 border rounded-md bg-muted/50">
              <p className="text-sm font-medium">Custo Unitário (calculado)</p>
              <p className="text-xl font-bold mt-1">
                R$ {unitCost.toFixed(2)}
              </p>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a embalagem"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem da Embalagem (opcional)</FormLabel>
                  <FormControl>
                    <ImageUpload
                      currentImageUrl={imageUrl}
                      onImageUpload={handleImageUpload}
                      isUploading={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isUploading}>
            {packaging ? "Atualizar Embalagem" : "Adicionar Embalagem"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
