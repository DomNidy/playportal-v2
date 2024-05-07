"use client";
import {
  type AuthChangeEvent,
  type Session,
  type User,
} from "@supabase/supabase-js";
import { createContext, useCallback, useState } from "react";
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
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  console.log("AuthProvider Rendered");

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);

  const callback = useCallback(
    async (ev: AuthChangeEvent, session: Session | null) => {
      console.log(ev);
      setSession(session);
      setUser(session?.user ?? null);
    },
    [],
  );

  // Update this state whenever our auth state changes
  useOnAuthStateChange(callback);

  return (
    <authContext.Provider value={{ session, user }}>
      {children}
    </authContext.Provider>
  );
}
