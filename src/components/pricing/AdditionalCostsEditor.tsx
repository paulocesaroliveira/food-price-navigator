
import React, { useState } from "react";
import { AdditionalCost } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { formatCurrency } from "@/utils/calculations";

interface AdditionalCostsEditorProps {
  costs: AdditionalCost[];
  onChange: (costs: AdditionalCost[]) => void;
}

const AdditionalCostsEditor: React.FC<AdditionalCostsEditorProps> = ({
  costs,
  onChange
}) => {
  const addCost = () => {
    const newCost: AdditionalCost = {
      id: uuidv4(),
      name: "",
      value: 0,
      isPerUnit: true
    };
    onChange([...costs, newCost]);
  };

  const removeCost = (id: string) => {
    onChange(costs.filter(cost => cost.id !== id));
  };

  const updateCost = (id: string, field: keyof AdditionalCost, value: string | number | boolean) => {
    onChange(
      costs.map(cost => 
        cost.id === id 
          ? { ...cost, [field]: value }
          : cost
      )
    );
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.value, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Despesas adicionais</div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs flex items-center gap-1"
          onClick={addCost}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>

      {costs.length === 0 ? (
        <div className="text-sm text-muted-foreground italic py-2">
          Nenhuma despesa adicional
        </div>
      ) : (
        <div className="space-y-2">
          {costs.map((cost) => (
            <div
              key={cost.id}
              className="grid grid-cols-12 gap-2 bg-muted/40 p-2 rounded-lg"
            >
              <div className="col-span-7">
                <Input
                  placeholder="Nome da despesa"
                  value={cost.name}
                  onChange={(e) => updateCost(cost.id, "name", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="col-span-4">
                <div className="relative">
                  <Input
                    type="number"
                    value={cost.value}
                    onChange={(e) => updateCost(cost.id, "value", parseFloat(e.target.value) || 0)}
                    placeholder="Valor"
                    className="pl-6 h-9"
                  />
                  <span className="absolute left-2 top-2 text-muted-foreground text-xs">R$</span>
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCost(cost.id)}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-1 px-2 text-sm">
            <span className="font-medium">Total despesas:</span>
            <span>{formatCurrency(totalCosts)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalCostsEditor;
