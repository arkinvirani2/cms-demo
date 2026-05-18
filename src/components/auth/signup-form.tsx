"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getDashboardPathByRole } from "@/lib/auth/roles";
import { useAuthStore } from "@/store/auth.store";

type AuthStoreState = {
  signup: (payload: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
  }) => Promise<"doctor" | "patient">;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

export function SignupForm() {
  const router = useRouter();
  const signup = useAuthStore((state: AuthStoreState) => state.signup);
  const loading = useAuthStore((state: AuthStoreState) => state.loading);
  const storeError = useAuthStore((state: AuthStoreState) => state.error);
  const clearError = useAuthStore((state: AuthStoreState) => state.clearError);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const error = useMemo(
    () => localError ?? storeError,
    [localError, storeError],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setLocalError(null);

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setLocalError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      const role = await signup({
        fullName,
        phone,
        email,
        password,
      });

      router.replace(getDashboardPathByRole(role));
      router.refresh();
    } catch {
      // Store already contains a user-friendly error.
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Patient Signup</h1>
      <p className="mt-2 text-sm text-slate-600">
        Doctor account is managed from backend only.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>
          <input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-slate-500"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Phone
          </label>
          <input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-slate-500"
            placeholder="+1 555 123 4567"
          />
        </div>

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
            placeholder="jane@example.com"
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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-slate-500"
            placeholder="********"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline">
          Login
        </Link>
      </p>
    </div>
  );
}
