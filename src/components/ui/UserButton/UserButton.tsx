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
import { Link } from "~/components/ui/Link";
import { useUserSubscription } from "~/hooks/use-user-subscription";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../Dialog";
import { useSubscriptionPlans } from "~/hooks/use-subscription-plans";
import PricingSectionClientComponent from "../PricingSectionClientComponent/PricingSectionClientComponent";

// This is a client component, but will be provided the props from server components
export default function UserButton({
  user,
}: {
  user: Database["public"]["Tables"]["user_data"]["Row"] | null;
}) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [subDialogOpen, setSubDialogOpen] = useState<boolean>(false);

  const router = useRouter();
  const supabase = createClient();

  // TODO: Should we also move this up?
  const { data: availableSubscriptionPlans } = useSubscriptionPlans();

  // TODO: Should we move this user subscription hook up the component tree? Maybe context?
  const { data: userSubData } = useUserSubscription();

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger className="rounded-full">
        <Avatar
          className="pointer-events-none h-7 w-7 hover:cursor-pointer"
          onClick={() => {
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

        <Link href={"/dashboard/account"} variant={"mutedHover"}>
          Account
        </Link>

        <Link href={"/support"} variant={"mutedHover"}>
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

        <Dialog
          onOpenChange={(state) => {
            setSubDialogOpen(state);

            // If we just closed the sub dialog, and the dropdown is open, close that
            if (!state && dropdownOpen) {
              setDropdownOpen(false);
            }
          }}
          open={subDialogOpen}
        >
          <DialogTrigger onClick={() => setSubDialogOpen(!subDialogOpen)}>
            <div className="relative m-1 flex cursor-pointer select-none items-center rounded-sm bg-white px-2 py-1.5 text-sm text-black  outline-none transition-colors hover:bg-white/85 focus:cursor-pointer focus:bg-white/85  data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              {userSubData?.product_name ?? "Upgrade Now"}
            </div>
          </DialogTrigger>
          <DialogContent className="flex max-h-[600px] max-w-[90%] flex-col  justify-center rounded-lg md:max-w-[650px] lg:max-w-[850px] ">
            <DialogTitle>Subscription Plans</DialogTitle>

            <div className="my-2 flex h-full  flex-col items-center justify-center gap-2 overflow-y-scroll pt-[320px] sm:flex-row sm:overflow-y-auto  sm:pt-0 ">
              <PricingSectionClientComponent
                basicPlan={availableSubscriptionPlans?.basicPlan}
                standardPlan={availableSubscriptionPlans?.standardPlan}
                proPlan={availableSubscriptionPlans?.proPlan}
              />
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
