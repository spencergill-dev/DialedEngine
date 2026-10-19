import { Skeleton } from "@/components/ui/skeleton";

export function RideSetupSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Active Bike Header Skeleton */}
      <section className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </section>

      {/* Tire Pressure & Calibrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800/40 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <Skeleton className="h-14 w-32 rounded-xl" />
          <Skeleton className="h-2 w-full rounded" />
        </div>
        <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800/40 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <Skeleton className="h-14 w-32 rounded-xl" />
          <Skeleton className="h-2 w-full rounded" />
        </div>
      </div>

      {/* Suspension Dampers & Sag Skeleton */}
      <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800/40 space-y-4">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default RideSetupSkeleton;
