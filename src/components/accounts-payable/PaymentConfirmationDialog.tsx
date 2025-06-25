
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface PaymentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentDate: string, paymentMethod: string, interestAmount?: number) => void;
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
  const [interestAmount, setInterestAmount] = useState<number>(0);

  const totalAmount = accountAmount + interestAmount;

  const handleConfirm = () => {
    if (paymentDate && paymentMethod) {
      onConfirm(paymentDate, paymentMethod, interestAmount > 0 ? interestAmount : undefined);
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
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Valor Original:</span>
                <span className="font-medium">{formatCurrency(accountAmount)}</span>
              </div>
              {interestAmount > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Juros:</span>
                  <span className="font-medium">{formatCurrency(interestAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-1">
                <span>Total a Pagar:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
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

          <div>
            <label className="text-sm font-medium">Juros (opcional)</label>
            <CurrencyInput
              value={interestAmount}
              onValueChange={setInterestAmount}
              placeholder="R$ 0,00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Adicione juros caso o pagamento seja feito após o vencimento
            </p>
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
