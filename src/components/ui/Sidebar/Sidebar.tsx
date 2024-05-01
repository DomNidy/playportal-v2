"use client";
import { usePathname } from "next/navigation";
import React from "react";
import PlayportalIcon from "~/components/icons/PlayportalIcon";
import Link from "next/link";
import { SidebarButton } from "./SidebarButton";
import HomeIcon from "~/components/icons/HomeIcon";
import PackageIcon from "~/components/icons/PackageIcon";
import { TooltipProvider } from "../Tooltip";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const location = usePathname();

  return (
    <TooltipProvider>
      <div className="flex h-screen">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
              href="#"
            >
              <PlayportalIcon className="h-4 w-4 rounded-full transition-all group-hover:scale-110" />
              <span className="sr-only">Playportal</span>
            </Link>

            <SidebarButton
              currentPath={location}
              href="/dashboard"
              label="Dashboard"
              icon={HomeIcon}
            />

            <SidebarButton
              currentPath={location}
              href="/dashboard/my-videos"
              icon={PackageIcon}
              label="My Videos"
            />

            <SidebarButton
              currentPath={location}
              href="/dashboard/transactions"
              icon={PackageIcon}
              label="Transaction History"
            />
          </nav>
        </aside>
        <div className="ml-14 flex-1">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
