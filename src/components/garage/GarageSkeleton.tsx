import { Skeleton } from "@/components/ui/skeleton";

export function GarageSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Garage Header Skeleton */}
      <section className="pb-6 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-44 sm:w-56 rounded-xl" />
            <Skeleton className="h-3.5 w-24 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </section>

      {/* Fleet Lineup List Skeletons */}
      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 -mx-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/40"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Bike Icon Thumbnail */}
              <Skeleton className="w-12 h-12 rounded-xl shrink-0" />

              {/* Specs & Labels */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-40 sm:w-52 rounded-md" />
                  {idx === 1 && <Skeleton className="h-3.5 w-12 rounded-full" />}
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-10 rounded" />
                  <span className="text-zinc-700">•</span>
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
            </div>

            {/* Right Chevron */}
            <Skeleton className="w-4 h-4 rounded-md shrink-0 mr-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default GarageSkeleton;
