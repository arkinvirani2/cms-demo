import { redirect } from "next/navigation";
import { detectRoleByEmail } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DoctorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const role = await detectRoleByEmail(supabase, user.email);

  if (role === "patient") {
    redirect("/patient/dashboard");
  }

  if (role !== "doctor") {
    redirect("/login");
  }

  return <>{children}</>;
}
