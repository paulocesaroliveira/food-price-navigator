export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      additional_costs: {
        Row: {
          created_at: string
          id: string
          is_per_unit: boolean
          name: string
          pricing_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_per_unit?: boolean
          name: string
          pricing_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          is_per_unit?: boolean
          name?: string
          pricing_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "additional_costs_pricing_id_fkey"
            columns: ["pricing_id"]
            isOneToOne: false
            referencedRelation: "pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address1: string | null
          address2: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          origin: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          origin: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address1?: string | null
          address2?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          origin?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ingredient_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          brand: string
          category_id: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          package_price: number
          package_quantity: number
          supplier: string | null
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          brand: string
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          package_price: number
          package_quantity: number
          supplier?: string | null
          unit: string
          unit_cost: number
          updated_at?: string
        }
        Update: {
          brand?: string
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          package_price?: number
          package_quantity?: number
          supplier?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ingredient_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          price_at_order: number
          product_id: string
          quantity: number
          total_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          price_at_order: number
          product_id: string
          quantity?: number
          total_price: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          price_at_order?: number
          product_id?: string
          quantity?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          delivery_address: string | null
          delivery_type: string
          id: string
          notes: string | null
          order_number: string
          origin: string
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_address?: string | null
          delivery_type: string
          id?: string
          notes?: string | null
          order_number: string
          origin: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          status: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_address?: string | null
          delivery_type?: string
          id?: string
          notes?: string | null
          order_number?: string
          origin?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging: {
        Row: {
          bulk_price: number
          bulk_quantity: number
          created_at: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          type: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          bulk_price: number
          bulk_quantity: number
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          type: string
          unit_cost: number
          updated_at?: string
        }
        Update: {
          bulk_price?: number
          bulk_quantity?: number
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          type?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      pricing: {
        Row: {
          applied_markup: number
          created_at: string
          desired_margin_percentage: number
          id: string
          minimum_recommended_price: number
          platform_fee_percentage: number
          price_with_commission: number
          price_with_taxes: number
          product_id: string
          selling_price: number
          tax_percentage: number
          total_production_cost: number
          unit_cost: number
          unit_profit: number
          updated_at: string
          wastage_percentage: number
        }
        Insert: {
          applied_markup: number
          created_at?: string
          desired_margin_percentage?: number
          id?: string
          minimum_recommended_price: number
          platform_fee_percentage?: number
          price_with_commission: number
          price_with_taxes: number
          product_id: string
          selling_price: number
          tax_percentage?: number
          total_production_cost: number
          unit_cost: number
          unit_profit: number
          updated_at?: string
          wastage_percentage?: number
        }
        Update: {
          applied_markup?: number
          created_at?: string
          desired_margin_percentage?: number
          id?: string
          minimum_recommended_price?: number
          platform_fee_percentage?: number
          price_with_commission?: number
          price_with_taxes?: number
          product_id?: string
          selling_price?: number
          tax_percentage?: number
          total_production_cost?: number
          unit_cost?: number
          unit_profit?: number
          updated_at?: string
          wastage_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_configs: {
        Row: {
          actual_margin: number
          base_cost: number
          created_at: string
          final_price: number
          id: string
          ideal_price: number
          margin_percentage: number
          name: string
          packaging_cost: number
          platform_fee_percentage: number
          product_id: string
          tax_percentage: number
          total_unit_cost: number
          unit_profit: number
          updated_at: string
          wastage_percentage: number
        }
        Insert: {
          actual_margin?: number
          base_cost?: number
          created_at?: string
          final_price?: number
          id?: string
          ideal_price?: number
          margin_percentage?: number
          name: string
          packaging_cost?: number
          platform_fee_percentage?: number
          product_id: string
          tax_percentage?: number
          total_unit_cost?: number
          unit_profit?: number
          updated_at?: string
          wastage_percentage?: number
        }
        Update: {
          actual_margin?: number
          base_cost?: number
          created_at?: string
          final_price?: number
          id?: string
          ideal_price?: number
          margin_percentage?: number
          name?: string
          packaging_cost?: number
          platform_fee_percentage?: number
          product_id?: string
          tax_percentage?: number
          total_unit_cost?: number
          unit_profit?: number
          updated_at?: string
          wastage_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_configs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_expenses: {
        Row: {
          created_at: string
          id: string
          name: string
          pricing_config_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          pricing_config_id: string
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          pricing_config_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_expenses_pricing_config_id_fkey"
            columns: ["pricing_config_id"]
            isOneToOne: false
            referencedRelation: "pricing_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_items: {
        Row: {
          cost: number
          created_at: string
          id: string
          product_id: string
          quantity: number
          recipe_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          recipe_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_packaging: {
        Row: {
          cost: number
          created_at: string
          id: string
          is_primary: boolean
          packaging_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          is_primary?: boolean
          packaging_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          is_primary?: boolean
          packaging_id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_packaging_packaging_id_fkey"
            columns: ["packaging_id"]
            isOneToOne: false
            referencedRelation: "packaging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_packaging_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_schedule_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          quantity: number
          recipe_id: string
          schedule_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          recipe_id: string
          schedule_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          recipe_id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_schedule_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_schedule_items_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "production_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      production_schedules: {
        Row: {
          created_at: string
          date: string
          estimated_cost: number | null
          estimated_time: string | null
          id: string
          notes: string | null
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          estimated_cost?: number | null
          estimated_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          estimated_cost?: number | null
          estimated_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          name: string
          packaging_cost: number
          packaging_id: string | null
          total_cost: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          name: string
          packaging_cost?: number
          packaging_id?: string | null
          total_cost?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          name?: string
          packaging_cost?: number
          packaging_id?: string | null
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_packaging_id_fkey"
            columns: ["packaging_id"]
            isOneToOne: false
            referencedRelation: "packaging"
            referencedColumns: ["id"]
          },
        ]
      }
      published_products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          product_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          price: number
          product_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          product_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "published_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_base_ingredients: {
        Row: {
          cost: number
          created_at: string
          id: string
          ingredient_id: string
          quantity: number
          recipe_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          ingredient_id: string
          quantity: number
          recipe_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          ingredient_id?: string
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_base_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_base_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      recipe_portion_ingredients: {
        Row: {
          cost: number
          created_at: string
          id: string
          ingredient_id: string
          quantity: number
          recipe_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          ingredient_id: string
          quantity: number
          recipe_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          ingredient_id?: string
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_portion_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_portion_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          portions: number
          total_cost: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          portions: number
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          portions?: number
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "recipe_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      website_settings: {
        Row: {
          contact_facebook: string | null
          contact_instagram: string | null
          contact_whatsapp: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          domain: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          store_address: string | null
          subdomain: string | null
          updated_at: string
        }
        Insert: {
          contact_facebook?: string | null
          contact_instagram?: string | null
          contact_whatsapp?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          store_address?: string | null
          subdomain?: string | null
          updated_at?: string
        }
        Update: {
          contact_facebook?: string | null
          contact_instagram?: string | null
          contact_whatsapp?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          store_address?: string | null
          subdomain?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_recipe_costs: {
        Args: { recipe_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
