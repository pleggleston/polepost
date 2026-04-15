import { createClient } from '@/lib/supabase/server';
import { isModeratorOrAdmin } from '@/lib/auth/role-checks';
import type { AppRole } from '@/lib/db/enums';

export type OrganizerApplication = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  created_at: string;
  owner_profile_id: string;
  owner: {
    display_name: string | null;
    username: string | null;
  } | null;
};

export type ActiveOrganizer = {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  created_at: string;
  owner_profile_id: string;
  owner: {
    display_name: string | null;
    username: string | null;
    role: string;
  } | null;
};

async function assertStaffAccess(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated.');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: AppRole }>();

  if (error) throw new Error(`Failed to load role: ${error.message}`);

  if (!isModeratorOrAdmin(profile?.role ?? 'user')) {
    throw new Error('Not authorized.');
  }

  return user.id;
}

export async function listPendingOrganizerApplications(): Promise<OrganizerApplication[]> {
  await assertStaffAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organizers')
    .select('id, name, slug, bio, contact_email, instagram_url, created_at, owner_profile_id, owner:profiles!organizers_owner_profile_id_fkey (display_name, username)')
    .eq('is_active', false)
    .order('created_at', { ascending: true })
    .returns<OrganizerApplication[]>();

  if (error) throw new Error(`Failed to load applications: ${error.message}`);
  return data ?? [];
}

export async function approveOrganizerApplication(
  organizerId: string,
  ownerProfileId: string
): Promise<{ error: string | null }> {
  await assertStaffAccess();
  const supabase = await createClient();

  const { error: orgError } = await supabase
    .from('organizers')
    .update({ is_active: true })
    .eq('id', organizerId);

  if (orgError) return { error: `Failed to activate organizer: ${orgError.message}` };

  // Grant organizer role and enable on the profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_organizer_enabled: true, role: 'organizer' })
    .eq('id', ownerProfileId);

  if (profileError) {
    return { error: `Organizer activated but profile update failed: ${profileError.message}` };
  }

  return { error: null };
}

export async function denyOrganizerApplication(
  organizerId: string
): Promise<{ error: string | null }> {
  await assertStaffAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from('organizers')
    .delete()
    .eq('id', organizerId)
    .eq('is_active', false); // safety: only delete pending ones

  if (error) return { error: `Failed to deny application: ${error.message}` };
  return { error: null };
}

export async function listActiveOrganizers(): Promise<ActiveOrganizer[]> {
  await assertStaffAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organizers')
    .select('id, name, slug, contact_email, created_at, owner_profile_id, owner:profiles!organizers_owner_profile_id_fkey (display_name, username, role)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .returns<ActiveOrganizer[]>();

  if (error) throw new Error(`Failed to load active organizers: ${error.message}`);
  return data ?? [];
}

export async function disableOrganizer(
  organizerId: string,
  ownerProfileId: string
): Promise<{ error: string | null }> {
  await assertStaffAccess();
  const supabase = await createClient();

  const { error: orgError } = await supabase
    .from('organizers')
    .update({ is_active: false })
    .eq('id', organizerId);

  if (orgError) return { error: `Failed to disable organizer: ${orgError.message}` };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_organizer_enabled: false, role: 'user' })
    .eq('id', ownerProfileId)
    .eq('role', 'organizer'); // only downgrade if still organizer role (don't touch admins)

  if (profileError) {
    return { error: `Organizer disabled but profile update failed: ${profileError.message}` };
  }

  return { error: null };
}
