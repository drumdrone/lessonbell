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
      teachers: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          teacher_id: string
          name: string
          email: string | null
          phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          status: 'scheduled' | 'completed' | 'cancelled'
          price: number | null
          is_paid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          price?: number | null
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          price?: number | null
          is_paid?: boolean
          created_at?: string
          updated_at?: string
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
      lesson_status: 'scheduled' | 'completed' | 'cancelled'
    }
  }
}

export type Teacher = Database['public']['Tables']['teachers']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
