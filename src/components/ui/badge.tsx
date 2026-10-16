import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] sm:text-xs font-semibold font-mono tracking-wider transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
  {
    variants: {
      variant: {
        default:
          "bg-lime-400/10 text-lime-400 ring-1 ring-lime-500/30",
        secondary:
          "bg-zinc-800/80 text-zinc-300 ring-1 ring-white/5",
        destructive:
          "bg-red-950/60 text-red-300 ring-1 ring-red-800/40",
        outline: "text-zinc-400 ring-1 ring-white/10",
        lime: "bg-lime-400 text-zinc-950 font-bold",
        amber: "bg-amber-400/10 text-amber-400 ring-1 ring-amber-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
