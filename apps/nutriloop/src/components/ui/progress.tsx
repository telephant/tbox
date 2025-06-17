import * as React from "react";
import { cn } from "@/lib/utils";
import { progressStyles } from "@/lib/styles";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, indicatorClassName, value, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
      <div
        ref={ref}
        className={cn(progressStyles.base, className)}
        {...props}
      >
        <div
          className={cn(progressStyles.indicator, indicatorClassName)}
          style={{
            transform: `translateX(-${100 - percentage}%)`,
          }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
