import * as React from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, type: _type, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn("mt-1 h-4 w-4 rounded border-input text-primary", className)}
      {...props}
    />
  )
);

Checkbox.displayName = "Checkbox";
