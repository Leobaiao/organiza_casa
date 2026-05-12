export default function TransactionsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-slate-800 rounded-lg" />
          <div className="h-4 w-64 bg-slate-800/50 rounded-lg" />
        </div>
        <div className="h-10 w-48 bg-slate-800 rounded-lg" />
      </div>

      <div className="space-y-4">
        <div className="h-10 w-64 bg-slate-800 rounded-lg" />
        <div className="border border-slate-800 bg-slate-900/50 rounded-2xl overflow-hidden">
          <div className="h-12 bg-slate-800/50 border-b border-slate-800" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-800 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-3 w-20 bg-slate-800/50 rounded" />
                </div>
              </div>
              <div className="h-6 w-24 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
