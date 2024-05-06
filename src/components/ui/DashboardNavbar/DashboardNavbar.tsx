"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserButton from "../UserButton/UserButton";
import useAuth from "~/hooks/use-auth";

type NavbarLink = {
  href: string;
  text: string;
};

export default function DashboardNavbar({ links }: { links: NavbarLink[] }) {
  const location = usePathname();
  const { userData } = useAuth();

  return (
    <div className="sticky top-0 z-50 m-auto mb-4 flex h-fit w-full shrink-0 flex-col border-b bg-neutral-950 px-4 pb-0 md:px-6">
      <div className="mt-4 flex h-12 w-full flex-row justify-between font-semibold tracking-tight">
        Playportal
        <div className="top-0 flex flex-row items-start justify-center gap-4">
          <p className="mt-1 text-center text-sm tracking-normal text-white/70">
            Credits: {userData?.data?.userData?.credits}
          </p>
          <UserButton user={userData?.data?.userData ?? null} />
        </div>
      </div>
      <div className="mt-auto flex gap-8">
        {links.map((link, index) => (
          <NavbarLink key={index} link={link} currentPath={location} />
        ))}
      </div>
    </div>
  );
}

function NavbarLink({
  link,
  currentPath,
}: {
  link: NavbarLink;
  currentPath: string;
}) {
  return (
    <div
      className={`${currentPath === link.href ? "border-b-2 border-white text-white" : "text-white/70"} pb-2`}
    >
      <Link
        className="rounded-lg p-2 text-sm  underline-offset-2 hover:bg-white/10"
        href={link.href}
      >
        {link.text}
      </Link>
    </div>
  );
}
