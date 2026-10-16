import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export class AuthService {
  public static async getCurrentUser(): Promise<SupabaseAuthUser | null> {
    if (!supabase) {
      // Return guest demo user
      const guest = localStorage.getItem('smart_recycle_guest_user');
      if (guest) return JSON.parse(guest);
      const defaultGuest: SupabaseAuthUser = {
        id: 'guest-eco-user',
        email: 'alex.eco@greenmail.org',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };
      localStorage.setItem('smart_recycle_guest_user', JSON.stringify(defaultGuest));
      return defaultGuest;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url
      };
    } catch (err) {
      console.warn('Supabase auth fetch failed:', err);
      return null;
    }
  }

  public static async signInWithEmail(email: string): Promise<{ success: boolean; message: string }> {
    if (!supabase) {
      const guest: SupabaseAuthUser = {
        id: `guest-${Date.now()}`,
        email,
        name: email.split('@')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };
      localStorage.setItem('smart_recycle_guest_user', JSON.stringify(guest));
      return { success: true, message: 'Logged in to Local Demo profile.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      return { success: true, message: 'Magic login link sent to your inbox!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Authentication failed' };
    }
  }

  public static async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('smart_recycle_guest_user');
  }
}
