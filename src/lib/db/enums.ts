export const APP_ROLES = ['user', 'organizer', 'moderator', 'admin'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const EVENT_VISIBILITIES = ['public', 'registered', 'verified_21_plus', 'admin_only'] as const;
export type EventVisibility = (typeof EVENT_VISIBILITIES)[number];

export const AGE_REQUIREMENTS = ['all_ages', 'age_18_plus', 'age_21_plus'] as const;
export type AgeRequirement = (typeof AGE_REQUIREMENTS)[number];

export const MODERATION_STATUSES = ['pending_review', 'approved', 'rejected', 'flagged'] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const EVENT_LIFECYCLE_STATUSES = ['draft', 'pending', 'approved', 'rejected', 'flagged', 'expired'] as const;
export type EventLifecycleStatus = (typeof EVENT_LIFECYCLE_STATUSES)[number];

export const SWIPE_ACTIONS = ['dismiss', 'save', 'open'] as const;
export type SwipeAction = (typeof SWIPE_ACTIONS)[number];
