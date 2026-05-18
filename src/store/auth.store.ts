"use client";

import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/lib/auth/roles";
import { authService } from "@/services/auth.service";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SignupPayload = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<UserRole>;
  signup: (payload: SignupPayload) => Promise<UserRole>;
  logout: () => Promise<void>;
  clearError: () => void;
  subscribeToAuthChanges: () => () => void;
};

type AuthPersistedState = Pick<AuthState, "role">;

type AuthSetState = (
  nextState:
    | Partial<AuthState>
    | ((state: AuthState) => Partial<AuthState>),
) => void;

type AuthGetState = () => AuthState;

const authStateCreator = (set: AuthSetState, get: AuthGetState): AuthState => ({
  user: null,
  session: null,
  role: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    await get().fetchCurrentUser();
    set({ initialized: true });
  },

  fetchCurrentUser: async () => {
    set({ loading: true, error: null });

    try {
      const current = await authService.fetchCurrentUser();

      if (!current) {
        set({ user: null, session: null, role: null, loading: false });
        return;
      }

      set({
        user: current.user,
        session: current.session,
        role: current.role,
        loading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch current user.";

      set({
        user: null,
        session: null,
        role: null,
        loading: false,
        error: message,
      });
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });

    try {
      const result = await authService.login(payload);

      set({
        user: result.user,
        session: result.session,
        role: result.role,
        loading: false,
      });

      return result.role;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to login.";

      set({
        user: null,
        session: null,
        role: null,
        loading: false,
        error: message,
      });

      throw error;
    }
  },

  signup: async (payload) => {
    set({ loading: true, error: null });

    try {
      const result = await authService.signupPatient(payload);

      set({
        user: result.user,
        session: result.session,
        role: result.role,
        loading: false,
      });

      return result.role;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to signup.";

      set({ loading: false, error: message });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });

    try {
      await authService.logout();
      set({
        user: null,
        session: null,
        role: null,
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to logout.";

      set({ loading: false, error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  subscribeToAuthChanges: () => {
    const supabase = createSupabaseBrowserClient();

    const authStateChange = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (!session?.user?.email) {
          set({ user: null, session: null, role: null });
          return;
        }

        void authService.resolveRoleByEmail(session.user.email).then((role) => {
          if (!role) {
            set({ user: null, session: null, role: null });
            return;
          }

          set({ user: session.user, session, role });
        });
      },
    );

    const subscription = authStateChange.data.subscription;

    return () => {
      subscription.unsubscribe();
    };
  },
});

export const useAuthStore = create<AuthState>()(
  persist(
    authStateCreator,
    {
      name: "clinic-auth-store",
      partialize: (state: AuthState): AuthPersistedState => ({
        role: state.role,
      }),
    },
  ),
);
