
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Packaging } from "@/types";

const packagingSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  bulkQuantity: z.coerce.number().positive({ message: "Quantidade deve ser maior que 0" }),
  bulkPrice: z.coerce.number().positive({ message: "Preço deve ser maior que 0" }),
  notes: z.string().optional(),
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
  const form = useForm<z.infer<typeof packagingSchema>>({
    resolver: zodResolver(packagingSchema),
    defaultValues: {
      name: packaging?.name || "",
      bulkQuantity: packaging?.bulkQuantity || 0,
      bulkPrice: packaging?.bulkPrice || 0,
      notes: packaging?.notes || "",
    },
  });

  // Update form when packaging prop changes
  useEffect(() => {
    if (packaging) {
      form.reset({
        name: packaging.name || "",
        bulkQuantity: packaging.bulkQuantity || 0,
        bulkPrice: packaging.bulkPrice || 0,
        notes: packaging.notes || "",
      });
    }
  }, [packaging, form]);

  // Calculate unit cost
  const bulkQuantity = form.watch("bulkQuantity");
  const bulkPrice = form.watch("bulkPrice");
  const unitCost = bulkQuantity && bulkPrice ? bulkPrice / bulkQuantity : 0;

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
                <FormLabel>Preço do Fardo</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="R$ 0,00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="p-4 border rounded-md bg-muted/50">
            <p className="text-sm font-medium">Custo Unitário (calculado)</p>
            <p className="text-xl font-bold mt-1">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(unitCost)}
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
        
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            {packaging ? "Atualizar Embalagem" : "Criar Embalagem"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
