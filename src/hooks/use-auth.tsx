"use client";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";
import { authContext } from "~/providers/auth-provider";

export default function useAuth() {
  const context = useContext(authContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
