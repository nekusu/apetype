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
      personal_bests: {
        Row: {
          language: string
          lazyMode: boolean
          mode: string
          mode2: string
          testId: string
          userId: string
          wpm: number
        }
        Insert: {
          language: string
          lazyMode: boolean
          mode: string
          mode2: string
          testId: string
          userId: string
          wpm: number
        }
        Update: {
          language?: string
          lazyMode?: boolean
          mode?: string
          mode2?: string
          testId?: string
          userId?: string
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_bests_testId_fkey"
            columns: ["testId"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_bests_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          accuracy: number
          blindMode: boolean
          charStats: number[]
          chartData: Json
          consistency: number
          createdAt: string
          duration: number
          id: string
          isPb: boolean
          language: string
          lazyMode: boolean
          mode: string
          mode2: string
          raw: number
          userId: string | null
          wpm: number
        }
        Insert: {
          accuracy: number
          blindMode?: boolean
          charStats: number[]
          chartData: Json
          consistency: number
          createdAt?: string
          duration: number
          id?: string
          isPb?: boolean
          language: string
          lazyMode?: boolean
          mode: string
          mode2: string
          raw: number
          userId?: string | null
          wpm: number
        }
        Update: {
          accuracy?: number
          blindMode?: boolean
          charStats?: number[]
          chartData?: Json
          consistency?: number
          createdAt?: string
          duration?: number
          id?: string
          isPb?: boolean
          language?: string
          lazyMode?: boolean
          mode?: string
          mode2?: string
          raw?: number
          userId?: string | null
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "tests_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          avgAccuracy: number
          avgConsistency: number
          avgRaw: number
          avgWpm: number
          completedTests: number
          highestAccuracy: number
          highestConsistency: number
          highestRaw: number
          highestWpm: number
          startedTests: number
          timeTyping: number
          userId: string
        }
        Insert: {
          avgAccuracy?: number
          avgConsistency?: number
          avgRaw?: number
          avgWpm?: number
          completedTests?: number
          highestAccuracy?: number
          highestConsistency?: number
          highestRaw?: number
          highestWpm?: number
          startedTests?: number
          timeTyping?: number
          userId?: string
        }
        Update: {
          avgAccuracy?: number
          avgConsistency?: number
          avgRaw?: number
          avgWpm?: number
          completedTests?: number
          highestAccuracy?: number
          highestConsistency?: number
          highestRaw?: number
          highestWpm?: number
          startedTests?: number
          timeTyping?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_userId_fkey"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatarShape: Database["public"]["Enums"]["avatarShape"]
          avatarURL: string | null
          bannerURL: string | null
          bio: string
          id: string
          joinedAt: string
          keyboard: string
          name: string
          nameLastChangedAt: string | null
          socials: Json
        }
        Insert: {
          avatarShape?: Database["public"]["Enums"]["avatarShape"]
          avatarURL?: string | null
          bannerURL?: string | null
          bio?: string
          id?: string
          joinedAt?: string
          keyboard?: string
          name: string
          nameLastChangedAt?: string | null
          socials?: Json
        }
        Update: {
          avatarShape?: Database["public"]["Enums"]["avatarShape"]
          avatarURL?: string | null
          bannerURL?: string | null
          bio?: string
          id?: string
          joinedAt?: string
          keyboard?: string
          name?: string
          nameLastChangedAt?: string | null
          socials?: Json
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email: {
        Args: {
          emailToCheck: string
        }
        Returns: boolean
      }
      increment_stats: {
        Args: {
          id: string
          startedTests?: number
          completedTests?: number
          timeTyping?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      avatarShape: "rect" | "round"
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
