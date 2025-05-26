
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, Settings } from "lucide-react";
import type { AccountPayable, ExpenseCategory } from "@/types/accountsPayable";

const formSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  due_date: z.string().min(1, "Data de vencimento é obrigatória"),
  category_id: z.string().optional(),
  supplier: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

interface AccountPayableFormProps {
  categories: ExpenseCategory[];
  onSubmit: (data: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  initialData?: AccountPayable;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onManageCategories: () => void;
}

const AccountPayableForm = ({ 
  categories, 
  onSubmit, 
  initialData, 
  isOpen, 
  onOpenChange,
  onManageCategories
}: AccountPayableFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
      amount: initialData?.amount?.toString() || "",
      due_date: initialData?.due_date || "",
      category_id: initialData?.category_id || "",
      supplier: initialData?.supplier || "",
      payment_method: initialData?.payment_method || "",
      notes: initialData?.notes || "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        description: initialData.description || "",
        amount: initialData.amount?.toString() || "",
        due_date: initialData.due_date || "",
        category_id: initialData.category_id || "",
        supplier: initialData.supplier || "",
        payment_method: initialData.payment_method || "",
        notes: initialData.notes || "",
      });
    } else {
      form.reset({
        description: "",
        amount: "",
        due_date: "",
        category_id: "",
        supplier: "",
        payment_method: "",
        notes: "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      description: values.description,
      amount: parseFloat(values.amount),
      due_date: values.due_date,
      category_id: values.category_id || undefined,
      supplier: values.supplier || undefined,
      payment_method: values.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' | undefined,
      notes: values.notes || undefined,
      status: initialData?.status || 'pending',
      payment_date: initialData?.payment_date,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {initialData ? "Editar Conta" : "Nova Conta a Pagar"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição da despesa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Categoria
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onManageCategories}
                      className="h-6 px-2"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                      <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {initialData ? "Atualizar" : "Cadastrar"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountPayableForm;
