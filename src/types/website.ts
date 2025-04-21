
import { PublishedProduct } from "@/services/websiteService";

export interface WebsiteSettings {
  id: string;
  name: string;
  domain: string | null;
  subdomain: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  is_active: boolean;
  contact_whatsapp: string | null;
  contact_instagram: string | null;
  contact_facebook: string | null;
  store_address: string | null;
  created_at: string;
  updated_at: string;
  accepted_payment_methods?: string[]; // New field for payment methods
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  deliveryType: 'Entrega' | 'Retirada';
  address?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  paymentMethod?: string; // New field for payment method
}

export interface OrderData {
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    address?: string | null;
    origin: "site" | "manual";
  };
  order: {
    delivery_type: "Entrega" | "Retirada";
    delivery_address: string | null;
    scheduled_date: string | null;
    scheduled_time: string | null;
    total_amount: number;
    notes: string | null;
    origin: "site" | "manual";
    status: "Novo" | "Em preparo" | "Pronto" | "Finalizado" | "Cancelado";
    payment_method?: string | null; // New field for payment method
  };
  items: Array<{
    product_id: string;
    quantity: number;
    price_at_order: number;
    total_price: number;
    notes: string | null;
  }>;
}

export interface PublicSiteProps {
  settings: WebsiteSettings;
  products: PublishedProduct[];
}
