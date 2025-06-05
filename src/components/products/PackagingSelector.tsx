
import React from "react";
import { Packaging } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/calculations";
import { Trash2, Package, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PackagingSelectorProps {
  packaging: Packaging[];
  selectedItems: Array<{
    packagingId: string;
    quantity: number;
    cost: number;
    isPrimary: boolean;
  }>;
  onItemChange: (index: number, field: string, value: any) => void;
  onRemoveItem: (index: number) => void;
}

export const PackagingSelector = ({
  packaging,
  selectedItems,
  onItemChange,
  onRemoveItem,
}: PackagingSelectorProps) => {
  const handlePrimaryChange = (index: number) => {
    // Primeiro, marca todos como não primários
    selectedItems.forEach((_, i) => {
      if (i !== index) {
        onItemChange(i, 'isPrimary', false);
      }
    });
    // Depois marca o selecionado como primário
    onItemChange(index, 'isPrimary', true);
  };

  return (
    <div className="space-y-4">
      {selectedItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma embalagem adicionada.<br />
              Adicione pelo menos uma embalagem principal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {selectedItems.map((item, index) => {
            const pkg = packaging.find(p => p.id === item.packagingId);
            return (
              <Card key={index} className={item.isPrimary ? "ring-2 ring-primary" : ""}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-1">
                      {pkg?.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-5">
                      <Label className="text-sm text-muted-foreground">Embalagem</Label>
                      <Select
                        value={item.packagingId}
                        onValueChange={(value) => onItemChange(index, 'packagingId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma embalagem" />
                        </SelectTrigger>
                        <SelectContent>
                          {packaging.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              <div className="flex items-center gap-2">
                                <span>{pkg.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(pkg.unitCost)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onItemChange(index, 'quantity', Number(e.target.value))}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Custo</Label>
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(item.cost)}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrimaryChange(index)}
                        className={item.isPrimary ? "text-yellow-600" : "text-muted-foreground"}
                      >
                        <Star className={`h-4 w-4 ${item.isPrimary ? "fill-current" : ""}`} />
                      </Button>
                    </div>

                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(index)}
                        className="text-destructive hover:text-destructive"
                        disabled={item.isPrimary && selectedItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.isPrimary && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Embalagem Principal
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
