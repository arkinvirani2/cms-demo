import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { detectRoleByEmail, getDashboardPathByRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const role = await detectRoleByEmail(supabase, user.email);

    if (role) {
      redirect(getDashboardPathByRole(role));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <SignupForm />
    </main>
  );
}
