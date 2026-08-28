/**
 * DevConnect graph schema types + the Cypher used by each core query.
 * Shared by the server query layer and the seed script.
 */

export type Developer = {
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  location: string;
};

export type Repository = {
  id: string;
  name: string;
  description: string;
  owner: string;
  stars: number;
};

export type Technology = { name: string; category: string };

export type PullRequest = {
  id: string;
  title: string;
  state: "open" | "merged" | "closed";
  repoId: string;
  author: string;
};

export type Issue = {
  id: string;
  title: string;
  state: "open" | "closed";
  repoId: string;
  labels: string[];
};

export type GraphData = {
  developers: Developer[];
  repositories: Repository[];
  technologies: Technology[];
  pullRequests: PullRequest[];
  issues: Issue[];
  skilledIn: { dev: string; tech: string; level: number }[];
  contributedTo: { dev: string; repo: string; commits: number }[];
  knows: { a: string; b: string; strength: number }[];
  authored: { dev: string; pr: string }[];
  reviewed: { dev: string; pr: string; approved: boolean }[];
  uses: { repo: string; tech: string; weight: number }[];
};

/**
 * The Cypher statements behind the four headline queries. They are kept here so
 * the graph layer, the docs and the README all describe the same traversals.
 */
export const CYPHER = {
  developerProfile: `
MATCH (d:Developer { username: $username })
OPTIONAL MATCH (d)-[s:SKILLED_IN]->(t:Technology)
OPTIONAL MATCH (d)-[c:CONTRIBUTED_TO]->(r:Repository)
OPTIONAL MATCH (d)-[:KNOWS]-(peer:Developer)
OPTIONAL MATCH (d)-[:AUTHORED]->(pr:PullRequest)
OPTIONAL MATCH (d)-[rev:REVIEWED]->(rpr:PullRequest)
RETURN d, collect(DISTINCT t) AS skills, collect(DISTINCT r) AS repos,
       collect(DISTINCT peer) AS network, collect(DISTINCT pr) AS authored,
       collect(DISTINCT rpr) AS reviewed`,

  recommendRepositories: `
MATCH (d:Developer { username: $username })-[s:SKILLED_IN]->(t:Technology)<-[u:USES]-(r:Repository)
WHERE NOT (d)-[:CONTRIBUTED_TO]->(r)
OPTIONAL MATCH (d)-[:KNOWS]-(peer:Developer)-[:CONTRIBUTED_TO]->(r)
RETURN r, sum(s.level * u.weight) + 3 * count(DISTINCT peer) AS score
ORDER BY score DESC LIMIT $limit`,

  suggestReviewers: `
MATCH (pr:PullRequest { id: $prId })-[:TARGETS]->(repo:Repository)-[:USES]->(t:Technology)
MATCH (candidate:Developer)-[s:SKILLED_IN]->(t)
WHERE NOT (candidate)-[:AUTHORED]->(pr)
OPTIONAL MATCH (candidate)-[:REVIEWED]->(:PullRequest)-[:TARGETS]->(repo)
OPTIONAL MATCH (author:Developer)-[:AUTHORED]->(pr), (candidate)-[:KNOWS]-(author)
RETURN candidate, sum(s.level) AS skillScore, count(DISTINCT candidate) AS repoReviews
ORDER BY skillScore DESC LIMIT $limit`,

  shortestCollaborationPath: `
MATCH (a:Developer { username: $from }), (b:Developer { username: $to })
MATCH p = shortestPath((a)-[:KNOWS|CONTRIBUTED_TO|REVIEWED|AUTHORED*..8]-(b))
RETURN p`,
} as const;
