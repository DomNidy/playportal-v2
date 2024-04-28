import { useContext } from "react";
import { AuthContext } from "~/providers/auth-provider";

export default function useAuth() {
  return useContext(AuthContext);
}
