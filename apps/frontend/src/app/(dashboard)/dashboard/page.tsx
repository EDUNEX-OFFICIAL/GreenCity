export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <section className="rounded-lg border border-border bg-card text-card-foreground p-6 sm:p-8">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Structured overview. Static placeholders only.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="h-32 rounded-md bg-secondary border border-input" />
          <div className="mt-4 h-4 w-2/3 rounded bg-secondary" />
          <div className="mt-2 h-4 w-1/3 rounded bg-secondary" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="h-32 rounded-md bg-secondary border border-input" />
          <div className="mt-4 h-4 w-2/3 rounded bg-secondary" />
          <div className="mt-2 h-4 w-1/3 rounded bg-secondary" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="h-32 rounded-md bg-secondary border border-input" />
          <div className="mt-4 h-4 w-2/3 rounded bg-secondary" />
          <div className="mt-2 h-4 w-1/3 rounded bg-secondary" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="h-64 rounded-md bg-secondary border border-input" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="h-64 rounded-md bg-secondary border border-input" />
        </div>
      </div>
    </div>
  );
}
