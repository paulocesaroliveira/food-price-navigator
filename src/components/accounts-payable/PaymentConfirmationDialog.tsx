
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface PaymentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentDate: string, paymentMethod: string) => void;
  accountDescription: string;
  accountAmount: number;
  isLoading?: boolean;
}

export const PaymentConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  accountDescription,
  accountAmount,
  isLoading = false
}: PaymentConfirmationDialogProps) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState("pix");

  const handleConfirm = () => {
    if (paymentDate && paymentMethod) {
      onConfirm(paymentDate, paymentMethod);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirmar Pagamento
          </DialogTitle>
          <DialogDescription>
            Confirme os detalhes do pagamento abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium">{accountDescription}</h4>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(accountAmount)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Data do Pagamento</label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Método de Pagamento</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="gap-2">
            <DollarSign className="h-4 w-4" />
            {isLoading ? "Processando..." : "Confirmar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
