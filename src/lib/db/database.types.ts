/**
 * Hand-maintained Database type derived from supabase/migrations.
 * Run `supabase gen types typescript --local > src/lib/db/database.types.ts`
 * to regenerate when the schema changes.
 */

import type {
  AppRole,
  EventVisibility,
  AgeRequirement,
  ModerationStatus,
  EventLifecycleStatus,
  SwipeAction
} from './enums';

type ModerationDecision = 'approve' | 'reject' | 'flag';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          role: AppRole;
          is_organizer_enabled: boolean;
          is_21_verified: boolean;
          verified_21_at: string | null;
          home_city: string | null;
          home_state: string | null;
          requested_21_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          role?: AppRole;
          is_organizer_enabled?: boolean;
          is_21_verified?: boolean;
          verified_21_at?: string | null;
          home_city?: string | null;
          home_state?: string | null;
          requested_21_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          role?: AppRole;
          is_organizer_enabled?: boolean;
          is_21_verified?: boolean;
          verified_21_at?: string | null;
          home_city?: string | null;
          home_state?: string | null;
          requested_21_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizers: {
        Row: {
          id: string;
          owner_profile_id: string;
          name: string;
          slug: string;
          bio: string | null;
          contact_email: string | null;
          instagram_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_profile_id: string;
          name: string;
          slug: string;
          bio?: string | null;
          contact_email?: string | null;
          instagram_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_profile_id?: string;
          name?: string;
          slug?: string;
          bio?: string | null;
          contact_email?: string | null;
          instagram_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organizers_owner_profile_id_fkey';
            columns: ['owner_profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      event_categories: {
        Row: {
          id: string;
          slug: string;
          label: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          label?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          created_by_profile_id: string;
          title: string;
          slug: string;
          description: string;
          flyer_path: string;
          flyer_url: string | null;
          venue_name: string;
          address_line1: string | null;
          city: string;
          state: string;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          starts_at: string;
          ends_at: string | null;
          timezone: string;
          category_id: string;
          visibility: EventVisibility;
          age_requirement: AgeRequirement;
          external_url: string | null;
          lifecycle_status: EventLifecycleStatus;
          moderation_status: ModerationStatus;
          moderation_reason: string | null;
          approved_at: string | null;
          approved_by_profile_id: string | null;
          rejected_at: string | null;
          expired_at: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          created_by_profile_id: string;
          title: string;
          slug: string;
          description: string;
          flyer_path: string;
          flyer_url?: string | null;
          venue_name: string;
          address_line1?: string | null;
          city: string;
          state: string;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          starts_at: string;
          ends_at?: string | null;
          timezone?: string;
          category_id: string;
          visibility?: EventVisibility;
          age_requirement?: AgeRequirement;
          external_url?: string | null;
          lifecycle_status?: EventLifecycleStatus;
          moderation_status?: ModerationStatus;
          moderation_reason?: string | null;
          approved_at?: string | null;
          approved_by_profile_id?: string | null;
          rejected_at?: string | null;
          expired_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          created_by_profile_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          flyer_path?: string;
          flyer_url?: string | null;
          venue_name?: string;
          address_line1?: string | null;
          city?: string;
          state?: string;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          starts_at?: string;
          ends_at?: string | null;
          timezone?: string;
          category_id?: string;
          visibility?: EventVisibility;
          age_requirement?: AgeRequirement;
          external_url?: string | null;
          lifecycle_status?: EventLifecycleStatus;
          moderation_status?: ModerationStatus;
          moderation_reason?: string | null;
          approved_at?: string | null;
          approved_by_profile_id?: string | null;
          rejected_at?: string | null;
          expired_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_organizer_id_fkey';
            columns: ['organizer_id'];
            isOneToOne: false;
            referencedRelation: 'organizers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_created_by_profile_id_fkey';
            columns: ['created_by_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'event_categories';
            referencedColumns: ['id'];
          }
        ];
      };
      saved_events: {
        Row: {
          id: string;
          profile_id: string;
          event_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          event_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          event_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_events_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_events_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          }
        ];
      };
      event_swipes: {
        Row: {
          id: string;
          profile_id: string;
          event_id: string;
          action: SwipeAction;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          event_id: string;
          action: SwipeAction;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          event_id?: string;
          action?: SwipeAction;
          session_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_swipes_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_swipes_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          }
        ];
      };
      moderation_reviews: {
        Row: {
          id: string;
          event_id: string;
          reviewer_profile_id: string;
          decision: ModerationDecision;
          notes: string | null;
          reason_for_organizer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          reviewer_profile_id: string;
          decision: ModerationDecision;
          notes?: string | null;
          reason_for_organizer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          reviewer_profile_id?: string;
          decision?: ModerationDecision;
          notes?: string | null;
          reason_for_organizer?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'moderation_reviews_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'moderation_reviews_reviewer_profile_id_fkey';
            columns: ['reviewer_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_role: {
        Args: Record<string, never>;
        Returns: AppRole;
      };
      is_moderator_or_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      expire_stale_events: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      app_role: AppRole;
      event_visibility: EventVisibility;
      age_requirement: AgeRequirement;
      moderation_status: ModerationStatus;
      event_lifecycle_status: EventLifecycleStatus;
      swipe_action: SwipeAction;
      moderation_decision: ModerationDecision;
    };
    CompositeTypes: Record<string, never>;
  };
};
