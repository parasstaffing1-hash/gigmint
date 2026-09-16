import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[#1b74ca] shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
        outline:
          "border border-input bg-background text-[rgb(55,53,47)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[rgba(55,53,47,0.06)]",
        secondary:
          "bg-[rgba(55,53,47,0.08)] text-[rgb(55,53,47)] hover:bg-[rgba(55,53,47,0.12)]",
        ghost:
          "text-[rgb(55,53,47)] hover:bg-[rgba(55,53,47,0.06)]",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-[rgba(55,53,47,0.08)] text-[rgb(55,53,47)] hover:bg-[rgba(55,53,47,0.12)]",
        gold:
          "bg-primary text-primary-foreground hover:bg-[#1b74ca] shadow-[0_1px_2px_rgba(0,0,0,0.08)] font-medium",
      },
      size: {
        default: "h-8 px-3.5 py-1",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-9 rounded-md px-4 text-[15px]",
        xl: "h-10 rounded-md px-5 text-base",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
