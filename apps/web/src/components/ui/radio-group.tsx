import * as React from "react";
import { cn } from "@/lib/utils";

type RadioGroupProps = React.FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  legend: string;
};

export function RadioGroup({ children, className, legend, ...props }: RadioGroupProps) {
  return (
    <fieldset className={cn("grid gap-3", className)} {...props}>
      <legend className="sr-only">{legend}</legend>
      {children}
    </fieldset>
  );
}

type RadioOptionProps = React.InputHTMLAttributes<HTMLInputElement> & {
  children?: React.ReactNode;
  label: string;
  description?: string;
  descriptionId?: string;
};

export function RadioOption({
  children,
  className,
  description,
  descriptionId,
  label,
  type: _type,
  ...props
}: RadioOptionProps) {
  return (
    <label
      className={cn(
        "flex min-h-20 items-start gap-3 rounded-md border border-border bg-white p-4 transition has-[:checked]:border-primary has-[:checked]:bg-muted",
        props.disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <input type="radio" className="mt-1 h-4 w-4" {...props} />
      <span>
        <span className="block font-medium">{label}</span>
        {description && (
          <span id={descriptionId} className="block text-sm text-muted-foreground">
            {description}
          </span>
        )}
        {children}
      </span>
    </label>
  );
}
