"use client";
import { type Session, type User } from "@supabase/supabase-js";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";
import { type Database } from "types_db";
import useOnAuthStateChange from "~/hooks/use-on-auth-state-change";
import { createClient } from "~/utils/supabase/client";

interface AuthContext {
  session: Session | null;
  user: User | null;
  userData: UseQueryResult<{
    userData: Database["public"]["Tables"]["user_data"]["Row"] | null;
    activeOperationId: string | null;
  } | null> | null;
}

export const authContext = createContext<AuthContext>({
  session: null,
  user: null,
  userData: null,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const userData = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ["userData"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_data")
        .select("*")
        .eq("id", session?.user?.id ?? "")
        .single();

      const activeOperationId = await supabase
        .from("operations")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .eq("status", "Ongoing")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        userData: data,
        activeOperationId: activeOperationId.data?.id ?? null,
      };
    },
  });
  const supabase = createClient();

  useEffect(() => {
    void userData.refetch();
  }, [userData]);

  // Update this state whenever our auth state changes
  useOnAuthStateChange(async (ev, session) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  return (
    <authContext.Provider value={{ session, user, userData: userData ?? null }}>
      {children}
    </authContext.Provider>
  );
}
