import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-zinc-900/80 border border-zinc-800/50 animate-pulse",
        shimmer && "animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
