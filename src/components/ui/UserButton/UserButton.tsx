"use client";
import { type Database } from "types_db";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../DropdownMenu/DropdownMenu";
import { useState } from "react";
import { createClient } from "~/utils/supabase/client";
import { getStatusRedirect } from "~/utils/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserSubscription } from "~/hooks/use-user-subscription";

// This is a client component, but will be provided the props from server components
export default function UserButton({
  user,
}: {
  user: Database["public"]["Tables"]["user_data"]["Row"] | null;
}) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();
  // TODO: Should we move this user subscription hook up the component tree? Maybe context?
  const { data: userSubData, isLoading: isUserSubDataLoading } =
    useUserSubscription();

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
        className="mr-6 bg-colors-background-900"
        side="bottom"
        sideOffset={10}
        alignOffset={20}
      >
        <DropdownMenuLabel className="text-muted-foreground">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-muted-foreground/20" />

        <Link
          href={"/dashboard/account"}
          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-white/30 hover:text-white focus:cursor-pointer focus:bg-white/30 focus:text-accent-foreground focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
          Account
        </Link>

        <Link
          href={"/support"}
          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-white/30 hover:text-white focus:cursor-pointer focus:bg-white/30 focus:text-accent-foreground focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
          Support
        </Link>

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
        <DropdownMenuSeparator className="bg-muted-foreground/20" />

        {/** This should trigger a modal that shows the 3 subscription cards if the user clicks it*/}
        {/** For subscribed users, we'll show them this as the options they can upgrade to */}

        <div className="relative m-1 flex cursor-pointer select-none items-center rounded-sm bg-white px-2 py-1.5 text-sm text-black  outline-none transition-colors hover:bg-white/85 focus:cursor-pointer focus:bg-white/85  data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          {userSubData?.product_name ?? "Upgrade Now"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
