export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type UserLanguage = 'en' | 'fr' | 'sw'
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending'
export type ContactMethod = 'phone' | 'telegram' | 'whatsapp' | 'email'
export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'sold' | 'archived'
export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'
export type ReportReason = 'spam' | 'inappropriate_content' | 'fake_listing' | 'wrong_category' | 'duplicate' | 'scam' | 'other'
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'
export type NotificationType = 'post_approved' | 'post_rejected' | 'post_expired' | 'message_received' | 'favorite_added' | 'report_resolved'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          telegram_id: number | null
          password_hash: string | null
          email_verified: boolean
          phone_verified: boolean
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          language: UserLanguage
          country: string
          city: string | null
          timezone: string
          role: UserRole
          status: UserStatus
          reputation_score: number
          verification_level: number
          preferred_contact_method: ContactMethod
          show_phone: boolean
          show_telegram: boolean
          last_active_at: string | null
          posts_count: number
          successful_transactions: number
          reports_against: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          email?: string | null
          phone?: string | null
          telegram_id?: number | null
          password_hash?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          language?: UserLanguage
          country: string
          city?: string | null
          timezone?: string
          role?: UserRole
          status?: UserStatus
          reputation_score?: number
          verification_level?: number
          preferred_contact_method?: ContactMethod
          show_phone?: boolean
          show_telegram?: boolean
          last_active_at?: string | null
          posts_count?: number
          successful_transactions?: number
          reports_against?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          telegram_id?: number | null
          password_hash?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          language?: UserLanguage
          country?: string
          city?: string | null
          timezone?: string
          role?: UserRole
          status?: UserStatus
          reputation_score?: number
          verification_level?: number
          preferred_contact_method?: ContactMethod
          show_phone?: boolean
          show_telegram?: boolean
          last_active_at?: string | null
          posts_count?: number
          successful_transactions?: number
          reports_against?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          description: string
          price: number | null
          currency: string
          is_negotiable: boolean
          condition: ItemCondition
          images: string[]
          video_url: string | null
          country: string
          city: string
          area: string | null
          exact_location: Json | null
          contact_method: ContactMethod
          contact_phone: string | null
          contact_telegram: string | null
          contact_whatsapp: string | null
          contact_email: string | null
          status: PostStatus
          featured_until: string | null
          boost_level: number
          auto_renew: boolean
          views_count: number
          favorites_count: number
          reports_count: number
          clicks_count: number
          slug: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          expires_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title: string
          description: string
          price?: number | null
          currency?: string
          is_negotiable?: boolean
          condition?: ItemCondition
          images?: string[]
          video_url?: string | null
          country: string
          city: string
          area?: string | null
          exact_location?: Json | null
          contact_method?: ContactMethod
          contact_phone?: string | null
          contact_telegram?: string | null
          contact_whatsapp?: string | null
          contact_email?: string | null
          status?: PostStatus
          featured_until?: string | null
          boost_level?: number
          auto_renew?: boolean
          views_count?: number
          favorites_count?: number
          reports_count?: number
          clicks_count?: number
          slug?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title?: string
          description?: string
          price?: number | null
          currency?: string
          is_negotiable?: boolean
          condition?: ItemCondition
          images?: string[]
          video_url?: string | null
          country?: string
          city?: string
          area?: string | null
          exact_location?: Json | null
          contact_method?: ContactMethod
          contact_phone?: string | null
          contact_telegram?: string | null
          contact_whatsapp?: string | null
          contact_email?: string | null
          status?: PostStatus
          featured_until?: string | null
          boost_level?: number
          auto_renew?: boolean
          views_count?: number
          favorites_count?: number
          reports_count?: number
          clicks_count?: number
          slug?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string
          deleted_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          parent_id: string | null
          name_en: string
          name_fr: string
          name_sw: string
          icon: string | null
          color: string
          image_url: string | null
          is_active: boolean
          requires_moderation: boolean
          allows_price: boolean
          max_images: number
          slug: string
          meta_description_en: string | null
          meta_description_fr: string | null
          meta_description_sw: string | null
          posts_count: number
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          name_en: string
          name_fr: string
          name_sw: string
          icon?: string | null
          color?: string
          image_url?: string | null
          is_active?: boolean
          requires_moderation?: boolean
          allows_price?: boolean
          max_images?: number
          slug: string
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_sw?: string | null
          posts_count?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          name_en?: string
          name_fr?: string
          name_sw?: string
          icon?: string | null
          color?: string
          image_url?: string | null
          is_active?: boolean
          requires_moderation?: boolean
          allows_price?: boolean
          max_images?: number
          slug?: string
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_sw?: string | null
          posts_count?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      countries: {
        Row: {
          id: string
          code: string
          name_en: string
          name_fr: string
          name_sw: string
          is_active: boolean
          default_currency: string
          default_language: UserLanguage
          timezone: string
          phone_prefix: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name_en: string
          name_fr: string
          name_sw: string
          is_active?: boolean
          default_currency: string
          default_language?: UserLanguage
          timezone: string
          phone_prefix?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name_en?: string
          name_fr?: string
          name_sw?: string
          is_active?: boolean
          default_currency?: string
          default_language?: UserLanguage
          timezone?: string
          phone_prefix?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          country_id: string
          name: string
          latitude: number | null
          longitude: number | null
          is_active: boolean
          posts_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_id: string
          name: string
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          posts_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_id?: string
          name?: string
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          posts_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          post_id: string | null
          reported_user_id: string | null
          reason: ReportReason
          description: string | null
          status: ReportStatus
          resolved_by: string | null
          resolved_at: string | null
          resolution_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          post_id?: string | null
          reported_user_id?: string | null
          reason: ReportReason
          description?: string | null
          status?: ReportStatus
          resolved_by?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          post_id?: string | null
          reported_user_id?: string | null
          reason?: ReportReason
          description?: string | null
          status?: ReportStatus
          resolved_by?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          post_id: string | null
          related_user_id: string | null
          read_at: string | null
          sent_via: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          post_id?: string | null
          related_user_id?: string | null
          read_at?: string | null
          sent_via?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          post_id?: string | null
          related_user_id?: string | null
          read_at?: string | null
          sent_via?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_language: UserLanguage
      user_role: UserRole
      user_status: UserStatus
      contact_method: ContactMethod
      post_status: PostStatus
      item_condition: ItemCondition
      report_reason: ReportReason
      report_status: ReportStatus
      notification_type: NotificationType
    }
  }
} 