
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerAddress } from "@/types/customers";

interface CustomerAddressSelectorProps {
  addresses: CustomerAddress[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const CustomerAddressSelector: React.FC<CustomerAddressSelectorProps> = ({
  addresses,
  value,
  onValueChange,
  placeholder = "Selecione um endereço"
}) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2 border rounded">
        Nenhum endereço cadastrado para este cliente
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {addresses.map((address) => (
          <SelectItem key={address.id} value={address.address}>
            <div className="flex flex-col">
              <span className="font-medium">{address.label}</span>
              <span className="text-sm text-muted-foreground">{address.address}</span>
              {address.is_primary && (
                <span className="text-xs text-blue-600">• Principal</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomerAddressSelector;
