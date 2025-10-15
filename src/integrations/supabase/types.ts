export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      buyers: {
        Row: {
          company: string | null
          created_at: string
          document: string | null
          document_type: string | null
          id: string
          name: string
          phone: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          document?: string | null
          document_type?: string | null
          id?: string
          name: string
          phone: string
        }
        Update: {
          company?: string | null
          created_at?: string
          document?: string | null
          document_type?: string | null
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          item_type: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          item_type: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          item_type?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          detailed_report: boolean
          id: string
          report_footer1: string
          report_footer2: string
          tab1_name: string
          tab2_name: string
        }
        Insert: {
          detailed_report?: boolean
          id?: string
          report_footer1?: string
          report_footer2?: string
          tab1_name?: string
          tab2_name?: string
        }
        Update: {
          detailed_report?: boolean
          id?: string
          report_footer1?: string
          report_footer2?: string
          tab1_name?: string
          tab2_name?: string
        }
        Relationships: []
      }
      tare_weights: {
        Row: {
          created_at: string
          id: string
          item_type: string
          tare_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_type: string
          tare_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          tare_kg?: number
        }
        Relationships: []
      }
      unit_prices: {
        Row: {
          created_at: string
          id: string
          item_type: string
          price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_type: string
          price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          price?: number
        }
        Relationships: []
      }
      weighing_entries: {
        Row: {
          gross_weight: number
          id: string
          item_type: string
          net_weight: number
          tare_used: number
          total_price: number
          unit_price: number
          weighing_id: string
        }
        Insert: {
          gross_weight: number
          id?: string
          item_type: string
          net_weight: number
          tare_used: number
          total_price: number
          unit_price: number
          weighing_id: string
        }
        Update: {
          gross_weight?: number
          id?: string
          item_type?: string
          net_weight?: number
          tare_used?: number
          total_price?: number
          unit_price?: number
          weighing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weighing_entries_weighing_id_fkey"
            columns: ["weighing_id"]
            isOneToOne: false
            referencedRelation: "weighings"
            referencedColumns: ["id"]
          },
        ]
      }
      weighings: {
        Row: {
          buyer_id: string | null
          created_at: string
          id: string
          report_date: string
          tab_name: string
          total_kg: number
          total_price: number
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          report_date?: string
          tab_name: string
          total_kg: number
          total_price: number
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          report_date?: string
          tab_name?: string
          total_kg?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "weighings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
