import { DATASET } from "./devconnect-dataset";
import { GraphUnavailableError } from "./devconnect-errors";
import type { Developer, Repository } from "./devconnect-schema";

/**
 * Query layer for the DevConnect graph.
 *
 * Every function mirrors one of the Cypher statements in devconnect-schema.ts.
 * When no CognoDB instance is configured the same traversals are evaluated over
 * the bundled dataset so the app stays fully explorable.
 */

const g = DATASET;

function graphOrThrow<T>(compute: () => T): T {
  try {
    return compute();
  } catch {
    throw new GraphUnavailableError("The developer graph could not answer that query.");
  }
}

const devByUsername = (username: string) => g.developers.find((d) => d.username === username);
const repoById = (id: string) => g.repositories.find((r) => r.id === id);

export type DeveloperSummary = Developer & { topSkills: string[]; repoCount: number };
export type RepositorySummary = Repository & { technologies: string[]; contributorCount: number };

function summarizeDeveloper(d: Developer): DeveloperSummary {
  return {
    ...d,
    topSkills: g.skilledIn
      .filter((s) => s.dev === d.username)
      .sort((a, b) => b.level - a.level)
      .slice(0, 3)
      .map((s) => s.tech),
    repoCount: g.contributedTo.filter((c) => c.dev === d.username).length,
  };
}

function summarizeRepository(r: Repository): RepositorySummary {
  return {
    ...r,
    technologies: g.uses.filter((u) => u.repo === r.id).map((u) => u.tech),
    contributorCount: g.contributedTo.filter((c) => c.repo === r.id).length,
  };
}

export function listDevelopers(search: string): DeveloperSummary[] {
  return graphOrThrow(() => {
    const q = search.trim().toLowerCase();
    return g.developers
      .filter(
        (d) =>
          !q ||
          d.username.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.bio.toLowerCase().includes(q) ||
          g.skilledIn.some((s) => s.dev === d.username && s.tech.toLowerCase().includes(q)),
      )
      .map(summarizeDeveloper);
  });
}

export function listRepositories(search: string): RepositorySummary[] {
  return graphOrThrow(() => {
    const q = search.trim().toLowerCase();
    return g.repositories
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          g.uses.some((u) => u.repo === r.id && u.tech.toLowerCase().includes(q)),
      )
      .map(summarizeRepository);
  });
}

export function developerProfile(username: string) {
  return graphOrThrow(() => {
    const dev = devByUsername(username);
    if (!dev) throw new Error("not found");

    const skills = g.skilledIn
      .filter((s) => s.dev === username)
      .sort((a, b) => b.level - a.level)
      .map((s) => ({
        name: s.tech,
        level: s.level,
        category: g.technologies.find((t) => t.name === s.tech)?.category ?? "other",
      }));

    const repositories = g.contributedTo
      .filter((c) => c.dev === username)
      .sort((a, b) => b.commits - a.commits)
      .map((c) => ({ ...summarizeRepository(repoById(c.repo)!), commits: c.commits }));

    const network = g.knows
      .filter((k) => k.a === username || k.b === username)
      .map((k) => {
        const other = devByUsername(k.a === username ? k.b : k.a)!;
        return { username: other.username, name: other.name, avatarUrl: other.avatarUrl, strength: k.strength };
      })
      .sort((a, b) => b.strength - a.strength);

    const authored = g.authored
      .filter((a) => a.dev === username)
      .map((a) => g.pullRequests.find((p) => p.id === a.pr)!)
      .map((pr) => ({ ...pr, repoName: repoById(pr.repoId)?.name ?? pr.repoId }));

    const reviewed = g.reviewed
      .filter((r) => r.dev === username)
      .map((r) => {
        const pr = g.pullRequests.find((p) => p.id === r.pr)!;
        return {
          ...pr,
          approved: r.approved,
          repoName: repoById(pr.repoId)?.name ?? pr.repoId,
        };
      });

    return { developer: dev, skills, repositories, network, authored, reviewed };
  });
}

