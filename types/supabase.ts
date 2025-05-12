export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      birthdays: {
        Row: {
          id: string
          user_id: string
          name: string
          birthdate: string
          notes: string
          show_age: boolean
          profile_pic_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          birthdate: string
          notes?: string
          show_age?: boolean
          profile_pic_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          birthdate?: string
          notes?: string
          show_age?: boolean
          profile_pic_url?: string | null
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: string
          status: string
          current_period_end: string
          created_at: string
          updated_at: string
          payment_provider: string
          payment_reference: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: string
          status: string
          current_period_end: string
          created_at?: string
          updated_at?: string
          payment_provider?: string
          payment_reference?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: string
          status?: string
          current_period_end?: string
          updated_at?: string
          payment_provider?: string
          payment_reference?: string
        }
      }
      payment_intents: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          status: string
          provider: string
          provider_reference: string
          redirect_url: string | null
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency: string
          status: string
          provider: string
          provider_reference: string
          redirect_url?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: string
          provider?: string
          provider_reference?: string
          redirect_url?: string | null
          updated_at?: string
          metadata?: Json
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          display_name: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          display_name?: string | null
        }
        Update: {
          id?: string
          email?: string
          updated_at?: string
          display_name?: string | null
        }
      }
    }
  }
}
