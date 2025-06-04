
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Undo2 } from "lucide-react";

interface PaymentReverseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountDescription: string;
  accountAmount: number;
  isLoading?: boolean;
}

export const PaymentReverseDialog = ({
  isOpen,
  onClose,
  onConfirm,
  accountDescription,
  accountAmount,
  isLoading = false
}: PaymentReverseDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Reverter Pagamento
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja reverter o pagamento desta conta?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="font-medium text-sm text-gray-700">Conta:</p>
            <p className="text-gray-900">{accountDescription}</p>
            <p className="font-medium text-lg text-red-600 mt-1">
              R$ {accountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 text-sm">Atenção!</p>
                <p className="text-amber-700 text-sm">
                  Esta ação irá marcar a conta como pendente novamente e remover as informações de pagamento.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            variant="destructive"
            className="gap-2"
          >
            <Undo2 className="h-4 w-4" />
            {isLoading ? "Revertendo..." : "Reverter Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
