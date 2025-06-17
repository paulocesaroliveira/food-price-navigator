
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
      <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-gray-50">
        <p className="text-center">Nenhum endereço cadastrado para este cliente</p>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-w-md">
        {addresses.map((address) => (
          <SelectItem key={address.id} value={address.address} className="cursor-pointer">
            <div className="flex flex-col py-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{address.label}</span>
                {address.is_primary && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Principal</span>
                )}
              </div>
              <span className="text-sm text-muted-foreground mt-1">{address.address}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomerAddressSelector;
