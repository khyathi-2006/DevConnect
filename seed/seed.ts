import neo4j from "neo4j-driver";
import { DATASET } from "../src/lib/devconnect-dataset";

const uri = process.env.COGNODB_URI;
const password = process.env.COGNODB_PASSWORD;
const username = process.env.COGNODB_USERNAME ?? "cognodb";

if (!uri || !password) {
  console.error("Missing COGNODB_URI or COGNODB_PASSWORD.");
  console.error("Create a .env file from .env.example, then run: npm run seed");
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

const nodeStatements = [
  ["Developer", DATASET.developers],
  ["Repository", DATASET.repositories],
  ["Technology", DATASET.technologies],
  ["PullRequest", DATASET.pullRequests],
  ["Issue", DATASET.issues],
] as const;

const relationshipStatements = [
  ["SKILLED_IN", DATASET.skilledIn, "dev", "Developer", "tech", "Technology"],
  ["CONTRIBUTED_TO", DATASET.contributedTo, "dev", "Developer", "repo", "Repository"],
  ["KNOWS", DATASET.knows, "a", "Developer", "b", "Developer"],
  ["AUTHORED", DATASET.authored, "dev", "Developer", "pr", "PullRequest"],
  ["REVIEWED", DATASET.reviewed, "dev", "Developer", "pr", "PullRequest"],
  ["USES", DATASET.uses, "repo", "Repository", "tech", "Technology"],
] as const;

async function main() {
  const session = driver.session();
  try {
    await session.executeWrite(async (tx) => {
      await tx.run("MATCH (n) DETACH DELETE n");
      for (const [label, rows] of nodeStatements) {
        for (const row of rows) {
          const key = label === "Developer" ? "username"
            : label === "Repository" ? "id"
            : label === "Technology" ? "name"
            : "id";
          await tx.run(
            `CREATE (n:${label}) SET n = $props`,
            { props: row as Record<string, unknown> },
          );
        }
      }

      for (const [type, rows, leftKey, leftLabel, rightKey, rightLabel] of relationshipStatements) {
        for (const row of rows) {
          const props = { ...row } as Record<string, unknown>;
          const leftValue = props[leftKey];
          const rightValue = props[rightKey];
          delete props[leftKey];
          delete props[rightKey];
          await tx.run(
            `MATCH (a:${leftLabel} { ${leftLabel === "Developer" ? "username" : leftLabel === "Repository" ? "id" : "name"}: $left }),
                   (b:${rightLabel} { ${rightLabel === "Developer" ? "username" : rightLabel === "Repository" ? "id" : "name"}: $right })
             CREATE (a)-[r:${type}]->(b)
             SET r = $props`,
            { left: leftValue, right: rightValue, props },
          );
        }
      }
    });

    const counts = await session.executeRead(async (tx) => {
      const result = await tx.run(`
        MATCH (n)
        RETURN labels(n)[0] AS label, count(n) AS count
        ORDER BY label
      `);
      return result.records.map((r) => `${r.get("label")}: ${r.get("count").toNumber()}`);
    });

    console.log("DevConnect graph seeded successfully.");
    console.log(counts.join(" · "));
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
