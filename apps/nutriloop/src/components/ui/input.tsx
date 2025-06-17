import * as React from "react";
import { cn } from "@/lib/utils";
import { inputStyles } from "@/lib/styles";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputStyles.base,
          inputStyles.focus,
          inputStyles.hover,
          inputStyles.disabled,
          inputStyles.placeholder,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
