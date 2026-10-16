import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, SupabaseAuthUser, supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: SupabaseAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithUsername: (username: string, password?: string) => Promise<{ success: boolean; message: string }>;
  signupWithUsername: (username: string, email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check saved session
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.warn('Failed to load user session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Listen for auth state changes if Supabase is active
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url
          });
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin }
        });
        return;
      }

      // Offline / Local development fallback: simulate verified Google account
      await new Promise((r) => setTimeout(r, 600));
      const googleUser: SupabaseAuthUser = {
        id: `google-${Date.now()}`,
        email: 'alex.rivera.eco@gmail.com',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };
      localStorage.setItem('smart_recycle_guest_user', JSON.stringify(googleUser));
      setUser(googleUser);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithUsername = async (username: string, _password?: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const cleanUsername = username.trim().replace(/^@/, '');
      const userProfile: SupabaseAuthUser = {
        id: `user-${cleanUsername.toLowerCase()}`,
        email: `${cleanUsername.toLowerCase()}@smartrecycle.ai`,
        name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`
      };
      localStorage.setItem('smart_recycle_guest_user', JSON.stringify(userProfile));
      setUser(userProfile);
      setIsAuthModalOpen(false);
      return { success: true, message: `Welcome back, @${cleanUsername}!` };
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithUsername = async (username: string, email: string, _password?: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const cleanUsername = username.trim().replace(/^@/, '');
      const newUser: SupabaseAuthUser = {
        id: `user-${cleanUsername.toLowerCase()}`,
        email: email.trim(),
        name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`
      };
      localStorage.setItem('smart_recycle_guest_user', JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthModalOpen(false);
      return { success: true, message: `Account created! Welcome to SmartRecycle, @${cleanUsername}.` };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithUsername,
        signupWithUsername,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
