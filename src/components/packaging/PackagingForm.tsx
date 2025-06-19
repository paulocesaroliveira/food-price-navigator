
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
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
      name: "",
      bulkQuantity: 0,
      bulkPrice: 0,
    },
  });

  // Update form when packaging prop changes
  useEffect(() => {
    if (packaging) {
      console.log("Updating form with packaging data:", packaging);
      form.reset({
        name: packaging.name || "",
        bulkQuantity: packaging.bulkQuantity || packaging.bulk_quantity || 0,
        bulkPrice: packaging.bulkPrice || packaging.bulk_price || 0,
      });
    } else {
      console.log("Resetting form for new packaging");
      form.reset({
        name: "",
        bulkQuantity: 0,
        bulkPrice: 0,
      });
    }
  }, [packaging, form]);

  // Calculate unit cost
  const bulkQuantity = form.watch("bulkQuantity");
  const bulkPrice = form.watch("bulkPrice");
  const unitCost = bulkQuantity && bulkPrice ? bulkPrice / bulkQuantity : 0;

  const handleFormSubmit = async (values: z.infer<typeof packagingSchema>) => {
    console.log("Submitting packaging form:", values);
    // Garantir que o tipo seja sempre enviado
    const dataWithType = {
      ...values,
      type: 'default', // Tipo padrão sempre definido
      bulkQuantity: Number(values.bulkQuantity),
      bulkPrice: Number(values.bulkPrice),
    };
    onSubmit(dataWithType);
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
