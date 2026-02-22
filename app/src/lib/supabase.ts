import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'user' | 'admin';
          region: string | null;
          country: string | null;
          school_level: string | null;
          department: string | null;
          created_at: string;
          last_login: string | null;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          user_name: string | null;
          user_email: string | null;
          assignment_type: string;
          course_name: string;
          class_name: string;
          teacher_name: string;
          due_date: string;
          platform: string;
          platform_contact: string;
          description: string | null;
          files: string; // JSON array
          status: string;
          payment_amount: number | null;
          payment_id: string | null;
          complexity: string | null;
          estimated_hours: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['assignments']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assignments']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          assignment_id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: string;
          provider: string;
          wise_pay_in_id: string | null;
          transaction_reference: string;
          provider_transaction_id: string | null;
          created_at: string;
          completed_at: string | null;
          metadata: string | null; // JSON
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      activity_logs: {
        Row: {
          id: string;
          type: string;
          user_id: string | null;
          user_name: string | null;
          user_email: string | null;
          assignment_id: string | null;
          payment_id: string | null;
          description: string;
          timestamp: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'timestamp'>;
        Update: never;
      };
    };
  };
};
