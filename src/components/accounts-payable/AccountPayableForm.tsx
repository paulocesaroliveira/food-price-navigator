import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Repeat, 
  CalendarClock,
  CreditCard,
  Landmark,
  FileText,
  Tag,
  Users,
  MessageSquare
} from "lucide-react";
import type { AccountPayable, ExpenseCategory } from "@/types/accountsPayable";

const formSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  due_date: z.string().min(1, "Data de vencimento é obrigatória"),
  category_id: z.string().optional(),
  supplier: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  is_recurring: z.boolean().default(false),
  installments: z.number().min(1).max(48).optional(),
  base_month: z.string().optional(),
});

interface AccountPayableFormProps {
  categories: ExpenseCategory[];
  onSubmit: (data: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  onSubmitRecurring?: (data: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>, installments: number, baseMonth: string) => void;
  initialData?: AccountPayable;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountPayableForm = ({ 
  categories, 
  onSubmit, 
  onSubmitRecurring,
  initialData, 
  isOpen, 
  onOpenChange
}: AccountPayableFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      due_date: initialData?.due_date || "",
      category_id: initialData?.category_id || "",
      supplier: initialData?.supplier || "",
      payment_method: initialData?.payment_method || "",
      notes: initialData?.notes || "",
      is_recurring: false,
      installments: 2,
      base_month: new Date().toISOString().slice(0, 7),
    },
  });

  const isRecurring = form.watch("is_recurring");
  const [activeTab, setActiveTab] = React.useState("basic");

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          description: initialData.description || "",
          amount: initialData.amount || 0,
          due_date: initialData.due_date || "",
          category_id: initialData.category_id || "",
          supplier: initialData.supplier || "",
          payment_method: initialData.payment_method || "",
          notes: initialData.notes || "",
          is_recurring: false,
          installments: 2,
          base_month: new Date().toISOString().slice(0, 7),
        });
      } else {
        form.reset({
          description: "",
          amount: 0,
          due_date: new Date().toISOString().split('T')[0],
          category_id: "",
          supplier: "",
          payment_method: "",
          notes: "",
          is_recurring: false,
          installments: 2,
          base_month: new Date().toISOString().slice(0, 7),
        });
      }
    }
  }, [initialData, isOpen, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const accountData = {
      description: values.description,
      amount: values.amount,
      due_date: values.due_date,
      category_id: values.category_id && values.category_id !== "none" ? values.category_id : undefined,
      supplier: values.supplier || undefined,
      payment_method: values.payment_method && values.payment_method !== "none" ? values.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check' : undefined,
      notes: values.notes || undefined,
      status: initialData?.status || 'pending' as const,
      payment_date: initialData?.payment_date,
    };

    console.log("Dados do formulário sendo enviados:", accountData);

    if (values.is_recurring && values.installments && values.base_month && onSubmitRecurring) {
      onSubmitRecurring(accountData, values.installments, values.base_month);
    } else {
      onSubmit(accountData);
    }

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-5 w-5" />
            {initialData ? "Editar Conta" : "Nova Conta a Pagar"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "Atualize os detalhes da conta a pagar" : "Registre uma nova despesa a ser paga"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informações Básicas
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Detalhes Adicionais
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-500" />
                          Descrição *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Descrição da despesa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
    
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-purple-500" />
                            Valor *
                          </FormLabel>
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
                          <FormLabel className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-purple-500" />
                            Data de Vencimento *
                          </FormLabel>
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
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-purple-500" />
                          Categoria
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Sem categoria</SelectItem>
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
                        <FormDescription>
                          Organize suas contas por categoria para facilitar o gerenciamento
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  {!initialData && (
                    <FormField
                      control={form.control}
                      name="is_recurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <Repeat className="h-4 w-4 text-purple-500" />
                              Conta Recorrente
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Criar múltiplas parcelas desta conta
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
    
                  {isRecurring && !initialData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
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
                            <FormDescription>
                              Máximo: 48 parcelas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
    
                      <FormField
                        control={form.control}
                        name="base_month"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mês Base</FormLabel>
                            <FormControl>
                              <Input type="month" {...field} />
                            </FormControl>
                            <FormDescription>
                              Primeiro vencimento será neste mês
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        Fornecedor
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do fornecedor" {...field} />
                      </FormControl>
                      <FormDescription>
                        Empresa ou pessoa a quem você deve pagar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-purple-500" />
                        Forma de Pagamento
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a forma de pagamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Não definido</SelectItem>
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
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                        Observações
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais..."
                          className="resize-none min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isRecurring && !initialData ? (
                  <>
                    <Repeat className="h-4 w-4" />
                    Criar Parcelas
                  </>
                ) : initialData ? (
                  <>
                    <FileText className="h-4 w-4" />
                    Atualizar
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    Cadastrar
                  </>
                )}
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
