import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type Profile, type SubscriptionTier } from "../lib/supabase";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  authConfigured: boolean;
  isAuthModalOpen: boolean;
  authMode: "login" | "signup" | "reset" | "update";
  openAuthModal: (mode?: "login" | "signup" | "reset" | "update") => void;
  closeAuthModal: () => void;
  isSubscriptionModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  subscriptionTier: SubscriptionTier;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset" | "update">("login");
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("id, email, full_name, avatar_url, role, subscription_tier").eq("id", userId).maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!active) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) await fetchProfile(initialSession.user.id);
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("update");
        setIsAuthModalOpen(true);
      }
      if (nextSession?.user) {
        window.setTimeout(() => { if (active) void fetchProfile(nextSession.user.id); }, 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const openAuthModal = (mode: "login" | "signup" | "reset" | "update" = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error("Authentication is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setIsAuthModalOpen(false);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) throw new Error("Authentication is not configured.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    });
    if (error) throw error;
    setIsAuthModalOpen(false);
  };

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error("Authentication is not configured.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}#reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    if (!supabase) throw new Error("Authentication is not configured.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      authConfigured: Boolean(supabase),
      isAuthModalOpen,
      authMode,
      openAuthModal,
      closeAuthModal: () => setIsAuthModalOpen(false),
      isSubscriptionModalOpen,
      openSubscriptionModal: () => setIsSubscriptionModalOpen(true),
      closeSubscriptionModal: () => setIsSubscriptionModalOpen(false),
      signIn,
      signUp,
      resetPassword,
      updatePassword,
      signOut,
      refreshProfile,
      subscriptionTier: profile?.subscription_tier ?? "free",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// The hook intentionally lives beside its provider so consumers share the
// same context contract; this is safe and does not affect Fast Refresh state.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
