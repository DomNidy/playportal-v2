export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          stripe_customer_id: string
        }
        Insert: {
          id: string
          stripe_customer_id: string
        }
        Update: {
          id?: string
          stripe_customer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      description_templates: {
        Row: {
          created_at: string
          description: Json | null
          id: string
          platform: Database["public"]["Enums"]["description_template_platform"]
          template_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: Json | null
          id?: string
          platform: Database["public"]["Enums"]["description_template_platform"]
          template_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: Json | null
          id?: string
          platform?: Database["public"]["Enums"]["description_template_platform"]
          template_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "description_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          feature: Database["public"]["Enums"]["feature"]
          id: number
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          feature: Database["public"]["Enums"]["feature"]
          id?: never
        }
        Update: {
          description?: string | null
          enabled?: boolean
          feature?: Database["public"]["Enums"]["feature"]
          id?: never
        }
        Relationships: []
      }
      file_metadata: {
        Row: {
          created_at: string
          file_origin: Database["public"]["Enums"]["file_origin"]
          file_type: Database["public"]["Enums"]["file_type"]
          operation_id: string | null
          s3_key: string
        }
        Insert: {
          created_at?: string
          file_origin: Database["public"]["Enums"]["file_origin"]
          file_type: Database["public"]["Enums"]["file_type"]
          operation_id?: string | null
          s3_key: string
        }
        Update: {
          created_at?: string
          file_origin?: Database["public"]["Enums"]["file_origin"]
          file_type?: Database["public"]["Enums"]["file_type"]
          operation_id?: string | null
          s3_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_metadata_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_metadata_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations_filemetadata"
            referencedColumns: ["operation_id"]
          },
        ]
      }
      kits: {
        Row: {
          created_at: string
          description: string | null
          download_url: string
          image_url: string | null
          name: string
          type: Database["public"]["Enums"]["kit_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_url: string
          image_url?: string | null
          name: string
          type: Database["public"]["Enums"]["kit_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          download_url?: string
          image_url?: string | null
          name?: string
          type?: Database["public"]["Enums"]["kit_type"]
        }
        Relationships: []
      }
      oauth_creds: {
        Row: {
          created_at: string
          id: string
          refresh_token: string | null
          service_account_id: string
          service_account_image_url: string | null
          service_account_name: string | null
          service_name: Database["public"]["Enums"]["service_enum"]
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          refresh_token?: string | null
          service_account_id: string
          service_account_image_url?: string | null
          service_account_name?: string | null
          service_name: Database["public"]["Enums"]["service_enum"]
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          refresh_token?: string | null
          service_account_id?: string
          service_account_image_url?: string | null
          service_account_name?: string | null
          service_name?: Database["public"]["Enums"]["service_enum"]
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_creds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_logs: {
        Row: {
          created_at: string
          id: number
          message: Database["public"]["Enums"]["operation_logs_enum"]
          operation_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message: Database["public"]["Enums"]["operation_logs_enum"]
          operation_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: Database["public"]["Enums"]["operation_logs_enum"]
          operation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operation_logs_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_logs_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations_filemetadata"
            referencedColumns: ["operation_id"]
          },
        ]
      }
      operations: {
        Row: {
          created_at: string
          id: string
          operation_duration: number | null
          status: Database["public"]["Enums"]["operation_status"] | null
          user_id: string | null
          video_title: string
        }
        Insert: {
          created_at?: string
          id?: string
          operation_duration?: number | null
          status?: Database["public"]["Enums"]["operation_status"] | null
          user_id?: string | null
          video_title?: string
        }
        Update: {
          created_at?: string
          id?: string
          operation_duration?: number | null
          status?: Database["public"]["Enums"]["operation_status"] | null
          user_id?: string | null
          video_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_prices"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["prod_id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          create_video_daily_quota: number
          file_size_limit_mb: number
          for_plan: string | null
          id: string
          upload_youtube_daily_quota: number
        }
        Insert: {
          create_video_daily_quota: number
          file_size_limit_mb: number
          for_plan?: string | null
          id: string
          upload_youtube_daily_quota?: number
        }
        Update: {
          create_video_daily_quota?: number
          file_size_limit_mb?: number
          for_plan?: string | null
          id?: string
          upload_youtube_daily_quota?: number
        }
        Relationships: [
          {
            foreignKeyName: "roles_for_plan_fkey"
            columns: ["for_plan"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_for_plan_fkey"
            columns: ["for_plan"]
            isOneToOne: true
            referencedRelation: "products_prices"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "roles_for_plan_fkey"
            columns: ["for_plan"]
            isOneToOne: true
            referencedRelation: "user_products"
            referencedColumns: ["prod_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "products_prices"
            referencedColumns: ["price_id"]
          },
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_refunds: {
        Row: {
          created_at: string
          id: string
          refund_for: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          refund_for?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          refund_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_refunds_refund_for_fkey"
            columns: ["refund_for"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          id: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_operation_logs: {
        Row: {
          created_at: string
          id: number
          message: Database["public"]["Enums"]["operation_logs_enum"] | null
          upload_operation_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message?: Database["public"]["Enums"]["operation_logs_enum"] | null
          upload_operation_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: Database["public"]["Enums"]["operation_logs_enum"] | null
          upload_operation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upload_operation_logs_upload_operation_id_fkey"
            columns: ["upload_operation_id"]
            isOneToOne: false
            referencedRelation: "upload_video_operations"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_video_operations: {
        Row: {
          create_operation_id: string
          created_at: string | null
          id: string
          metadata: Json
          oauth_creds_id: string | null
          status: Database["public"]["Enums"]["upload_video_status"]
          upload_options_id: string
          upload_platform: Database["public"]["Enums"]["upload_platform"]
        }
        Insert: {
          create_operation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json
          oauth_creds_id?: string | null
          status?: Database["public"]["Enums"]["upload_video_status"]
          upload_options_id: string
          upload_platform: Database["public"]["Enums"]["upload_platform"]
        }
        Update: {
          create_operation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json
          oauth_creds_id?: string | null
          status?: Database["public"]["Enums"]["upload_video_status"]
          upload_options_id?: string
          upload_platform?: Database["public"]["Enums"]["upload_platform"]
        }
        Relationships: [
          {
            foreignKeyName: "upload_video_operations_create_operation_id_fkey"
            columns: ["create_operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_video_operations_create_operation_id_fkey"
            columns: ["create_operation_id"]
            isOneToOne: false
            referencedRelation: "operations_filemetadata"
            referencedColumns: ["operation_id"]
          },
          {
            foreignKeyName: "upload_video_operations_oauth_creds_id_fkey"
            columns: ["oauth_creds_id"]
            isOneToOne: false
            referencedRelation: "oauth_creds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_video_operations_upload_options_id_fkey"
            columns: ["upload_options_id"]
            isOneToOne: true
            referencedRelation: "upload_video_options"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_video_options: {
        Row: {
          created_at: string
          id: string
          options: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
        }
        Relationships: []
      }
      user_data: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_data_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feature_flags: {
        Row: {
          enabled: boolean
          feature_flag_id: number
          id: string
          user_id: string | null
        }
        Insert: {
          enabled: boolean
          feature_flag_id: number
          id?: string
          user_id?: string | null
        }
        Update: {
          enabled?: boolean
          feature_flag_id?: number
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_flags_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_role: string | null
          user_id: string
        }
        Insert: {
          granted_role?: string | null
          user_id?: string
        }
        Update: {
          granted_role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_role_fkey"
            columns: ["granted_role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_role_fkey"
            columns: ["granted_role"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      operations_filemetadata: {
        Row: {
          created_at: string | null
          file_origin: Database["public"]["Enums"]["file_origin"] | null
          file_type: Database["public"]["Enums"]["file_type"] | null
          operation_duration: number | null
          operation_id: string | null
          s3_key: string | null
          status: Database["public"]["Enums"]["operation_status"] | null
          user_id: string | null
          video_title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products_prices: {
        Row: {
          create_video_daily_quota: number | null
          currency: string | null
          description: string | null
          file_size_limit_mb: number | null
          image: string | null
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          name: string | null
          price_active: boolean | null
          price_id: string | null
          price_metadata: Json | null
          price_type: Database["public"]["Enums"]["pricing_type"] | null
          product_active: boolean | null
          product_id: string | null
          trial_period_days: number | null
          unit_amount: number | null
        }
        Relationships: []
      }
      user_feature_flags_view: {
        Row: {
          feature: Database["public"]["Enums"]["feature"] | null
          feature_enabled: boolean | null
          feature_enabled_for_user: boolean | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_products: {
        Row: {
          active: boolean | null
          cancel_sub_at_period_end: boolean | null
          create_video_daily_quota: number | null
          currency: string | null
          description: string | null
          file_size_limit_mb: number | null
          id: string | null
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          prod_id: string | null
          product_description: string | null
          product_id: string | null
          product_image: string | null
          product_is_active: boolean | null
          product_metadata: Json | null
          product_name: string | null
          role_id: string | null
          sub_cancel_at: string | null
          sub_canceled_at: string | null
          sub_created: string | null
          sub_current_period_end: string | null
          sub_current_period_start: string | null
          sub_ended_at: string | null
          sub_id: string | null
          sub_status: Database["public"]["Enums"]["subscription_status"] | null
          sub_trial_end: string | null
          sub_trial_start: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
          upload_youtube_daily_quota: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_prices"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["prod_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string | null
          created_videos: number | null
          email: string | null
          granted_role: string | null
          user_id: string | null
          youtube_uploads: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_role_fkey"
            columns: ["granted_role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_role_fkey"
            columns: ["granted_role"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_operation_and_transaction: {
        Args: {
          user_id: string
          video_title: string
        }
        Returns: Database["public"]["CompositeTypes"]["operation_and_transaction_ids"]
      }
      create_upload_video_operation: {
        Args: {
          p_user_id: string
          p_upload_video_options: Json
          p_created_from_operation_id: string
          p_using_oauth_creds_id: string
        }
        Returns: {
          upload_operation_id: string
          upload_options_id: string
          trans_id: string
        }[]
      }
      delete_all_operation_data: {
        Args: {
          operation_to_delete_id: string
        }
        Returns: number
      }
      gen_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_quota_limits: {
        Args: {
          user_id: string
        }
        Returns: {
          role_id: string
          create_video_daily_quota: number
          file_size_limit_mb: number
          upload_youtube_daily_quota: number
        }[]
      }
      get_user_quota_usage_daily_create_video: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      get_user_quota_usage_daily_upload_youtube_video: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      handle_failed_operation_refund: {
        Args: {
          operation_id: string
          transaction_to_refund_id: string
        }
        Returns: undefined
      }
      handle_failed_upload_video_operation_refund: {
        Args: {
          upload_video_operation_id: string
          transaction_id_to_refund: string
        }
        Returns: undefined
      }
      update_upload_operation_metadata: {
        Args: {
          operation_id: string
          new_metadata: Json
        }
        Returns: undefined
      }
      update_upload_options: {
        Args: {
          upload_options_id: string
          new_upload_options: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      description_template_platform: "YouTube"
      feature: "upload_videos" | "link_youtube_accounts"
      file_origin: "PlayportalBackend" | "UserProvided"
      file_type: "Video" | "Audio" | "Image"
      kit_type: "drum-kit" | "midi-kit" | "loop-kit" | "preset-kit" | "other"
      operation_logs_enum:
        | "cv_unexpected_error"
        | "cv_dl_input_success"
        | "cv_dl_input_fail"
        | "cv_render_success"
        | "cv_render_fail"
        | "cv_output_to_s3_success"
        | "cv_output_to_s3_fail"
        | "uv_auth_success"
        | "uv_auth_fail"
        | "uv_unexpected_error"
        | "uv_dl_input_success"
        | "uv_dl_input_fail"
        | "uv_upload_success"
        | "uv_upload_fail"
      operation_status: "Ongoing" | "Failed" | "Completed"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      service_enum: "YouTube"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      transaction_type: "CreateVideo" | "UploadYoutubeVideo"
      upload_platform: "YouTube"
      upload_video_status: "Pending" | "Uploading" | "Completed" | "Failed"
    }
    CompositeTypes: {
      operation_and_transaction_ids: {
        operation_id: string | null
        transaction_id: string | null
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
