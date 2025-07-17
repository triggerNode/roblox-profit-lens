export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          devex_rate: number | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          devex_rate?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          devex_rate?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_products: {
        Row: {
          created_at: string
          id: string
          inventory_limit: number | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          price: number
          product_id: string
          stripe_price_id: string | null
          trial_period_days: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_limit?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          price: number
          product_id: string
          stripe_price_id?: string | null
          trial_period_days?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_limit?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          price?: number
          product_id?: string
          stripe_price_id?: string | null
          trial_period_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          checkouts_count: number | null
          id: string
          last_updated: string
          product_id: string
        }
        Insert: {
          checkouts_count?: number | null
          id?: string
          last_updated?: string
          product_id: string
        }
        Update: {
          checkouts_count?: number | null
          id?: string
          last_updated?: string
          product_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          product_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          product_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          ad_spend: number | null
          created_at: string
          devex_rate: number
          gross_robux: number
          gross_usd: number
          id: string
          item_name: string
          item_type: Database["public"]["Enums"]["item_type"]
          marketplace_cut: number
          net_robux: number
          net_usd: number
          source: string
          transaction_date: string
          upload_id: string | null
          user_id: string
        }
        Insert: {
          ad_spend?: number | null
          created_at?: string
          devex_rate: number
          gross_robux: number
          gross_usd?: number
          id?: string
          item_name: string
          item_type: Database["public"]["Enums"]["item_type"]
          marketplace_cut?: number
          net_robux: number
          net_usd?: number
          source: string
          transaction_date: string
          upload_id?: string | null
          user_id: string
        }
        Update: {
          ad_spend?: number | null
          created_at?: string
          devex_rate?: number
          gross_robux?: number
          gross_usd?: number
          id?: string
          item_name?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          marketplace_cut?: number
          net_robux?: number
          net_usd?: number
          source?: string
          transaction_date?: string
          upload_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          created_at: string
          error_message: string | null
          filename: string
          id: string
          processing_status: string | null
          total_transactions: number | null
          upload_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          filename: string
          id?: string
          processing_status?: string | null
          total_transactions?: number | null
          upload_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          filename?: string
          id?: string
          processing_status?: string | null
          total_transactions?: number | null
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ad_tracking: boolean | null
          created_at: string
          id: string
          marketplace_cut: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_tracking?: boolean | null
          created_at?: string
          id?: string
          marketplace_cut?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_tracking?: boolean | null
          created_at?: string
          id?: string
          marketplace_cut?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      metrics: {
        Row: {
          ad_spend_robux: number | null
          avg_devex_rate: number | null
          gross_robux: number | null
          month: string | null
          net_robux: number | null
          net_usd: number | null
          roblox_cut_robux: number | null
          total_transactions: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      item_type: "GamePass" | "DevProduct" | "UGC" | "PremiumPayout" | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      item_type: ["GamePass", "DevProduct", "UGC", "PremiumPayout", "Other"],
    },
  },
} as const
