import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl pb-12 animate-in fade-in duration-300">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between pb-2">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      {/* Main Profile Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/60 border border-zinc-800/60 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/40">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar Skeleton */}
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-44 sm:w-56 rounded-xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
        </div>

        {/* Biometric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weight Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 space-y-3">
            <Skeleton className="h-3.5 w-48 rounded" />
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-4 w-10 rounded" />
            </div>
            <Skeleton className="h-3 w-36 rounded" />
          </div>

          {/* Height Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 space-y-3">
            <Skeleton className="h-3.5 w-32 rounded" />
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>

        {/* Riding Dynamics Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>

        {/* Cloud Sync Status Banner */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3.5 w-36 rounded" />
              <Skeleton className="h-3.5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default ProfileSkeleton;
