
import React, { useState, useEffect } from "react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { createOrder } from "@/services/orderService";
import { getCustomerList } from "@/services/customerService";
import { type Customer } from "@/types";
import { cn } from "@/lib/utils";

interface NewOrderFormProps {
  onOrderCreated: () => void;
  onCancel?: () => void;
}

const deliveryTypes = ["Entrega", "Retirada"];

const NewOrderForm: React.FC<NewOrderFormProps> = ({ onOrderCreated, onCancel }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();

  const form = useForm({
    defaultValues: {
      customer_id: "",
      delivery_type: deliveryTypes[0],
      delivery_address: "",
      scheduled_date: "",
      scheduled_time: "",
      total_amount: 0,
      notes: "",
      origin: "manual",
      status: "Novo"
    }
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getCustomerList();
      setCustomers(data);
    };

    fetchCustomers();
  }, []);

  const onSubmit = async (values: any) => {
    const formattedDate = scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : null;
    const payload = {
      ...values,
      scheduled_date: formattedDate,
      total_amount: parseFloat(values.total_amount),
    };

    try {
      await createOrder(payload);
      toast({
        title: "Sucesso",
        description: "Pedido criado com sucesso!",
      });
      form.reset();
      setScheduledDate(undefined);
      onOrderCreated();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível criar o pedido: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Entrega</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de entrega" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {deliveryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {form.watch("delivery_type") === "Entrega" && (
          <FormField
            control={form.control}
            name="delivery_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço de Entrega</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número, complemento" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Agendar Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        {scheduledDate ? (
                          format(scheduledDate, "PPP")
                        ) : (
                          <span>Escolher uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={date => {
                        setScheduledDate(date)
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"))
                        } else {
                          field.onChange(undefined)
                        }
                      }}
                      disabled={date =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agendar Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
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
                  placeholder="Observações sobre o pedido"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">Criar Pedido</Button>
        </div>
      </form>
    </Form>
  );
};

export default NewOrderForm;
