# DevConnect

DevConnect is a graph-native developer discovery application built with TanStack Start, TypeScript and CognoDB/Cypher concepts.

It models developers, repositories, technologies, pull requests, issues and the relationships between them. The UI exposes four core graph questions: developer profiles, technology-weighted repository recommendations, reviewer suggestions and shortest collaboration paths.

## What is implemented

The dashboard searches the bundled developer and repository graph. Developer pages show skills, contribution history, direct network connections, pull-request activity and repository recommendations. Repository pages show contributors, technologies, issues, pull requests and reviewer suggestions. The path page traverses `KNOWS`, shared contribution and review relationships to find the shortest connection.

The application includes a complete deterministic seed dataset with 8 developers, 6 repositories, 10 technologies, 8 pull requests, 8 issues and all supporting relationships.

## Stack

- TanStack Start and TanStack Router
- React 19 and TypeScript
- Tailwind CSS 4
- Zod-validated server functions
- CognoDB over Bolt/Cypher for the seed database
- The bundled dataset as the local/explorable fallback

The current query layer evaluates the canonical dataset directly when no database instance is configured. This keeps the application usable without credentials while the seed script prepares the same graph for CognoDB.

## Local development

```bash
npm install
npm run dev
```

Open the development URL printed by Vite.

## CognoDB seed

Create a CognoDB instance and copy its Bolt URI and password. Then create `.env` from `.env.example`:

```bash
COGNODB_URI=bolt+s://your-instance.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your-password
```

Run:

```bash
npm run seed
```

The seed is intentionally deterministic: it clears the target graph and recreates the canonical DevConnect dataset.

## Core graph model

`Developer` nodes connect to `Repository` nodes through `CONTRIBUTED_TO`, to `Technology` nodes through `SKILLED_IN`, and to other developers through `KNOWS`. Pull requests are connected to authors and reviewers, while repositories connect to technologies through `USES`.

The four headline traversals are kept in `src/lib/devconnect-schema.ts` so the application model and Cypher documentation stay together.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run seed
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Dashboard and search |
| `/developers/:username` | Developer profile and recommendations |
| `/repositories/:id` | Repository graph detail and reviewer matching |
| `/path` | Shortest collaboration path |

## Branding note

The generated platform error-reporting module imported by the root error boundary is intentionally left untouched so platform error reporting is not broken. The DevConnect application code, UI copy, package metadata and documentation use the DevConnect branding.
