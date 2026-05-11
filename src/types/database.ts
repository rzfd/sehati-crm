// types/database.ts — Supabase generated types (manual)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row: {
          id:         string
          name:       string
          address:    string | null
          phone:      string | null
          logo_url:   string | null
          settings:   Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:        string
          name:       string
          address?:   string | null
          phone?:     string | null
          logo_url?:  string | null
          settings?:  Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["clinics"]["Insert"]>
        Relationships: []
      }

      doctors: {
        Row: {
          id:         string
          clinic_id:  string
          name:       string
          specialty:  string
          title:      string
          bio:        string | null
          avatar_url: string | null
          is_active:  boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:        string
          clinic_id:  string
          name:       string
          specialty:  string
          title?:     string
          bio?:       string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["doctors"]["Insert"]>
        Relationships: [
          { foreignKeyName: "doctors_clinic_id_fkey"; columns: ["clinic_id"]; referencedRelation: "clinics"; referencedColumns: ["id"] }
        ]
      }

      doctor_schedules: {
        Row: {
          id:                    string
          doctor_id:             string
          day_of_week:           number
          start_time:            string
          end_time:              string
          slot_duration_minutes: number
          max_patients:          number
          created_at:            string
        }
        Insert: {
          id?:                    string
          doctor_id:              string
          day_of_week:            number
          start_time:             string
          end_time:               string
          slot_duration_minutes?: number
          max_patients?:          number
          created_at?:            string
        }
        Update: Partial<Database["public"]["Tables"]["doctor_schedules"]["Insert"]>
        Relationships: [
          { foreignKeyName: "doctor_schedules_doctor_id_fkey"; columns: ["doctor_id"]; referencedRelation: "doctors"; referencedColumns: ["id"] }
        ]
      }

      staff_members: {
        Row: {
          id:               string
          user_id:          string | null
          clinic_id:        string
          name:             string
          role:             "admin" | "manager" | "receptionist" | "cs" | "doctor_assistant" | "marketing"
          linked_doctor_id: string | null
          avatar_url:       string | null
          is_active:        boolean
          created_at:       string
          updated_at:       string
        }
        Insert: {
          id?:               string
          user_id?:          string | null
          clinic_id:         string
          name:              string
          role:              "admin" | "manager" | "receptionist" | "cs" | "doctor_assistant" | "marketing"
          linked_doctor_id?: string | null
          avatar_url?:       string | null
          is_active?:        boolean
          created_at?:       string
          updated_at?:       string
        }
        Update: Partial<Database["public"]["Tables"]["staff_members"]["Insert"]>
        Relationships: [
          { foreignKeyName: "staff_members_clinic_id_fkey";        columns: ["clinic_id"];        referencedRelation: "clinics";  referencedColumns: ["id"] },
          { foreignKeyName: "staff_members_linked_doctor_id_fkey"; columns: ["linked_doctor_id"]; referencedRelation: "doctors";  referencedColumns: ["id"] }
        ]
      }

      patients: {
        Row: {
          id:                string
          user_id:           string | null
          clinic_id:         string
          name:              string
          phone:             string | null
          date_of_birth:     string | null
          primary_doctor_id: string | null
          is_new:            boolean
          tags:              string[]
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id?:                string
          user_id?:           string | null
          clinic_id:          string
          name:               string
          phone?:             string | null
          date_of_birth?:     string | null
          primary_doctor_id?: string | null
          is_new?:            boolean
          tags?:              string[]
          created_at?:        string
          updated_at?:        string
        }
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>
        Relationships: [
          { foreignKeyName: "patients_clinic_id_fkey";         columns: ["clinic_id"];         referencedRelation: "clinics"; referencedColumns: ["id"] },
          { foreignKeyName: "patients_primary_doctor_id_fkey"; columns: ["primary_doctor_id"]; referencedRelation: "doctors"; referencedColumns: ["id"] }
        ]
      }

      conversations: {
        Row: {
          id:               string
          clinic_id:        string
          patient_id:       string
          assigned_to:      string | null
          routed_to_doctor: string | null
          status:           "open" | "resolved" | "archived"
          category:         "faq" | "booking" | "medical" | "urgent" | "complaint" | "unclear" | null
          urgency_level:    number
          ai_handled:       boolean
          last_message_at:  string
          created_at:       string
          updated_at:       string
        }
        Insert: {
          id?:               string
          clinic_id:         string
          patient_id:        string
          assigned_to?:      string | null
          routed_to_doctor?: string | null
          status?:           "open" | "resolved" | "archived"
          category?:         "faq" | "booking" | "medical" | "urgent" | "complaint" | "unclear" | null
          urgency_level?:    number
          ai_handled?:       boolean
          last_message_at?:  string
          created_at?:       string
          updated_at?:       string
        }
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>
        Relationships: [
          { foreignKeyName: "conversations_clinic_id_fkey";        columns: ["clinic_id"];        referencedRelation: "clinics";        referencedColumns: ["id"] },
          { foreignKeyName: "conversations_patient_id_fkey";       columns: ["patient_id"];       referencedRelation: "patients";       referencedColumns: ["id"] },
          { foreignKeyName: "conversations_assigned_to_fkey";      columns: ["assigned_to"];      referencedRelation: "staff_members";  referencedColumns: ["id"] },
          { foreignKeyName: "conversations_routed_to_doctor_fkey"; columns: ["routed_to_doctor"]; referencedRelation: "doctors";        referencedColumns: ["id"] }
        ]
      }

      messages: {
        Row: {
          id:              string
          conversation_id: string
          sender_type:     "patient" | "staff" | "ai_bot"
          sender_id:       string | null
          content:         string
          metadata:        Json | null
          is_read:         boolean
          created_at:      string
        }
        Insert: {
          id?:              string
          conversation_id:  string
          sender_type:      "patient" | "staff" | "ai_bot"
          sender_id?:       string | null
          content:          string
          metadata?:        Json | null
          is_read?:         boolean
          created_at?:      string
        }
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>
        Relationships: [
          { foreignKeyName: "messages_conversation_id_fkey"; columns: ["conversation_id"]; referencedRelation: "conversations"; referencedColumns: ["id"] }
        ]
      }

      bookings: {
        Row: {
          id:              string
          clinic_id:       string
          patient_id:      string
          doctor_id:       string
          conversation_id: string | null
          booking_date:    string
          booking_time:    string
          status:          "pending" | "confirmed" | "completed" | "no_show" | "cancelled"
          notes:           string | null
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          clinic_id:        string
          patient_id:       string
          doctor_id:        string
          conversation_id?: string | null
          booking_date:     string
          booking_time:     string
          status?:          "pending" | "confirmed" | "completed" | "no_show" | "cancelled"
          notes?:           string | null
          created_at?:      string
          updated_at?:      string
        }
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>
        Relationships: [
          { foreignKeyName: "bookings_clinic_id_fkey";       columns: ["clinic_id"];       referencedRelation: "clinics";       referencedColumns: ["id"] },
          { foreignKeyName: "bookings_patient_id_fkey";      columns: ["patient_id"];      referencedRelation: "patients";      referencedColumns: ["id"] },
          { foreignKeyName: "bookings_doctor_id_fkey";       columns: ["doctor_id"];       referencedRelation: "doctors";       referencedColumns: ["id"] },
          { foreignKeyName: "bookings_conversation_id_fkey"; columns: ["conversation_id"]; referencedRelation: "conversations"; referencedColumns: ["id"] }
        ]
      }

      kb_qa_pairs: {
        Row: {
          id:          string
          clinic_id:   string
          question:    string
          answer:      string
          tags:        string[]
          status:      "draft" | "published" | "archived"
          embedding:   number[] | null
          usage_count: number
          created_by:  string | null
          created_at:  string
          updated_at:  string
        }
        Insert: {
          id?:          string
          clinic_id:    string
          question:     string
          answer:       string
          tags?:        string[]
          status?:      "draft" | "published" | "archived"
          embedding?:   number[] | null
          usage_count?: number
          created_by?:  string | null
          created_at?:  string
          updated_at?:  string
        }
        Update: Partial<Database["public"]["Tables"]["kb_qa_pairs"]["Insert"]>
        Relationships: [
          { foreignKeyName: "kb_qa_pairs_clinic_id_fkey";   columns: ["clinic_id"];  referencedRelation: "clinics";       referencedColumns: ["id"] },
          { foreignKeyName: "kb_qa_pairs_created_by_fkey";  columns: ["created_by"]; referencedRelation: "staff_members"; referencedColumns: ["id"] }
        ]
      }

      kb_documents: {
        Row: {
          id:              string
          clinic_id:       string
          title:           string
          file_url:        string
          file_type:       string
          file_size_bytes: number | null
          chunk_count:     number
          status:          "processing" | "ready" | "error"
          uploaded_by:     string | null
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          clinic_id:        string
          title:            string
          file_url:         string
          file_type:        string
          file_size_bytes?: number | null
          chunk_count?:     number
          status?:          "processing" | "ready" | "error"
          uploaded_by?:     string | null
          created_at?:      string
          updated_at?:      string
        }
        Update: Partial<Database["public"]["Tables"]["kb_documents"]["Insert"]>
        Relationships: [
          { foreignKeyName: "kb_documents_clinic_id_fkey";   columns: ["clinic_id"];   referencedRelation: "clinics";       referencedColumns: ["id"] },
          { foreignKeyName: "kb_documents_uploaded_by_fkey"; columns: ["uploaded_by"]; referencedRelation: "staff_members"; referencedColumns: ["id"] }
        ]
      }

      kb_document_chunks: {
        Row: {
          id:          string
          document_id: string
          clinic_id:   string
          chunk_index: number
          content:     string
          embedding:   number[] | null
          created_at:  string
        }
        Insert: {
          id?:          string
          document_id:  string
          clinic_id:    string
          chunk_index:  number
          content:      string
          embedding?:   number[] | null
          created_at?:  string
        }
        Update: Partial<Database["public"]["Tables"]["kb_document_chunks"]["Insert"]>
        Relationships: [
          { foreignKeyName: "kb_document_chunks_document_id_fkey"; columns: ["document_id"]; referencedRelation: "kb_documents"; referencedColumns: ["id"] },
          { foreignKeyName: "kb_document_chunks_clinic_id_fkey";   columns: ["clinic_id"];   referencedRelation: "clinics";       referencedColumns: ["id"] }
        ]
      }

      audit_log: {
        Row: {
          id:          string
          clinic_id:   string
          actor_id:    string | null
          action:      string
          target_type: string | null
          target_id:   string | null
          metadata:    Json | null
          created_at:  string
        }
        Insert: {
          id?:          string
          clinic_id:    string
          actor_id?:    string | null
          action:       string
          target_type?: string | null
          target_id?:   string | null
          metadata?:    Json | null
          created_at?:  string
        }
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>
        Relationships: [
          { foreignKeyName: "audit_log_clinic_id_fkey"; columns: ["clinic_id"]; referencedRelation: "clinics";       referencedColumns: ["id"] },
          { foreignKeyName: "audit_log_actor_id_fkey";  columns: ["actor_id"];  referencedRelation: "staff_members"; referencedColumns: ["id"] }
        ]
      }

      kb_query_logs: {
        Row: {
          id:              string
          clinic_id:       string
          conversation_id: string
          query:           string
          matched_id:      string | null
          match_type:      "qa_pair" | "document_chunk" | null
          similarity_score: number | null
          was_used:        boolean
          created_at:      string
        }
        Insert: {
          id?:               string
          clinic_id:         string
          conversation_id:   string
          query:             string
          matched_id?:       string | null
          match_type?:       "qa_pair" | "document_chunk" | null
          similarity_score?: number | null
          was_used?:         boolean
          created_at?:       string
        }
        Update: Partial<Database["public"]["Tables"]["kb_query_logs"]["Insert"]>
        Relationships: [
          { foreignKeyName: "kb_query_logs_clinic_id_fkey";       columns: ["clinic_id"];       referencedRelation: "clinics";       referencedColumns: ["id"] },
          { foreignKeyName: "kb_query_logs_conversation_id_fkey"; columns: ["conversation_id"]; referencedRelation: "conversations"; referencedColumns: ["id"] }
        ]
      }
    }

    Views: { [_ in never]: never }

    Functions: {
      match_kb: {
        Args: {
          query_embedding:   number[]
          match_threshold?:  number
          match_count?:      number
          filter_clinic_id?: string
        }
        Returns: {
          id:          string
          content:     string
          similarity:  number
          source_type: string
          source_id:   string
        }[]
      }
      get_my_clinic_id:  { Args: Record<string, never>; Returns: string }
      get_my_role:       { Args: Record<string, never>; Returns: string }
      get_my_patient_id: { Args: Record<string, never>; Returns: string }
    }

    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// ── Convenience row types ─────────────────────────────────
type Tables = Database["public"]["Tables"]

export type Clinic          = Tables["clinics"]["Row"]
export type Doctor          = Tables["doctors"]["Row"]
export type DoctorSchedule  = Tables["doctor_schedules"]["Row"]
export type StaffMember     = Tables["staff_members"]["Row"]
export type Patient         = Tables["patients"]["Row"]
export type Conversation    = Tables["conversations"]["Row"]
export type Message         = Tables["messages"]["Row"]
export type Booking         = Tables["bookings"]["Row"]
export type KBQAPair        = Tables["kb_qa_pairs"]["Row"]
export type KBDocument      = Tables["kb_documents"]["Row"]
export type KBDocumentChunk = Tables["kb_document_chunks"]["Row"]
export type AuditLog        = Tables["audit_log"]["Row"]
export type KBQueryLog      = Tables["kb_query_logs"]["Row"]
