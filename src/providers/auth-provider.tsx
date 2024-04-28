"use client";
import { type User } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";
import { createClient } from "~/utils/supabase/client";

interface IAuthContext {
  user: User | null;
}

export const AuthContext = createContext<IAuthContext>({
  // The currently authed user, null if not authed
  user: null,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  // Add event listeners for auth changes

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Remove event listeners on unmount
    return () => data.subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}
