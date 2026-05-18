import { LogoutButton } from "@/components/auth/logout-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DoctorDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Doctor Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Logged in as {user?.email ?? "Unknown doctor"}
            </p>
          </div>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
