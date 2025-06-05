
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentDate: string, paymentMethod: string, finalAmount: number, discount?: number, interest?: number, notes?: string) => void;
  accountDescription: string;
  accountAmount: number;
  isLoading: boolean;
}

export const PaymentConfirmationDialog: React.FC<PaymentConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  accountDescription,
  accountAmount,
  isLoading
}) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [interest, setInterest] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [finalAmount, setFinalAmount] = useState(accountAmount);

  // Recalcular valor final quando desconto ou juros mudarem
  useEffect(() => {
    const discountAmount = (accountAmount * discount) / 100;
    const interestAmount = (accountAmount * interest) / 100;
    const newFinalAmount = accountAmount - discountAmount + interestAmount;
    setFinalAmount(Math.max(0, newFinalAmount));
  }, [accountAmount, discount, interest]);

  const handleConfirm = () => {
    if (paymentDate && paymentMethod) {
      onConfirm(paymentDate, paymentMethod, finalAmount, discount || undefined, interest || undefined, notes || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('');
    setDiscount(0);
    setInterest(0);
    setNotes('');
    setFinalAmount(accountAmount);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento</DialogTitle>
          <DialogDescription>
            Confirme o pagamento da conta: <strong>{accountDescription}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Valor Original */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-gray-600">Valor Original</Label>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(accountAmount)}</p>
          </div>

          {/* Data do Pagamento */}
          <div>
            <Label htmlFor="payment-date">Data do Pagamento</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          {/* Método de Pagamento */}
          <div>
            <Label htmlFor="payment-method">Método de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desconto e Juros */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder="0.00"
              />
              {discount > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  -{formatCurrency((accountAmount * discount) / 100)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="interest">Juros (%)</Label>
              <Input
                id="interest"
                type="number"
                min="0"
                step="0.01"
                value={interest}
                onChange={(e) => setInterest(Number(e.target.value) || 0)}
                placeholder="0.00"
              />
              {interest > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  +{formatCurrency((accountAmount * interest) / 100)}
                </p>
              )}
            </div>
          </div>

          {/* Valor Final */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <Label className="text-sm font-medium text-blue-600">Valor Final a Pagar</Label>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(finalAmount)}</p>
            {finalAmount !== accountAmount && (
              <p className="text-xs text-blue-600">
                {finalAmount > accountAmount ? 'Aumento' : 'Desconto'} de {formatCurrency(Math.abs(finalAmount - accountAmount))}
              </p>
            )}
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o pagamento..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!paymentDate || !paymentMethod || isLoading}
          >
            {isLoading ? 'Confirmando...' : 'Confirmar Pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
