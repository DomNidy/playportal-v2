"use client";
import { usePathname } from "next/navigation";
import { type DashNavLink } from "./DashboardNavbar";
import { DashboardNavbarLink } from "./DashboardNavbarLink";

export function DashboardNavbarLinks({ links }: { links: DashNavLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <DashboardNavbarLink
          link={link}
          key={link.href}
          currentPath={pathname}
        />
      ))}
    </>
  );
}
