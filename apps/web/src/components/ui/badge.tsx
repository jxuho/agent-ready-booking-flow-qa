import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger";
};

const variants = {
  default: "bg-muted text-muted-foreground",
  success: "bg-accent text-accent-foreground",
  warning: "bg-yellow-100 text-yellow-950",
  danger: "bg-destructive text-destructive-foreground"
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-md px-2 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
