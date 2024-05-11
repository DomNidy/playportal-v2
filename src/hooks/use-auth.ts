import { useContext } from "react";
import { authContext } from "~/providers/auth-provider";

export default function useAuth() {
  const auth = useContext(authContext);

  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return auth;
}
