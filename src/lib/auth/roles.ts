import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type UserRole = "doctor" | "patient";

export const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
};

export async function detectRoleByEmail(
  supabase: SupabaseClient<Database>,
  email: string,
): Promise<UserRole | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("id")
    .eq("email", normalizedEmail);

  if (doctorError) {
    throw new Error(doctorError.message);
  }

  if (doctor && doctor.length > 0) {
    return "doctor";
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("email", normalizedEmail);

  if (patientError) {
    throw new Error(patientError.message);
  }

  if (patient && patient.length > 0) {
    return "patient";
  }

  return null;
}

export function getDashboardPathByRole(role: UserRole) {
  return DASHBOARD_BY_ROLE[role];
}
