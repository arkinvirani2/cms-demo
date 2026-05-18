import type { Session, User } from "@supabase/supabase-js";
import { detectRoleByEmail, type UserRole } from "@/lib/auth/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/types/database";

type LoginPayload = {
  email: string;
  password: string;
};

type SignupPayload = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

type AuthSuccess = {
  user: User;
  session: Session | null;
  role: UserRole;
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSuccess> {
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user?.email) {
      throw new Error("Unable to read user email from session.");
    }

    const role = await detectRoleByEmail(supabase, data.user.email);

    if (!role) {
      await supabase.auth.signOut();
      throw new Error("This account is not registered as doctor or patient.");
    }

    return {
      user: data.user,
      session: data.session,
      role,
    };
  },

  async signupPatient(payload: SignupPayload): Promise<AuthSuccess> {
    const supabase = createSupabaseBrowserClient();
    const normalizedEmail = payload.email.trim().toLowerCase();

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          phone: payload.phone,
        },
      },
    });

    if (signupError) {
      throw new Error(signupError.message);
    }

    if (!signupData.user) {
      throw new Error("Unable to create patient account.");
    }

    const { data: existingPatient, error: existingPatientError } = await supabase
      .from("patients")
      .select("id")
      .eq("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (existingPatientError) {
      throw new Error(existingPatientError.message);
    }

    if (!existingPatient) {
      const patientRow: Database["public"]["Tables"]["patients"]["Insert"] = {
        full_name: payload.fullName,
        phone: payload.phone,
        email: normalizedEmail,
      };

      const { error: insertPatientError } = await supabase
        .from("patients")
        .insert([patientRow] as never);

      if (insertPatientError) {
        throw new Error(insertPatientError.message);
      }
    }

    return {
      user: signupData.user,
      session: signupData.session,
      role: "patient",
    };
  },

  async logout() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  async fetchCurrentUser() {
    const supabase = createSupabaseBrowserClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session?.user?.email) {
      return null;
    }

    const role = await detectRoleByEmail(supabase, session.user.email);

    if (!role) {
      await supabase.auth.signOut();
      return null;
    }

    return {
      user: session.user,
      session,
      role,
    } satisfies AuthSuccess;
  },

  async resolveRoleByEmail(email: string) {
    const supabase = createSupabaseBrowserClient();
    return detectRoleByEmail(supabase, email);
  },
};
