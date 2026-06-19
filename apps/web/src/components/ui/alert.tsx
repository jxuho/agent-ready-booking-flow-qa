import * as React from "react";
import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "info" | "success" | "warning" | "danger";
};

const variants = {
  info: "border-border bg-muted text-foreground",
  success: "border-accent bg-green-50 text-foreground",
  warning: "border-yellow-500 bg-yellow-50 text-yellow-950",
  danger: "border-destructive bg-red-50 text-red-950"
};

export function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn("rounded-md border px-4 py-3 text-sm leading-6", variants[variant], className)}
      {...props}
    />
  );
}
