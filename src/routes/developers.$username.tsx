import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, GitPullRequest, MapPin, Users, X } from "lucide-react";
import { getDeveloperProfile, getRecommendedRepositories } from "@/lib/devconnect.functions";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "@/components/devconnect/states";

export const Route = createFileRoute("/developers/$username")({
  component: DeveloperPage,
});

function DeveloperPage() {
  const { username } = Route.useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getDeveloperProfile>> | null>(null);
  const [recommendations, setRecommendations] = useState<Awaited<ReturnType<typeof getRecommendedRepositories>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getDeveloperProfile({ data: { username } }),
      getRecommendedRepositories({ data: { username } }),
    ])
      .then(([profile, recs]) => {
        if (!active) return;
        setData(profile);
        setRecommendations(recs);
      })
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [username]);

  if (loading) return <LoadingState rows={5} label={`Loading @${username}…`} />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState title="Developer not found" description="This node is not part of the current graph." />;

  const { developer, skills, repositories, network, authored, reviewed } = data;

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <section className="dc-card overflow-hidden p-0">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-highlight/15" />
        <div className="-mt-10 p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <img src={developer.avatarUrl} alt="" className="size-20 rounded-2xl border-4 border-card bg-card" />
            <div className="min-w-0 flex-1">
              <p className="dc-eyebrow">Developer node</p>
              <h1 className="mt-1 text-3xl font-bold">{developer.name}</h1>
              <p className="font-mono text-sm text-primary">@{developer.username}</p>
            </div>
            <Link to="/path" search={{ from: developer.username }} className="dc-btn dc-btn-primary">
              Find a path <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">{developer.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="dc-badge"><MapPin className="size-3" /> {developer.location}</span>
            <span className="dc-badge"><Users className="size-3" /> {network.length} direct connections</span>
            <span className="dc-badge"><GitPullRequest className="size-3" /> {authored.length} authored PRs</span>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-8">
          <section>
            <SectionHeading eyebrow="Expertise" title="Skills" />
            <div className="grid gap-3 sm:grid-cols-2">
              {skills.map((skill) => (
                <div key={skill.name} className="dc-card">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.name}</span>
                    <span className="dc-badge dc-badge-primary">{skill.category}</span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full ${i < skill.level ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Level {skill.level}/5</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Code" title="Repositories" />
            {repositories.length ? (
              <div className="space-y-3">
                {repositories.map((repo) => (
                  <Link key={repo.id} to="/repositories/$id" params={{ id: repo.id }} className="dc-card dc-card-hover block">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm text-primary">{repo.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{repo.description}</p>
                      </div>
                      <span className="dc-badge">{repo.commits} commits</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">{repo.technologies.map((t) => <span className="dc-badge" key={t}>{t}</span>)}</div>
                  </Link>
                ))}
              </div>
            ) : <EmptyState title="No repositories" description="This developer has no contribution edges in the dataset." />}
          </section>

          <section>
            <SectionHeading eyebrow="Activity" title="Pull requests & reviews" />
            <div className="grid gap-3 md:grid-cols-2">
              <Activity title="Authored" items={authored.map((pr) => ({ id: pr.id, title: pr.title, meta: `${pr.repoName} · ${pr.state}` }))} />
              <Activity title="Reviewed" items={reviewed.map((pr) => ({ id: pr.id, title: pr.title, meta: `${pr.repoName} · ${pr.approved ? "approved" : "changes requested"}` }))} />
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section>
            <SectionHeading eyebrow="Network" title="Direct connections" />
            <div className="space-y-2">
              {network.map((peer) => (
                <Link key={peer.username} to="/developers/$username" params={{ username: peer.username }} className="dc-card dc-card-hover flex items-center gap-3 p-3">
                  <img src={peer.avatarUrl} alt="" className="size-9 rounded-full" />
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium">{peer.name}</p><p className="font-mono text-xs text-muted-foreground">@{peer.username}</p></div>
                  <span className="dc-badge dc-badge-highlight">strength {peer.strength}</span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Graph inference" title="Recommended repositories" />
            <div className="space-y-3">
              {recommendations.map((item) => (
                <Link key={item.repository.id} to="/repositories/$id" params={{ id: item.repository.id }} className="dc-card dc-card-hover block">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{item.repository.name}</p>
                    <span className="dc-badge dc-badge-primary">{item.score.toFixed(0)}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Matched: {item.matchedTechnologies.join(", ") || "network proximity"}</p>
                  {item.peerContributors.length ? <p className="mt-2 text-xs text-highlight">A connection already contributes here.</p> : null}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Activity({ title, items }: { title: string; items: { id: string; title: string; meta: string }[] }) {
  return (
    <div className="dc-card">
      <h3 className="font-semibold">{title}</h3>
      {items.length ? <div className="mt-3 space-y-3">{items.map((item) => <div key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0"><p className="text-sm">{item.title}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{item.meta}</p></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No activity recorded.</p>}
    </div>
  );
}
