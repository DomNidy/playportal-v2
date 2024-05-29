import { type VariantProps, cva } from "class-variance-authority";
import {
  type LinkProps as NextLinkProps,
  default as NextLink,
} from "next/link";
import React from "react";
import { cn } from "~/utils/utils";

const linkVariants = cva("", {
  variants: {
    variant: {
      default: "",
      button:
        "inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      mutedHover:
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-white/30 hover:text-white focus:cursor-pointer focus:bg-white/30 focus:text-accent-foreground focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      mutedFg: "text-muted-foreground hover:text-white",
    },
  },
  defaultVariants: { variant: "default" },
});

// Styles we use on our link component because our css variables are a mess

interface LinkProps
  extends NextLinkProps,
    React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {}

export default function Link({ className, variant, ...props }: LinkProps) {
  return (
    <NextLink {...props} className={cn(linkVariants({ variant }), className)} />
  );
}