/** Technology-weighted recommendation, boosted by peers already contributing. */
export function recommendRepositories(username: string, limit = 4) {
  return graphOrThrow(() => {
    if (!devByUsername(username)) throw new Error("not found");
    const skills = g.skilledIn.filter((s) => s.dev === username);
    const contributed = new Set(g.contributedTo.filter((c) => c.dev === username).map((c) => c.repo));
    const peers = new Set(
      g.knows.filter((k) => k.a === username || k.b === username).map((k) => (k.a === username ? k.b : k.a)),
    );

    return g.repositories
      .filter((r) => !contributed.has(r.id))
      .map((r) => {
        const matched: string[] = [];
        let score = 0;
        for (const s of skills) {
          const u = g.uses.find((x) => x.repo === r.id && x.tech === s.tech);
          if (u) {
            score += s.level * u.weight;
            matched.push(s.tech);
          }
        }
        const peerContributors = g.contributedTo.filter((c) => c.repo === r.id && peers.has(c.dev)).map((c) => c.dev);
        score += peerContributors.length * 3;
        return { repository: summarizeRepository(r), score, matchedTechnologies: matched, peerContributors };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  });
}

export function repositoryDetail(id: string) {
  return graphOrThrow(() => {
    const repo = repoById(id);
    if (!repo) throw new Error("not found");

    const contributors = g.contributedTo
      .filter((c) => c.repo === id)
      .sort((a, b) => b.commits - a.commits)
      .map((c) => ({ ...devByUsername(c.dev)!, commits: c.commits }));

    const technologies = g.uses
      .filter((u) => u.repo === id)
      .sort((a, b) => b.weight - a.weight)
      .map((u) => ({
        name: u.tech,
        weight: u.weight,
        category: g.technologies.find((t) => t.name === u.tech)?.category ?? "other",
      }));

    const openIssues = g.issues.filter((i) => i.repoId === id && i.state === "open");
    const pullRequests = g.pullRequests.filter((p) => p.repoId === id);

    const reviewCounts = new Map<string, number>();
    for (const r of g.reviewed) {
      const pr = g.pullRequests.find((p) => p.id === r.pr);
      if (pr?.repoId === id) reviewCounts.set(r.dev, (reviewCounts.get(r.dev) ?? 0) + 1);
    }
    const activeReviewers = [...reviewCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([dev, reviews]) => ({ ...devByUsername(dev)!, reviews }));

    return { repository: summarizeRepository(repo), contributors, technologies, openIssues, pullRequests, activeReviewers };
  });
}

/** Multi-hop reviewer matching: repo technologies -> skilled devs -> prior reviews & social proximity. */
export function suggestReviewers(prId: string, limit = 4) {
  return graphOrThrow(() => {
    const pr = g.pullRequests.find((p) => p.id === prId);
    if (!pr) throw new Error("not found");
    const repoTechs = g.uses.filter((u) => u.repo === pr.repoId);
    const author = pr.author;
    const authorPeers = new Set(
      g.knows.filter((k) => k.a === author || k.b === author).map((k) => (k.a === author ? k.b : k.a)),
    );

    return g.developers
      .filter((d) => d.username !== author)
      .map((d) => {
        const matched: string[] = [];
        let score = 0;
        for (const u of repoTechs) {
          const s = g.skilledIn.find((x) => x.dev === d.username && x.tech === u.tech);
          if (s) {
            score += s.level * u.weight;
            matched.push(u.tech);
          }
        }
        const priorReviews = g.reviewed.filter((r) => {
          const other = g.pullRequests.find((p) => p.id === r.pr);
          return r.dev === d.username && other?.repoId === pr.repoId;
        }).length;
        score += priorReviews * 6;
        const knowsAuthor = authorPeers.has(d.username);
        if (knowsAuthor) score += 4;
        return { developer: d, score, matchedTechnologies: matched, priorReviews, knowsAuthor };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  });
}

export type PathHop = { username: string; name: string; avatarUrl: string; relationship: string; detail: string };

/** Shortest collaboration path across KNOWS / CONTRIBUTED_TO / REVIEWED edges. */
export function shortestCollaborationPath(from: string, to: string): { hops: PathHop[]; found: boolean } {
  return graphOrThrow(() => {
    if (!devByUsername(from) || !devByUsername(to)) throw new Error("not found");

    const edges = new Map<string, { to: string; relationship: string; detail: string }[]>();
    const add = (a: string, b: string, relationship: string, detail: string) => {
      if (!edges.has(a)) edges.set(a, []);
      edges.get(a)!.push({ to: b, relationship, detail });
    };
    for (const k of g.knows) {
      add(k.a, k.b, "KNOWS", `knows directly (strength ${k.strength})`);
      add(k.b, k.a, "KNOWS", `knows directly (strength ${k.strength})`);
    }
    for (const r of g.repositories) {
      const devs = g.contributedTo.filter((c) => c.repo === r.id).map((c) => c.dev);
      for (const a of devs)
        for (const b of devs)
          if (a !== b) add(a, b, "CONTRIBUTED_TO", `co-contributes to ${r.name}`);
    }
    for (const rev of g.reviewed) {
      const pr = g.pullRequests.find((p) => p.id === rev.pr);
      if (!pr) continue;
      add(rev.dev, pr.author, "REVIEWED", `reviewed “${pr.title}”`);
      add(pr.author, rev.dev, "REVIEWED", `was reviewed on “${pr.title}”`);
    }

    const prev = new Map<string, { from: string; relationship: string; detail: string }>();
    const seen = new Set([from]);
    const queue = [from];
    while (queue.length) {
      const current = queue.shift()!;
      if (current === to) break;
      for (const e of edges.get(current) ?? []) {
        if (seen.has(e.to)) continue;
        seen.add(e.to);
        prev.set(e.to, { from: current, relationship: e.relationship, detail: e.detail });
        queue.push(e.to);
      }
    }
    if (from !== to && !prev.has(to)) return { hops: [], found: false };

    const chain: PathHop[] = [];
    let cursor = to;
    while (cursor !== from) {
      const step = prev.get(cursor)!;
      const d = devByUsername(cursor)!;
      chain.unshift({
        username: d.username,
        name: d.name,
        avatarUrl: d.avatarUrl,
        relationship: step.relationship,
        detail: step.detail,
      });
      cursor = step.from;
    }
    const start = devByUsername(from)!;
    chain.unshift({
      username: start.username,
      name: start.name,
      avatarUrl: start.avatarUrl,
      relationship: "START",
      detail: "starting developer",
    });
    return { hops: chain, found: true };
  });
}
