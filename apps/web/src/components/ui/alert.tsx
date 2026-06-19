import * as React from "react";
import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "info" | "success" | "warning" | "danger";
};

const variants = {
  info: "border-border bg-muted text-foreground",
  success: "border-accent bg-white text-foreground",
  warning: "border-yellow-500 bg-yellow-50 text-yellow-950",
  danger: "border-destructive bg-white text-destructive"
};

export function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn("rounded-md border px-4 py-3 text-sm", variants[variant], className)}
      {...props}
    />
  );
}
