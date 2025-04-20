
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
}

export interface PublicSiteProps {
  settings: WebsiteSettings;
  products: PublishedProduct[];
}
