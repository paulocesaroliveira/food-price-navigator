
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
import { formatCurrency } from "@/utils/calculations";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Reverter Pagamento
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja reverter este pagamento? Esta ação irá marcar a conta como pendente novamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium">{accountDescription}</h4>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {formatCurrency(accountAmount)}
          </p>
        </div>
        
        <DialogFooter>
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
