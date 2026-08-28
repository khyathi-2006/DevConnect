import type { ReactNode } from "react";
import { friendlyErrorMessage } from "@/lib/devconnect-errors";

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="dc-eyebrow">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ rows = 3, label = "Traversing the graph…" }: { rows?: number; label?: string }) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-3">
      <p className="dc-eyebrow">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="dc-card animate-pulse">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="mt-3 h-3 w-2/3 rounded bg-muted" />
          <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="dc-card border-dashed text-center">
      <p className="text-base font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="dc-card border-destructive/40">
      <p className="dc-eyebrow text-destructive">Graph unavailable</p>
      <p className="mt-1 text-base font-medium">We couldn&apos;t read that part of the graph</p>
      <p className="mt-1 text-sm text-muted-foreground">{friendlyErrorMessage(error)}</p>
      {onRetry ? (
        <button type="button" className="dc-btn mt-4" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
