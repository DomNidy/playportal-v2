"use client";

import { type GoTrueClient } from "@supabase/supabase-js";
import { useEffect, useMemo } from "react";
import { createClient } from "~/utils/supabase/client";

export default function useOnAuthStateChange(
  callback: Parameters<GoTrueClient["onAuthStateChange"]>["0"],
) {
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await callback(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, callback]);
}
