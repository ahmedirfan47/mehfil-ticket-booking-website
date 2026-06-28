import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";