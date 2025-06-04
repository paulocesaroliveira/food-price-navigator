
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Checkbox } from "@/components/ui/checkbox";
import type { AccountPayable, ExpenseCategory, CreateAccountPayable } from "@/types/accountsPayable";

const formSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  due_date: z.string().min(1, "Data de vencimento é obrigatória"),
  category_id: z.string().optional(),
  supplier: z.string().optional(),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check']).optional(),
  notes: z.string().optional(),
  is_recurring: z.boolean().default(false),
  installments: z.number().min(1).max(48).optional(),
});

interface AccountPayableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountPayable) => void;
  onUpdate?: (id: string, data: Partial<CreateAccountPayable>) => void;
  onSubmitRecurring?: (data: CreateAccountPayable, installments: number, startDate: string) => void;
  categories: ExpenseCategory[];
  editingAccount?: AccountPayable | null;
  isLoading?: boolean;
}

export const AccountPayableFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onSubmitRecurring,
  categories,
  editingAccount,
  isLoading = false
}: AccountPayableFormModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
      category_id: "",
      supplier: "",
      payment_method: undefined,
      notes: "",
      is_recurring: false,
      installments: 2,
    },
  });

  const isRecurring = form.watch("is_recurring");

  // Carregar dados quando editando
  useEffect(() => {
    if (editingAccount && isOpen) {
      // Garantir que a data está no formato correto (YYYY-MM-DD)
      const formattedDate = editingAccount.due_date.includes('T') 
        ? editingAccount.due_date.split('T')[0] 
        : editingAccount.due_date;

      form.reset({
        description: editingAccount.description,
        amount: editingAccount.amount,
        due_date: formattedDate,
        category_id: editingAccount.category_id || "",
        supplier: editingAccount.supplier || "",
        payment_method: editingAccount.payment_method,
        notes: editingAccount.notes || "",
        is_recurring: false,
        installments: 2,
      });
    } else if (!editingAccount && isOpen) {
      // Reset para nova conta
      form.reset({
        description: "",
        amount: 0,
        due_date: new Date().toISOString().split('T')[0],
        category_id: "",
        supplier: "",
        payment_method: undefined,
        notes: "",
        is_recurring: false,
        installments: 2,
      });
    }
  }, [editingAccount, isOpen, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const accountData: CreateAccountPayable = {
      description: values.description,
      amount: values.amount,
      due_date: values.due_date, // Manter a data exatamente como digitada
      category_id: values.category_id || undefined,
      supplier: values.supplier || undefined,
      payment_method: values.payment_method,
      notes: values.notes || undefined,
    };

    if (editingAccount && onUpdate) {
      // Modo edição
      onUpdate(editingAccount.id, accountData);
    } else if (values.is_recurring && values.installments && onSubmitRecurring) {
      // Modo recorrente
      onSubmitRecurring(accountData, values.installments, values.due_date);
    } else {
      // Modo normal
      onSubmit(accountData);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingAccount ? "Editar Conta" : "Nova Conta a Pagar"}
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

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                        <SelectItem value="bank_transfer">Transferência</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {!editingAccount && (
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Conta Recorrente</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Criar múltiplas parcelas desta conta
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {isRecurring && !editingAccount && (
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parcelas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2"
                        max="48"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Salvando..." : editingAccount ? "Atualizar" : "Salvar"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
