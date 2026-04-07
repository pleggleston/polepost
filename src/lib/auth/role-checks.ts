import type { AppRole } from '@/lib/db/enums';

export function isAdmin(role: AppRole) {
  return role === 'admin';
}

export function isModeratorOrAdmin(role: AppRole) {
  return role === 'moderator' || role === 'admin';
}
