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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["impact_level"]
          source: string | null
          status: Database["public"]["Enums"]["alert_status"]
          title: string
          type: string
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["impact_level"]
          source?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          title: string
          type: string
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["impact_level"]
          source?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          title?: string
          type?: string
        }
        Relationships: []
      }
      competitive_metrics: {
        Row: {
          ajio_cheaper_count: number | null
          avg_price_gap: number | null
          category: string | null
          created_at: string
          deal_intensity_score: number | null
          id: string
          metric_date: string
          myntra_cheaper_count: number | null
          price_competitiveness_score: number | null
        }
        Insert: {
          ajio_cheaper_count?: number | null
          avg_price_gap?: number | null
          category?: string | null
          created_at?: string
          deal_intensity_score?: number | null
          id?: string
          metric_date: string
          myntra_cheaper_count?: number | null
          price_competitiveness_score?: number | null
        }
        Update: {
          ajio_cheaper_count?: number | null
          avg_price_gap?: number | null
          category?: string | null
          created_at?: string
          deal_intensity_score?: number | null
          id?: string
          metric_date?: string
          myntra_cheaper_count?: number | null
          price_competitiveness_score?: number | null
        }
        Relationships: []
      }
      competitor_deals: {
        Row: {
          category: string | null
          competitor: string
          created_at: string
          deal_name: string
          deal_type: string | null
          discount_value: string | null
          end_date: string | null
          estimated_conversion_impact: number | null
          id: string
          impact_level: Database["public"]["Enums"]["impact_level"]
          is_flash_sale: boolean | null
          scraped_at: string
          start_date: string | null
        }
        Insert: {
          category?: string | null
          competitor?: string
          created_at?: string
          deal_name: string
          deal_type?: string | null
          discount_value?: string | null
          end_date?: string | null
          estimated_conversion_impact?: number | null
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"]
          is_flash_sale?: boolean | null
          scraped_at?: string
          start_date?: string | null
        }
        Update: {
          category?: string | null
          competitor?: string
          created_at?: string
          deal_name?: string
          deal_type?: string | null
          discount_value?: string | null
          end_date?: string | null
          estimated_conversion_impact?: number | null
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"]
          is_flash_sale?: boolean | null
          scraped_at?: string
          start_date?: string | null
        }
        Relationships: []
      }
      competitor_products: {
        Row: {
          brand: string | null
          category: string
          competitor: string
          created_at: string
          current_price: number
          discount_percentage: number | null
          id: string
          in_stock: boolean | null
          myntra_equivalent_price: number | null
          original_price: number | null
          price_difference: number | null
          product_name: string
          product_url: string | null
          scraped_at: string
          subcategory: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          competitor?: string
          created_at?: string
          current_price: number
          discount_percentage?: number | null
          id?: string
          in_stock?: boolean | null
          myntra_equivalent_price?: number | null
          original_price?: number | null
          price_difference?: number | null
          product_name: string
          product_url?: string | null
          scraped_at?: string
          subcategory?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          competitor?: string
          created_at?: string
          current_price?: number
          discount_percentage?: number | null
          id?: string
          in_stock?: boolean | null
          myntra_equivalent_price?: number | null
          original_price?: number | null
          price_difference?: number | null
          product_name?: string
          product_url?: string | null
          scraped_at?: string
          subcategory?: string | null
        }
        Relationships: []
      }
      dashboard_preferences: {
        Row: {
          created_at: string
          default_region: Database["public"]["Enums"]["region_type"] | null
          default_timeframe: string | null
          id: string
          notification_preferences: Json | null
          team_type: string | null
          updated_at: string
          user_id: string | null
          visible_widgets: Json | null
        }
        Insert: {
          created_at?: string
          default_region?: Database["public"]["Enums"]["region_type"] | null
          default_timeframe?: string | null
          id?: string
          notification_preferences?: Json | null
          team_type?: string | null
          updated_at?: string
          user_id?: string | null
          visible_widgets?: Json | null
        }
        Update: {
          created_at?: string
          default_region?: Database["public"]["Enums"]["region_type"] | null
          default_timeframe?: string | null
          id?: string
          notification_preferences?: Json | null
          team_type?: string | null
          updated_at?: string
          user_id?: string | null
          visible_widgets?: Json | null
        }
        Relationships: []
      }
      fashion_trends: {
        Row: {
          created_at: string
          description: string | null
          first_detected: string
          growth_rate: number | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          keywords: string[] | null
          last_updated: string
          myntra_inventory_match: number | null
          peak_prediction_date: string | null
          platforms: Database["public"]["Enums"]["trend_platform"][]
          predicted_lifespan_weeks: number | null
          regional_popularity: Json | null
          status: Database["public"]["Enums"]["trend_status"]
          trend_name: string
          velocity_score: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          first_detected: string
          growth_rate?: number | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          last_updated?: string
          myntra_inventory_match?: number | null
          peak_prediction_date?: string | null
          platforms: Database["public"]["Enums"]["trend_platform"][]
          predicted_lifespan_weeks?: number | null
          regional_popularity?: Json | null
          status?: Database["public"]["Enums"]["trend_status"]
          trend_name: string
          velocity_score?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          first_detected?: string
          growth_rate?: number | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          last_updated?: string
          myntra_inventory_match?: number | null
          peak_prediction_date?: string | null
          platforms?: Database["public"]["Enums"]["trend_platform"][]
          predicted_lifespan_weeks?: number | null
          regional_popularity?: Json | null
          status?: Database["public"]["Enums"]["trend_status"]
          trend_name?: string
          velocity_score?: number | null
        }
        Relationships: []
      }
      insights: {
        Row: {
          action_items: Json | null
          actioned_at: string | null
          category: string | null
          confidence_score: number | null
          created_at: string
          data_source: string | null
          description: string
          estimated_revenue_impact: number | null
          expires_at: string | null
          id: string
          impact_level: Database["public"]["Enums"]["impact_level"]
          is_actioned: boolean | null
          recommendation: string | null
          title: string
          type: Database["public"]["Enums"]["insight_type"]
        }
        Insert: {
          action_items?: Json | null
          actioned_at?: string | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          data_source?: string | null
          description: string
          estimated_revenue_impact?: number | null
          expires_at?: string | null
          id?: string
          impact_level: Database["public"]["Enums"]["impact_level"]
          is_actioned?: boolean | null
          recommendation?: string | null
          title: string
          type: Database["public"]["Enums"]["insight_type"]
        }
        Update: {
          action_items?: Json | null
          actioned_at?: string | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          data_source?: string | null
          description?: string
          estimated_revenue_impact?: number | null
          expires_at?: string | null
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"]
          is_actioned?: boolean | null
          recommendation?: string | null
          title?: string
          type?: Database["public"]["Enums"]["insight_type"]
        }
        Relationships: []
      }
      key_phrase_trends: {
        Row: {
          created_at: string
          first_seen: string
          id: string
          is_pain_point: boolean | null
          last_seen: string
          occurrence_count: number
          phrase: string
          sentiment_avg: number | null
          theme: Database["public"]["Enums"]["sentiment_theme"] | null
          trend_direction: string | null
        }
        Insert: {
          created_at?: string
          first_seen: string
          id?: string
          is_pain_point?: boolean | null
          last_seen: string
          occurrence_count?: number
          phrase: string
          sentiment_avg?: number | null
          theme?: Database["public"]["Enums"]["sentiment_theme"] | null
          trend_direction?: string | null
        }
        Update: {
          created_at?: string
          first_seen?: string
          id?: string
          is_pain_point?: boolean | null
          last_seen?: string
          occurrence_count?: number
          phrase?: string
          sentiment_avg?: number | null
          theme?: Database["public"]["Enums"]["sentiment_theme"] | null
          trend_direction?: string | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          discount_percentage: number | null
          id: string
          price: number
          product_id: string | null
          recorded_at: string
        }
        Insert: {
          discount_percentage?: number | null
          id?: string
          price: number
          product_id?: string | null
          recorded_at?: string
        }
        Update: {
          discount_percentage?: number | null
          id?: string
          price?: number
          product_id?: string | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "competitor_products"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          errors: Json | null
          id: string
          records_processed: number | null
          scrape_type: string
          source: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          id?: string
          records_processed?: number | null
          scrape_type: string
          source: string
          started_at: string
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          id?: string
          records_processed?: number | null
          scrape_type?: string
          source?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      sentiment_reviews: {
        Row: {
          created_at: string
          customer_cohort: Database["public"]["Enums"]["customer_cohort"] | null
          id: string
          key_phrases: string[] | null
          product_category: string | null
          product_id: string | null
          region: Database["public"]["Enums"]["region_type"] | null
          review_date: string
          review_text: string
          scraped_at: string
          sentiment: Database["public"]["Enums"]["sentiment_type"]
          sentiment_score: number
          source: string
          source_url: string | null
          theme: Database["public"]["Enums"]["sentiment_theme"] | null
        }
        Insert: {
          created_at?: string
          customer_cohort?:
            | Database["public"]["Enums"]["customer_cohort"]
            | null
          id?: string
          key_phrases?: string[] | null
          product_category?: string | null
          product_id?: string | null
          region?: Database["public"]["Enums"]["region_type"] | null
          review_date: string
          review_text: string
          scraped_at?: string
          sentiment: Database["public"]["Enums"]["sentiment_type"]
          sentiment_score: number
          source: string
          source_url?: string | null
          theme?: Database["public"]["Enums"]["sentiment_theme"] | null
        }
        Update: {
          created_at?: string
          customer_cohort?:
            | Database["public"]["Enums"]["customer_cohort"]
            | null
          id?: string
          key_phrases?: string[] | null
          product_category?: string | null
          product_id?: string | null
          region?: Database["public"]["Enums"]["region_type"] | null
          review_date?: string
          review_text?: string
          scraped_at?: string
          sentiment?: Database["public"]["Enums"]["sentiment_type"]
          sentiment_score?: number
          source?: string
          source_url?: string | null
          theme?: Database["public"]["Enums"]["sentiment_theme"] | null
        }
        Relationships: []
      }
      sentiment_trends: {
        Row: {
          avg_sentiment_score: number | null
          cohort: Database["public"]["Enums"]["customer_cohort"] | null
          created_at: string
          id: string
          negative_count: number
          neutral_count: number
          period_end: string
          period_start: string
          positive_count: number
          product_category: string | null
          region: Database["public"]["Enums"]["region_type"] | null
          review_velocity: number | null
          theme: Database["public"]["Enums"]["sentiment_theme"] | null
          top_key_phrases: Json | null
        }
        Insert: {
          avg_sentiment_score?: number | null
          cohort?: Database["public"]["Enums"]["customer_cohort"] | null
          created_at?: string
          id?: string
          negative_count?: number
          neutral_count?: number
          period_end: string
          period_start: string
          positive_count?: number
          product_category?: string | null
          region?: Database["public"]["Enums"]["region_type"] | null
          review_velocity?: number | null
          theme?: Database["public"]["Enums"]["sentiment_theme"] | null
          top_key_phrases?: Json | null
        }
        Update: {
          avg_sentiment_score?: number | null
          cohort?: Database["public"]["Enums"]["customer_cohort"] | null
          created_at?: string
          id?: string
          negative_count?: number
          neutral_count?: number
          period_end?: string
          period_start?: string
          positive_count?: number
          product_category?: string | null
          region?: Database["public"]["Enums"]["region_type"] | null
          review_velocity?: number | null
          theme?: Database["public"]["Enums"]["sentiment_theme"] | null
          top_key_phrases?: Json | null
        }
        Relationships: []
      }
      trend_forecasts: {
        Row: {
          confidence_score: number | null
          created_at: string
          forecast_date: string
          id: string
          predicted_growth: number | null
          predicted_status: Database["public"]["Enums"]["trend_status"] | null
          recommendation: string | null
          trend_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          forecast_date: string
          id?: string
          predicted_growth?: number | null
          predicted_status?: Database["public"]["Enums"]["trend_status"] | null
          recommendation?: string | null
          trend_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          forecast_date?: string
          id?: string
          predicted_growth?: number | null
          predicted_status?: Database["public"]["Enums"]["trend_status"] | null
          recommendation?: string | null
          trend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trend_forecasts_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "fashion_trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_metrics: {
        Row: {
          acceleration_rate: number | null
          created_at: string
          id: string
          metric_date: string
          myntra_searches: number
          platform_breakdown: Json | null
          regional_breakdown: Json | null
          social_mentions: number
          trend_id: string | null
        }
        Insert: {
          acceleration_rate?: number | null
          created_at?: string
          id?: string
          metric_date: string
          myntra_searches?: number
          platform_breakdown?: Json | null
          regional_breakdown?: Json | null
          social_mentions?: number
          trend_id?: string | null
        }
        Update: {
          acceleration_rate?: number | null
          created_at?: string
          id?: string
          metric_date?: string
          myntra_searches?: number
          platform_breakdown?: Json | null
          regional_breakdown?: Json | null
          social_mentions?: number
          trend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trend_metrics_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "fashion_trends"
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
      alert_status: "active" | "acknowledged" | "resolved"
      customer_cohort:
        | "gen_z"
        | "millennial"
        | "gen_x"
        | "new_user"
        | "returning_user"
        | "loyal_user"
      impact_level: "critical" | "high" | "medium" | "low"
      insight_type: "urgent" | "opportunity" | "trend" | "alert"
      region_type: "metro" | "tier_1" | "tier_2" | "tier_3"
      sentiment_theme:
        | "product_quality"
        | "pricing"
        | "delivery"
        | "returns"
        | "customer_service"
        | "app_usability"
      sentiment_type: "positive" | "negative" | "neutral"
      trend_platform:
        | "tiktok"
        | "instagram"
        | "pinterest"
        | "youtube"
        | "google_trends"
      trend_status: "emerging" | "established" | "peaking" | "cooling"
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
      alert_status: ["active", "acknowledged", "resolved"],
      customer_cohort: [
        "gen_z",
        "millennial",
        "gen_x",
        "new_user",
        "returning_user",
        "loyal_user",
      ],
      impact_level: ["critical", "high", "medium", "low"],
      insight_type: ["urgent", "opportunity", "trend", "alert"],
      region_type: ["metro", "tier_1", "tier_2", "tier_3"],
      sentiment_theme: [
        "product_quality",
        "pricing",
        "delivery",
        "returns",
        "customer_service",
        "app_usability",
      ],
      sentiment_type: ["positive", "negative", "neutral"],
      trend_platform: [
        "tiktok",
        "instagram",
        "pinterest",
        "youtube",
        "google_trends",
      ],
      trend_status: ["emerging", "established", "peaking", "cooling"],
    },
  },
} as const
