export type SubscriptionTier = "free" | "moonlight" | "solar" | "cosmic";
export type Relation = "self" | "partner" | "mom" | "friend" | "other";
export type MessageRole = "user" | "assistant";

export interface PlanetData {
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

export interface PlanetsJson {
  Sun: PlanetData;
  Moon: PlanetData;
  Mercury: PlanetData;
  Venus: PlanetData;
  Mars: PlanetData;
  Jupiter: PlanetData;
  Saturn: PlanetData;
  Uranus: PlanetData;
  Neptune: PlanetData;
  Pluto: PlanetData;
}

export interface AscendantData {
  sign: string;
  degree: number;
}

export interface HouseData {
  house: number;
  sign: string;
  degree: number;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          subscription_tier: SubscriptionTier;
          tokens_left: number;
          tokens_reset_at: string | null;
          lang: string;
          theme: string;
          telegram_chat_id: string | null;
          notify_email: boolean;
          notify_telegram: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          subscription_tier?: SubscriptionTier;
          tokens_left?: number;
          tokens_reset_at?: string | null;
          lang?: string;
          theme?: string;
          telegram_chat_id?: string | null;
          notify_email?: boolean;
          notify_telegram?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          subscription_tier?: SubscriptionTier;
          tokens_left?: number;
          tokens_reset_at?: string | null;
          lang?: string;
          theme?: string;
          telegram_chat_id?: string | null;
          notify_email?: boolean;
          notify_telegram?: boolean;
          updated_at?: string;
        };
      };
      natal_charts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          relation: Relation;
          birth_date: string;
          birth_time: string | null;
          birth_city: string;
          lat: number;
          lng: number;
          planets_json: Json;
          houses_json: Json;
          ascendant: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          relation?: Relation;
          birth_date: string;
          birth_time?: string | null;
          birth_city: string;
          lat: number;
          lng: number;
          planets_json: Json;
          houses_json: Json;
          ascendant: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          relation?: Relation;
          birth_date?: string;
          birth_time?: string | null;
          birth_city?: string;
          lat?: number;
          lng?: number;
          planets_json?: Json;
          houses_json?: Json;
          ascendant?: Json;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          chat_id: string;
          chart_id: string | null;
          role: MessageRole;
          content: string;
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chat_id: string;
          chart_id?: string | null;
          role: MessageRole;
          content: string;
          tokens_used?: number;
          created_at?: string;
        };
        Update: never;
      };
      chat_summaries: {
        Row: {
          id: string;
          user_id: string;
          chat_id: string;
          chart_id: string | null;
          summary: string;
          messages_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chat_id: string;
          chart_id?: string | null;
          summary: string;
          messages_count: number;
          created_at?: string;
        };
        Update: never;
      };
      daily_horoscopes: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          content: string;
          sent_email: boolean;
          sent_tg: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          content: string;
          sent_email?: boolean;
          sent_tg?: boolean;
          created_at?: string;
        };
        Update: {
          sent_email?: boolean;
          sent_tg?: boolean;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: SubscriptionTier;
          status: string;
          lemon_squeezy_id: string | null;
          started_at: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: SubscriptionTier;
          status: string;
          lemon_squeezy_id?: string | null;
          started_at?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan?: SubscriptionTier;
          status?: string;
          lemon_squeezy_id?: string | null;
          expires_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_tier: SubscriptionTier;
      relation: Relation;
      message_role: MessageRole;
    };
  };
}
