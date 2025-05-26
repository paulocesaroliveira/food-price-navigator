
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  address: string;
  is_primary: boolean;
  created_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  addresses?: CreateCustomerAddressRequest[];
}

export interface CreateCustomerAddressRequest {
  label: string;
  address: string;
  is_primary: boolean;
}
