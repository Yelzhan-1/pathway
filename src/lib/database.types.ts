/**
 * Hand-written Supabase database types for the existing Pathway schema.
 * The database itself (tables, RLS, triggers) is managed outside this app —
 * do not add migrations here. Keep this file in sync with the real schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ApplicantPath = "graduate" | "transfer";

export type ShortlistCategory = "dream" | "target" | "safety";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskSource = "roadmap" | "agent" | "manual";

export type TaskRelatedType = "university" | "exam" | "opportunity";

export type OpportunityType =
  | "olympiad"
  | "summer_program"
  | "internship"
  | "competition"
  | "research"
  | "scholarship"
  | "course";

export type AgentMessageRole = "user" | "assistant";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          path: ApplicantPath | null;
          grade_or_year: string | null;
          city: string | null;
          target_countries: string[] | null;
          intended_major: string | null;
          budget_usd: number | null;
          needs_scholarship: boolean;
          gpa: number | null;
          gpa_scale: number | null;
          exams: Json;
          activities: Json;
          cv: Json;
          onboarding_completed: boolean;
          onboarding_step: number;
          intake_year: number | null;
          english_level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          path?: ApplicantPath | null;
          grade_or_year?: string | null;
          city?: string | null;
          target_countries?: string[] | null;
          intended_major?: string | null;
          budget_usd?: number | null;
          needs_scholarship?: boolean;
          gpa?: number | null;
          gpa_scale?: number | null;
          exams?: Json;
          activities?: Json;
          cv?: Json;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          intake_year?: number | null;
          english_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          path?: ApplicantPath | null;
          grade_or_year?: string | null;
          city?: string | null;
          target_countries?: string[] | null;
          intended_major?: string | null;
          budget_usd?: number | null;
          needs_scholarship?: boolean;
          gpa?: number | null;
          gpa_scale?: number | null;
          exams?: Json;
          activities?: Json;
          cv?: Json;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          intake_year?: number | null;
          english_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      universities: {
        Row: {
          id: string;
          slug: string;
          name: string;
          country: string;
          city: string | null;
          website_url: string | null;
          majors: string[] | null;
          requirements: Json;
          deadlines: Json;
          tuition_usd_per_year: number | null;
          tuition_note: string | null;
          aid_for_internationals: string | null;
          scholarships: string | null;
          acceptance_rate: number | null;
          source_url: string;
          extra_sources: string[] | null;
          last_verified: string;
          notes: string | null;
          created_at: string;
          source_type: string;
          sat_total_min: number | null;
          sat_total_max: number | null;
          region: string | null;
          ielts_min: number | null;
          toefl_min: number | null;
          duolingo_min: number | null;
          unt_min: number | null;
          sat_policy: string | null;
          sat_middle_50: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          country: string;
          city?: string | null;
          website_url?: string | null;
          majors?: string[] | null;
          requirements?: Json;
          deadlines?: Json;
          tuition_usd_per_year?: number | null;
          tuition_note?: string | null;
          aid_for_internationals?: string | null;
          scholarships?: string | null;
          acceptance_rate?: number | null;
          source_url: string;
          extra_sources?: string[] | null;
          last_verified: string;
          notes?: string | null;
          created_at?: string;
          source_type?: string;
          sat_total_min?: number | null;
          sat_total_max?: number | null;
          region?: never;
          ielts_min?: never;
          toefl_min?: never;
          duolingo_min?: never;
          unt_min?: never;
          sat_policy?: never;
          sat_middle_50?: never;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          country?: string;
          city?: string | null;
          website_url?: string | null;
          majors?: string[] | null;
          requirements?: Json;
          deadlines?: Json;
          tuition_usd_per_year?: number | null;
          tuition_note?: string | null;
          aid_for_internationals?: string | null;
          scholarships?: string | null;
          acceptance_rate?: number | null;
          source_url?: string;
          extra_sources?: string[] | null;
          last_verified?: string;
          notes?: string | null;
          created_at?: string;
          source_type?: string;
          sat_total_min?: number | null;
          sat_total_max?: number | null;
          region?: never;
          ielts_min?: never;
          toefl_min?: never;
          duolingo_min?: never;
          unt_min?: never;
          sat_policy?: never;
          sat_middle_50?: never;
        };
        Relationships: [];
      };
      exams: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          score_scale: string | null;
          typical_test_dates_note: string | null;
          cost_note: string | null;
          validity_note: string | null;
          official_url: string | null;
          source_url: string;
          last_verified: string;
          created_at: string;
          source_type: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          score_scale?: string | null;
          typical_test_dates_note?: string | null;
          cost_note?: string | null;
          validity_note?: string | null;
          official_url?: string | null;
          source_url: string;
          last_verified: string;
          created_at?: string;
          source_type?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          score_scale?: string | null;
          typical_test_dates_note?: string | null;
          cost_note?: string | null;
          validity_note?: string | null;
          official_url?: string | null;
          source_url?: string;
          last_verified?: string;
          created_at?: string;
          source_type?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          slug: string;
          title: string;
          type: OpportunityType;
          field: string | null;
          description: string | null;
          eligibility: string | null;
          grades: string[] | null;
          deadline: string | null;
          deadline_note: string | null;
          cost: string | null;
          format: string | null;
          url: string | null;
          source_url: string;
          last_verified: string;
          created_at: string;
          source_type: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          type: OpportunityType;
          field?: string | null;
          description?: string | null;
          eligibility?: string | null;
          grades?: string[] | null;
          deadline?: string | null;
          deadline_note?: string | null;
          cost?: string | null;
          format?: string | null;
          url?: string | null;
          source_url: string;
          last_verified: string;
          created_at?: string;
          source_type?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          type?: OpportunityType;
          field?: string | null;
          description?: string | null;
          eligibility?: string | null;
          grades?: string[] | null;
          deadline?: string | null;
          deadline_note?: string | null;
          cost?: string | null;
          format?: string | null;
          url?: string | null;
          source_url?: string;
          last_verified?: string;
          created_at?: string;
          source_type?: string;
        };
        Relationships: [];
      };
      shortlist: {
        Row: {
          id: string;
          user_id: string;
          university_id: string;
          category: ShortlistCategory;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          university_id: string;
          category: ShortlistCategory;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          university_id?: string;
          category?: ShortlistCategory;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shortlist_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          status: TaskStatus;
          source: TaskSource;
          related_type: TaskRelatedType | null;
          related_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          source: TaskSource;
          related_type?: TaskRelatedType | null;
          related_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          source?: TaskSource;
          related_type?: TaskRelatedType | null;
          related_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_messages: {
        Row: {
          id: string;
          user_id: string;
          role: AgentMessageRole;
          content: string;
          parts: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          role: AgentMessageRole;
          content: string;
          parts?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AgentMessageRole;
          content?: string;
          parts?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
