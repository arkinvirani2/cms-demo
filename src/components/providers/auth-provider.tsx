"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

type AuthStoreState = {
  initialize: () => Promise<void>;
  subscribeToAuthChanges: () => () => void;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state: AuthStoreState) => state.initialize);
  const subscribeToAuthChanges = useAuthStore(
    (state: AuthStoreState) => state.subscribeToAuthChanges,
  );

  useEffect(() => {
    void initialize();
    const unsubscribe = subscribeToAuthChanges();

    return () => {
      unsubscribe();
    };
  }, [initialize, subscribeToAuthChanges]);

  return <>{children}</>;
}
