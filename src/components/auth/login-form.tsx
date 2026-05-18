"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getDashboardPathByRole } from "@/lib/auth/roles";
import { useAuthStore } from "@/store/auth.store";

type AuthStoreState = {
  login: (payload: {
    email: string;
    password: string;
  }) => Promise<"doctor" | "patient">;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state: AuthStoreState) => state.login);
  const loading = useAuthStore((state: AuthStoreState) => state.loading);
  const storeError = useAuthStore((state: AuthStoreState) => state.error);
  const clearError = useAuthStore((state: AuthStoreState) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const error = useMemo(
    () => localError ?? storeError,
    [localError, storeError],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }

    try {
      const role = await login({ email, password });
      router.replace(getDashboardPathByRole(role));
      router.refresh();
    } catch {
      // Store already contains a user-friendly error.
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
      <p className="mt-2 text-sm text-slate-600">
        Doctor and patient both login from this page.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-slate-500"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-slate-500"
            placeholder="********"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        New patient?{" "}
        <Link href="/signup" className="font-medium text-slate-900 underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
