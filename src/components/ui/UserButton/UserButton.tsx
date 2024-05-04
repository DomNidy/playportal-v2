"use client";
import { type Database } from "types_db";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { useState } from "react";
import { createClient } from "~/utils/supabase/client";
import { getStatusRedirect } from "~/utils/helpers";
import { useRouter } from "next/navigation";

// This is a client component, but will be provided the props from a server components
export default function UserButton({
  user,
}: {
  user: Database["public"]["Tables"]["user_data"]["Row"] | null;
}) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger className="rounded-full">
        <Avatar
          className="pointer-events-none h-7 w-7 hover:cursor-pointer"
          onClick={() => {
            console.log("Open");
            setDropdownOpen(!dropdownOpen);
          }}
        >
          <AvatarImage
            src={user?.avatar_url ?? ""}
            alt={user?.full_name ?? ""}
            className="w-"
          />
          <AvatarFallback>USR</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="mr-6 bg-black"
        side="bottom"
        sideOffset={10}
        alignOffset={20}
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground focus:cursor-pointer focus:bg-white/30 focus:text-white">
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground focus:cursor-pointer focus:bg-white/30 focus:text-white">
          Subscription
        </DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground focus:cursor-pointer focus:bg-white/30 focus:text-white">
          Support
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-muted-foreground focus:cursor-pointer focus:bg-white/30 focus:text-white"
          onClick={() => {
            void supabase.auth.signOut().then((res) => {
              if (res.error) {
                console.error(res.error);
              } else {
                const redirectPath = getStatusRedirect(
                  "/sign-in",
                  "Signed out",
                  "You've successfully signed out",
                );
                router.replace(redirectPath);
              }
            });
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
