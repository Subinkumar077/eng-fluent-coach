export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          date: string | null
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          date?: string | null
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          date?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          current_streak: number | null
          email: string | null
          id: string
          level: number | null
          total_points: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          id: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          id?: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      sentence_corrections: {
        Row: {
          corrected_sentence: string
          created_at: string | null
          errors: Json | null
          explanation: string | null
          id: string
          original_sentence: string
          score: number | null
          user_id: string
        }
        Insert: {
          corrected_sentence: string
          created_at?: string | null
          errors?: Json | null
          explanation?: string | null
          id?: string
          original_sentence: string
          score?: number | null
          user_id: string
        }
        Update: {
          corrected_sentence?: string
          created_at?: string | null
          errors?: Json | null
          explanation?: string | null
          id?: string
          original_sentence?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      speaking_sessions: {
        Row: {
          conversation: Json
          created_at: string | null
          feedback: string | null
          id: string
          score: number | null
          topic: string
          user_id: string
        }
        Insert: {
          conversation: Json
          created_at?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          topic: string
          user_id: string
        }
        Update: {
          conversation?: Json
          created_at?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      user_vocabulary: {
        Row: {
          created_at: string | null
          id: string
          learned: boolean | null
          learned_at: string | null
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          learned?: boolean | null
          learned_at?: string | null
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          learned?: boolean | null
          learned_at?: string | null
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_vocabulary_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_words: {
        Row: {
          created_at: string | null
          difficulty: string | null
          example_sentence: string | null
          hindi_meaning: string | null
          id: string
          meaning: string | null
          part_of_speech: string | null
          pronunciation: string | null
          synonyms: string[] | null
          usage_tip: string | null
          word: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          example_sentence?: string | null
          hindi_meaning?: string | null
          id?: string
          meaning?: string | null
          part_of_speech?: string | null
          pronunciation?: string | null
          synonyms?: string[] | null
          usage_tip?: string | null
          word: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          example_sentence?: string | null
          hindi_meaning?: string | null
          id?: string
          meaning?: string | null
          part_of_speech?: string | null
          pronunciation?: string | null
          synonyms?: string[] | null
          usage_tip?: string | null
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
