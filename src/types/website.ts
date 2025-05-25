
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
