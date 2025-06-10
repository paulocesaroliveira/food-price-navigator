
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resaleService } from "@/services/resaleService";
import { toast } from "@/hooks/use-toast";
import type { Reseller, CreateResellerRequest } from "@/types/resale";

interface ResellerFormProps {
  reseller?: Reseller | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResellerForm: React.FC<ResellerFormProps> = ({
  reseller,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("10");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const createResellerMutation = useMutation({
    mutationFn: resaleService.createReseller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({ title: "✨ Sucesso", description: "Revendedor criado com sucesso!" });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erro", 
        description: `Erro ao criar revendedor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateResellerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateResellerRequest> }) => 
      resaleService.updateReseller(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({ title: "✨ Sucesso", description: "Revendedor atualizado com sucesso!" });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erro", 
        description: `Erro ao atualizar revendedor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (reseller) {
      setName(reseller.name || "");
      setEmail(reseller.email || "");
      setPhone(reseller.phone || "");
      setCommissionPercentage(reseller.commission_percentage?.toString() || "10");
      setNotes(reseller.notes || "");
    }
  }, [reseller]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ 
        title: "❌ Erro", 
        description: "O nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const resellerData: CreateResellerRequest = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      commission_percentage: parseFloat(commissionPercentage),
      notes: notes.trim() || undefined
    };

    if (reseller) {
      updateResellerMutation.mutate({ id: reseller.id, data: resellerData });
    } else {
      createResellerMutation.mutate(resellerData);
    }
  };

  const isLoading = createResellerMutation.isPending || updateResellerMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do revendedor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commission">Comissão (%) *</Label>
          <Input
            id="commission"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={commissionPercentage}
            onChange={(e) => setCommissionPercentage(e.target.value)}
            placeholder="10"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações sobre o revendedor..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : (reseller ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
};

export default ResellerForm;
