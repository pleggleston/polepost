import type { AppRole } from './enums';

export type Profile = {
  id: string;
  role: AppRole;
  is_organizer_enabled: boolean;
  is_21_verified: boolean;
  home_city: string | null;
  home_state: string | null;
};
