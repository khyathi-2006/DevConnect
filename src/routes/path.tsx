import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowRight, Circle, GitBranch, Route as RouteIcon } from "lucide-react";
import { getCollaborationPath, getDevelopers } from "@/lib/devconnect.functions";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "@/components/devconnect/states";

export const Route = createFileRoute("/path")({
  validateSearch: z.object({ from: z.string().optional(), to: z.string().optional() }),
  component: PathPage,
});

function PathPage() {
  const search = Route.useSearch();
  const [developers, setDevelopers] = useState<Awaited<ReturnType<typeof getDevelopers>>>([]);
  const [from, setFrom] = useState(search.from ?? "");
  const [to, setTo] = useState(search.to ?? "");
  const [result, setResult] = useState<Awaited<ReturnType<typeof getCollaborationPath>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    getDevelopers({ data: { search: "" } }).then(setDevelopers).finally(() => setDevLoading(false));
  }, []);

  const findPath = () => {
    if (!from || !to) return;
    setLoading(true); setError(null); setResult(null);
    getCollaborationPath({ data: { from, to } })
      .then(setResult)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section>
        <p className="dc-eyebrow">Graph traversal</p>
        <h1 className="mt-2 text-4xl font-bold">Find a collaboration path</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Ask the graph how two developers connect through direct relationships, shared repositories and pull-request reviews.
        </p>
      </section>

      <section className="dc-card">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <DeveloperSelect label="Starting developer" value={from} onChange={setFrom} developers={developers} disabled={devLoading} />
          <div className="hidden pb-2 text-muted-foreground md:block"><ArrowRight className="size-5" /></div>
          <DeveloperSelect label="Target developer" value={to} onChange={setTo} developers={developers} disabled={devLoading} />
        </div>
        <button type="button" className="dc-btn dc-btn-primary mt-5 w-full sm:w-auto" disabled={!from || !to || loading} onClick={findPath}>
          <RouteIcon className="size-4" /> {loading ? "Traversing…" : "Find shortest path"}
        </button>
      </section>

      {loading ? <LoadingState rows={3} label="Finding the shortest connection…" /> : null}
      {error ? <ErrorState error={error} /> : null}

      {result && !loading ? (
        result.found ? (
          <section>
            <SectionHeading eyebrow="Shortest path" title={`${result.hops.length - 1} relationship hop${result.hops.length - 1 === 1 ? "" : "s"}`} />
            <div className="relative space-y-3">
              <div className="absolute bottom-6 left-5 top-6 w-px bg-border" aria-hidden />
              {result.hops.map((hop, index) => (
                <div key={`${hop.username}-${index}`} className="relative flex gap-4">
                  <div className="z-10 grid size-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-background text-primary">
                    {index === 0 ? <Circle className="size-3 fill-current" /> : <GitBranch className="size-4" />}
                  </div>
                  <div className="dc-card min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to="/developers/$username" params={{ username: hop.username }} className="font-semibold hover:text-primary">{hop.name}</Link>
                      <span className="dc-badge">{hop.relationship}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{hop.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <EmptyState title="No connection found" description="No path exists between these two developer nodes within the graph's modeled relationships." />
        )
      ) : null}
    </div>
  );
}

function DeveloperSelect({
  label, value, onChange, developers, disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  developers: Awaited<ReturnType<typeof getDevelopers>>;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="dc-eyebrow">{label}</span>
      <select className="dc-input mt-2" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">Choose a developer…</option>
        {developers.map((dev) => <option key={dev.username} value={dev.username}>{dev.name} — @{dev.username}</option>)}
      </select>
    </label>
  );
}
