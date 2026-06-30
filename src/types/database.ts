export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      amazon_accounts: {
        Row: {
          id: string
          profile_name: string
          email: string
          password: string
          owner_name: string | null
          phone: string | null
          card_type: string | null
          card_last4: string | null
          address: string | null
          notes: string | null
          stage: string
          stage_start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_name: string
          email: string
          password: string
          owner_name?: string | null
          phone?: string | null
          card_type?: string | null
          card_last4?: string | null
          address?: string | null
          notes?: string | null
          stage?: string
          stage_start_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_name?: string
          email?: string
          password?: string
          owner_name?: string | null
          phone?: string | null
          card_type?: string | null
          card_last4?: string | null
          address?: string | null
          notes?: string | null
          stage?: string
          stage_start_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
