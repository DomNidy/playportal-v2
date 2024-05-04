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

// This is a client component, but will be provided the props from a server components
export default function UserButton({
  user,
}: {
  user: Database["public"]["Tables"]["user_data"]["Row"] | null;
}) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

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
      <DropdownMenuContent className="bg-colors-background-950">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
