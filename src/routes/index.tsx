import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, GitPullRequest, Search, Star, Users } from "lucide-react";
import { getDevelopers, getRepositories } from "@/lib/devconnect.functions";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "@/components/devconnect/states";
import type { DeveloperSummary, RepositorySummary } from "@/lib/devconnect.server";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: Index,
});

function Index() {
  const { q } = Route.useSearch();
  const [developers, setDevelopers] = useState<DeveloperSummary[]>([]);
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getDevelopers({ data: { search: q } }),
      getRepositories({ data: { search: q } }),
    ])
      .then(([devs, repos]) => {
        if (!active) return;
        setDevelopers(devs);
        setRepositories(repos);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [q]);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-10">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="relative max-w-3xl">
          <p className="dc-eyebrow text-primary">Developer intelligence · graph-native</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            Find the people, projects and paths that connect your work.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            DevConnect turns developer activity into a traversable graph. Discover contributors, inspect technical
            neighborhoods, match reviewers and find the shortest collaboration path between two developers.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/path" className="dc-btn dc-btn-primary">
              Find a collaboration path <ArrowRight className="size-4" />
            </Link>
            <a href="#developers" className="dc-btn">
              <Search className="size-4" /> Explore the graph
            </a>
          </div>
        </div>
      </section>

      {q ? (
        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          <Search className="size-4 text-primary" />
          <span>Showing results for <strong>{q}</strong></span>
          <Link to="/" className="ml-auto text-primary hover:underline">Clear</Link>
        </div>
      ) : null}

      {loading ? <LoadingState rows={4} label="Traversing developers and repositories…" /> : null}
      {error ? <ErrorState error={error} /> : null}

      {!loading && !error ? (
        <>
          <section id="developers">
            <SectionHeading
              eyebrow="People"
              title="Developers in the graph"
              action={<span className="dc-badge dc-badge-primary">{developers.length} nodes</span>}
            />
            {developers.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {developers.map((dev) => (
                  <Link
                    key={dev.username}
                    to="/developers/$username"
                    params={{ username: dev.username }}
                    className="dc-card dc-card-hover group"
                  >
                    <div className="flex items-start gap-3">
                      <img src={dev.avatarUrl} alt="" className="size-11 rounded-full border border-border" />
                      <div className="min-w-0">
                        <p className="font-semibold">{dev.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">@{dev.username}</p>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{dev.bio}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {dev.topSkills.map((skill) => <span key={skill} className="dc-badge">{skill}</span>)}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span>{dev.repoCount} repositories</span>
                      <span className="text-primary transition-transform group-hover:translate-x-1">View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No developers found" description="Try a different username, skill or search term." />
            )}
          </section>

          <section>
            <SectionHeading
              eyebrow="Projects"
              title="Repositories"
              action={<span className="dc-badge">{repositories.length} nodes</span>}
            />
            {repositories.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {repositories.map((repo) => (
                  <Link
                    key={repo.id}
                    to="/repositories/$id"
                    params={{ id: repo.id }}
                    className="dc-card dc-card-hover group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-sm text-primary">{repo.owner}/{repo.name}</p>
                        <h3 className="mt-1 text-lg font-semibold">{repo.name}</h3>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3.5" /> {repo.stars.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{repo.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {repo.technologies.map((tech) => <span key={tech} className="dc-badge">{tech}</span>)}
                    </div>
                    <div className="mt-5 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="size-3.5" /> {repo.contributorCount} contributors</span>
                      <span className="ml-auto text-primary group-hover:underline">Open</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No repositories found" description="Try searching for a project name or technology." />
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Metric icon={<Users />} value={developers.length} label="developers" />
            <Metric icon={<GitPullRequest />} value="8" label="pull requests in the seed graph" />
            <Metric icon={<Star />} value="24.3k+" label="repository stars represented" />
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="dc-card flex items-center gap-4">
      <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
