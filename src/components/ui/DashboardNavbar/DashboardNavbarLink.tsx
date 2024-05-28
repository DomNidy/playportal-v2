import { Link } from "~/components/ui/Link";
import { type DashNavLink } from "./DashboardNavbar";

export function DashboardNavbarLink({
  link,
  currentPath,
}: {
  link: DashNavLink;
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
