import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, GitPullRequest, GitCommit, CircleDot, Star } from "lucide-react";
import { getRepositoryDetail, getSuggestedReviewers } from "@/lib/devconnect.functions";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "@/components/devconnect/states";

export const Route = createFileRoute("/repositories/$id")({
  component: RepositoryPage,
});

function RepositoryPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getRepositoryDetail>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [selectedPr, setSelectedPr] = useState<string | null>(null);
  const [reviewers, setReviewers] = useState<Awaited<ReturnType<typeof getSuggestedReviewers>>>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    getRepositoryDetail({ data: { id } })
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const loadReviewers = (prId: string) => {
    setSelectedPr(prId);
    setReviewLoading(true);
    getSuggestedReviewers({ data: { prId, limit: 4 } })
      .then(setReviewers)
      .finally(() => setReviewLoading(false));
  };

  if (loading) return <LoadingState rows={5} label={`Loading ${id}…`} />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState title="Repository not found" description="This repository is not part of the current graph." />;

  const { repository, contributors, technologies, openIssues, pullRequests, activeReviewers } = data;

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to dashboard</Link>

      <section className="dc-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><GitCommit className="size-7" /></div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm text-primary">{repository.owner}/{repository.name}</p>
            <h1 className="mt-1 text-3xl font-bold">{repository.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{repository.description}</p>
          </div>
          <span className="dc-badge dc-badge-highlight"><Star className="size-3" /> {repository.stars.toLocaleString()}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">{technologies.map((tech) => <span key={tech.name} className="dc-badge dc-badge-primary">{tech.name} · {tech.weight}</span>)}</div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-8">
          <section>
            <SectionHeading eyebrow="Contributors" title="People behind the repository" />
            <div className="grid gap-3 sm:grid-cols-2">
              {contributors.map((dev) => (
                <Link key={dev.username} to="/developers/$username" params={{ username: dev.username }} className="dc-card dc-card-hover flex items-center gap-3">
                  <img src={dev.avatarUrl} alt="" className="size-10 rounded-full" />
                  <div className="min-w-0 flex-1"><p className="font-medium">{dev.name}</p><p className="font-mono text-xs text-muted-foreground">@{dev.username}</p></div>
                  <span className="dc-badge">{dev.commits} commits</span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Pull requests" title="Review intelligence" />
            <div className="space-y-3">
              {pullRequests.map((pr) => (
                <div key={pr.id} className="dc-card">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <GitPullRequest className={`mt-0.5 size-4 ${pr.state === "open" ? "text-primary" : "text-muted-foreground"}`} />
                      <div><p className="font-medium">{pr.title}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{pr.id} · @{pr.author} · {pr.state}</p></div>
                    </div>
                    <button className="dc-btn" onClick={() => loadReviewers(pr.id)}>Suggest reviewers</button>
                  </div>
                  {selectedPr === pr.id ? (
                    <div className="mt-4 border-t border-border pt-4">
                      {reviewLoading ? <p className="text-sm text-muted-foreground">Traversing skills, reviews and proximity…</p> : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {reviewers.map((item) => (
                            <Link key={item.developer.username} to="/developers/$username" params={{ username: item.developer.username }} className="rounded-xl border border-border p-3 hover:border-primary/40">
                              <div className="flex items-center gap-2"><img src={item.developer.avatarUrl} alt="" className="size-8 rounded-full" /><div><p className="text-sm font-medium">{item.developer.name}</p><p className="font-mono text-[11px] text-muted-foreground">@{item.developer.username}</p></div><span className="dc-badge dc-badge-primary ml-auto">{item.score.toFixed(0)}</span></div>
                              <p className="mt-2 text-xs text-muted-foreground">{item.matchedTechnologies.join(", ") || "network match"} · {item.priorReviews} prior reviews</p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Issues" title="Open issues" />
            {openIssues.length ? <div className="space-y-2">{openIssues.map((issue) => <div key={issue.id} className="dc-card flex items-start gap-3 p-4"><CircleDot className="mt-0.5 size-4 text-primary" /><div><p className="text-sm font-medium">{issue.title}</p><div className="mt-2 flex gap-1.5">{issue.labels.map((label) => <span key={label} className="dc-badge">{label}</span>)}</div></div></div>)}</div> : <EmptyState title="No open issues" description="The graph has no open issue nodes for this repository." />}
          </section>
        </div>

        <aside>
          <SectionHeading eyebrow="Reviewers" title="Active reviewers" />
          <div className="space-y-2">
            {activeReviewers.map((dev) => <Link key={dev.username} to="/developers/$username" params={{ username: dev.username }} className="dc-card dc-card-hover flex items-center gap-3 p-3"><img src={dev.avatarUrl} alt="" className="size-9 rounded-full" /><div className="flex-1"><p className="text-sm font-medium">{dev.name}</p><p className="font-mono text-xs text-muted-foreground">@{dev.username}</p></div><span className="dc-badge">{dev.reviews} reviews</span></Link>)}
          </div>
        </aside>
      </div>
    </div>
  );
}
