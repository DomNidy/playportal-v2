import { type SVGProps } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import Link from "next/link";

export function SidebarButton({
  currentPath,
  href,
  label,
  icon,
}: {
  currentPath: string;
  href: string;
  label: string;
  icon: (
    props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
  ) => JSX.Element;
}) {
  const Icon = icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Link
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ${
            currentPath == href ? "bg-accent text-accent-foreground" : ""
          }`}
          href={href}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{label}</span>
        </Link>{" "}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
