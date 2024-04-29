"use client";
import { type Session, type User } from "@supabase/supabase-js";
import { createContext, useState } from "react";
import useOnAuthStateChange from "~/hooks/use-on-auth-state-change";

interface AuthContext {
  session: Session | null;
  user: User | null;
}

export const authContext = createContext<AuthContext>({
  session: null,
  user: null,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Update this state whenever our auth state changes
  useOnAuthStateChange((ev, session) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  return (
    <authContext.Provider value={{ session, user }}>
      {children}
    </authContext.Provider>
  );
}
