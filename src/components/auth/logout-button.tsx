"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

type AuthStoreState = {
  logout: () => Promise<void>;
  loading: boolean;
};

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((state: AuthStoreState) => state.logout);
  const loading = useAuthStore((state: AuthStoreState) => state.loading);

  async function handleLogout() {
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch {
      // Error state is already handled in auth store.
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Signing out..." : "Logout"}
    </button>
  );
}
