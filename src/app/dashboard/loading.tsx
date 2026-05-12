export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-lg" />
          <div className="h-4 w-64 bg-slate-800/50 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-slate-800 rounded-full" />
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-24 bg-slate-800 rounded-2xl col-span-2" />
        <div className="h-24 bg-slate-800 rounded-2xl" />
        <div className="h-24 bg-slate-800 rounded-2xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-800 rounded-2xl" />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="h-64 bg-slate-800 rounded-2xl" />

      {/* Table Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-96 bg-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}
