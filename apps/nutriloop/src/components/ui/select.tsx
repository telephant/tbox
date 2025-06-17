import * as React from "react";
import { cn } from "@/lib/utils";
import { inputStyles } from "@/lib/styles";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          inputStyles.base,
          inputStyles.focus,
          inputStyles.hover,
          inputStyles.disabled,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
