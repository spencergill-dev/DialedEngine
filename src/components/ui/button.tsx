import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lime-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-zinc-950 font-bold shadow-sm hover:bg-zinc-200",
        destructive:
          "bg-red-950/80 text-red-200 hover:bg-red-900 border border-red-800/40",
        outline:
          "ring-1 ring-white/10 bg-zinc-900/60 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-300",
        secondary:
          "bg-zinc-800/90 text-zinc-100 hover:bg-zinc-700",
        ghost: "hover:bg-zinc-800/60 hover:text-zinc-100 text-zinc-400",
        link: "text-zinc-300 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-sm",
        icon: "h-9 w-9",
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
