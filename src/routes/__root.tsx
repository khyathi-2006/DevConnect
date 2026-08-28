import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">No such node</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That developer, repository or page isn&apos;t part of the graph.
        </p>
        <div className="mt-6">
          <Link to="/" className="dc-btn dc-btn-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The developer graph didn&apos;t respond. You can retry or head back to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="dc-btn dc-btn-primary"
          >
            Try again
          </button>
          <a href="/" className="dc-btn">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DevConnect — the developer collaboration graph" },
      {
        name: "description",
        content:
          "DevConnect maps developers, repositories and technologies as a graph to power reviewer matching, recommendations and collaboration paths.",
      },
      { name: "author", content: "Khyathi" },
      { property: "og:title", content: "DevConnect — the developer collaboration graph" },
      {
        property: "og:description",
        content: "Explore developers, repositories and the shortest path between any two contributors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="dc-container flex flex-wrap items-center gap-3 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block size-3 rounded-full"
            style={{ backgroundImage: "var(--gradient-signal)" }}
          />
          <span className="font-display text-lg font-semibold tracking-tight">DevConnect</span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto" aria-label="Main">
          <Link to="/" className="dc-nav-link">
            Dashboard
          </Link>
          <Link to="/path" className="dc-nav-link">
            Find a Path
          </Link>
        </nav>

        <form
          role="search"
          className="ml-auto flex w-full items-center gap-2 sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/", search: { q: query.trim() } });
          }}
        >
          <label htmlFor="global-search" className="sr-only">
            Search developers or repositories
          </label>
          <input
            id="global-search"
            className="dc-input sm:w-64"
            placeholder="Search username or repo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="dc-btn dc-btn-primary">
            Search
          </button>
        </form>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <SiteHeader />
        <main className="dc-container py-8">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <footer className="mt-12 border-t border-border py-6">
          <div className="dc-container text-xs text-muted-foreground">
            DevConnect — a graph-native view of open-source collaboration. Built by Khyathi.
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
