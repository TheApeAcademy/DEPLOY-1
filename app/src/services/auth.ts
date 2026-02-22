import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

// ── Sign Up ──────────────────────────────────────────────────
export const signUp = async (
  name: string,
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Signup failed — no user returned' };

  // Fetch the profile created by the DB trigger
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!profile) return { user: null, error: 'Profile not found after signup' };

  return { user: mapProfile(profile), error: null };
};

// ── Log In ───────────────────────────────────────────────────
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Login failed' };

  // Update last_login
  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.user.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!profile) return { user: null, error: 'Profile not found' };

  return { user: mapProfile(profile), error: null };
};

// ── Log Out ──────────────────────────────────────────────────
export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

// ── Get current session user ─────────────────────────────────
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return profile ? mapProfile(profile) : null;
};

// ── Update profile (region/country/etc) ──────────────────────
export const updateProfile = async (
  userId: string,
  updates: { region?: string; country?: string; school_level?: string; department?: string }
): Promise<{ error: string | null }> => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  return { error: error?.message ?? null };
};

// ── Map DB profile row → app User type ───────────────────────
const mapProfile = (profile: any): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role,
  region: profile.region ?? undefined,
  country: profile.country ?? undefined,
  schoolLevel: profile.school_level ?? undefined,
  department: profile.department ?? undefined,
  createdAt: profile.created_at,
  lastLogin: profile.last_login ?? undefined,
});
