import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Solid color variants
        solid: "bg-primary text-primary-foreground hover:opacity-90",
        "solid-destructive": "bg-destructive text-destructive-foreground hover:opacity-90",
        "solid-secondary": "bg-secondary text-secondary-foreground hover:opacity-90",
        
        // Gradient variants
        default: "bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to text-primary-foreground hover:opacity-90",
        destructive: "bg-gradient-to-r from-destructive-gradient-from to-destructive-gradient-to text-destructive-foreground hover:opacity-90",
        secondary: "bg-gradient-to-r from-secondary-gradient-from to-secondary-gradient-to text-secondary-foreground hover:opacity-90",
        accent: "bg-gradient-to-r from-accent-gradient-from to-accent-gradient-to text-accent-foreground hover:opacity-90",
        
        // Other variants
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
