"use client";
import { Button } from "~/components/ui/Button";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from "~/components/ui/NavigationMenu";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/Sheet/Sheet";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PlayportalIcon from "../../../../public/playportal.svg";
import { createClient } from "~/utils/supabase/client";
import { useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";

export default function LandingPageNavbar() {
  const supabase = createClient();

  const [user, setUser] = useState<User>();
  useEffect(() => {
    console.log("Running effect");

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser(data.user);
      }
    };

    void fetchUser();
  }, [supabase.auth]);

  return (
    <div
      className="sticky top-0 z-50 flex h-14 w-full shrink-0   border-muted-foreground px-12
     backdrop-blur-md lg:px-24"
    >
      {/* Top left nav logo w/text */}
      <div className="flex w-[150px] text-primary-foreground">
        <Link className="flex items-center gap-2" href="/">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Image priority src={PlayportalIcon} alt="" />
          <span className="self-center text-xl font-bold tracking-tight text-primary-foreground">
            Playportal
          </span>
        </Link>
      </div>

      <div className="flex w-full justify-center ">
        <NavigationMenu className="hidden justify-start lg:flex">
          <NavigationMenuList className="gap-10">
            <NavigationMenuLink asChild>
              <Link
                className="cursor-pointer text-[0.8rem] font-medium text-muted/80 hover:text-white"
                href="/"
              >
                Home
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link
                className="cursor-pointer text-[0.8rem] font-medium text-muted/80 hover:text-white"
                href="/downloads"
              >
                Downloads
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link
                className="cursor-pointer text-[0.8rem] font-medium text-muted/80 hover:text-white"
                href="/#pricing"
              >
                Pricing
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link
                className="cursor-pointer text-[0.8rem] font-medium text-muted/80 hover:text-white"
                href="/support"
              >
                Support
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <Sheet>
        <SheetTrigger>
          {/* TODO: This button causes hydration error */}
          <Button
            className="bg-black hover:bg-white/20 lg:hidden"
            size="icon"
            asChild
          >
            <MenuIcon className="h-6 w-6" color="white" />
          </Button>{" "}
        </SheetTrigger>
        <SheetContent side={"right"} className="bg-black text-white">
          <Link className="flex items-center gap-2" href="#">
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <Image priority src={PlayportalIcon} alt="" />
            <span className="text-lg font-semibold">Playportal</span>
          </Link>
          <div className="grid gap-2 py-6">
            <Link
              className="flex w-full items-center py-2 text-lg font-semibold"
              href="/"
            >
              Home
            </Link>
            <Link
              className="flex w-full items-center py-2 text-lg font-semibold"
              href="/downloads"
            >
              Downloads
            </Link>
            <Link
              className="flex w-full items-center py-2 text-lg font-semibold"
              href="/#pricing"
            >
              Pricing
            </Link>
            <Link
              className="flex w-full items-center py-2 text-lg font-semibold"
              href="/support"
            >
              Support
            </Link>
            {!user ? (
              <>
                <Link
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  href="/sign-in"
                >
                  Log in
                </Link>

                <Link
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <Link
                className="flex w-full items-center py-2 text-lg font-semibold"
                href="/dashboard"
              >
                Dashboard
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <div className="mr-auto hidden gap-2 lg:flex">
        {!user ? (
          <>
            <Link
              className="inline-flex h-fit items-center justify-center self-center whitespace-nowrap rounded-md bg-primary-foreground  bg-white px-3 py-[0.33rem] text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              href={"/sign-in"}
            >
              Log in
            </Link>

            <Link
              className="inline-flex h-fit items-center justify-center self-center whitespace-nowrap  rounded-md bg-primary-foreground bg-ptl_accent-def px-3  py-[0.33rem] text-sm font-medium   text-white ring-offset-background  transition-colors hover:bg-primary/90 hover:bg-ptl_accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              href={"/sign-up"}
            >
              Sign up
            </Link>
          </>
        ) : (
          <Link
            className="inline-flex h-fit items-center justify-center self-center whitespace-nowrap rounded-md bg-primary-foreground  bg-white px-3 py-[0.33rem] text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            href={"/dashboard"}
          >
            Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

export function LandingPageNavbarFallback() {
  return (
    <div
      className="sticky top-0 z-50 flex h-14 w-full shrink-0   border-muted-foreground px-12
 backdrop-blur-md lg:px-24"
    ></div>
  );
}
