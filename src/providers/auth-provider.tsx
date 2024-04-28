// "use client";
// import { type User } from "@supabase/supabase-js";
// import { useRouter } from "next/navigation";
// import { createContext, useEffect, useState } from "react";
// import { createClient } from "~/utils/supabase/client";

// interface IAuthContext {
//   user: User | null;
// }

// export const AuthContext = createContext<IAuthContext>({
//   // The currently authed user, null if not authed
//   user: null,
// });

// export default function AuthProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const supabase = createClient();
//   const [user, setUser] = useState<User | null>(null);
//   const router = useRouter();
//   // Add event listeners for auth changes

//   useEffect(() => {
//     const { data } = supabase.auth.onAuthStateChange(async (event) => {
//       // getUser() is more secure as it directly contacts the auth server
//       const _user = await supabase.auth.getUser();
//       setUser(_user.data.user);

//       if (event === "SIGNED_OUT") {
//         alert("siged")
//         router.push("/sign-in");
//       }
//     });

//     // Remove event listeners on unmount
//     return () => data.subscription.unsubscribe();
//   }, [router, supabase.auth]);

//   return (
//     <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
//   );
// }
