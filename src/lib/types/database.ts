export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      doctors: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          specialization: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          specialization?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          specialization?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      patients: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          gender: string | null;
          date_of_birth: string | null;
          address: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email?: string | null;
          gender?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          gender?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
