import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  developerProfile,
  listDevelopers,
  listRepositories,
  recommendRepositories,
  repositoryDetail,
  shortestCollaborationPath,
  suggestReviewers,
} from "./devconnect.server";

const searchInput = z.object({ search: z.string().max(80).default("") });
const usernameInput = z.object({ username: z.string().min(1).max(64) });
const repoInput = z.object({ id: z.string().min(1).max(64) });
const prInput = z.object({ prId: z.string().min(1).max(64), limit: z.number().int().min(1).max(10).default(4) });
const pathInput = z.object({ from: z.string().min(1).max(64), to: z.string().min(1).max(64) });

export const getDevelopers = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => searchInput.parse(data ?? {}))
  .handler(async ({ data }) => listDevelopers(data.search));

export const getRepositories = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => searchInput.parse(data ?? {}))
  .handler(async ({ data }) => listRepositories(data.search));

export const getDeveloperProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => usernameInput.parse(data))
  .handler(async ({ data }) => developerProfile(data.username));

export const getRecommendedRepositories = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => usernameInput.parse(data))
  .handler(async ({ data }) => recommendRepositories(data.username));

export const getRepositoryDetail = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => repoInput.parse(data))
  .handler(async ({ data }) => repositoryDetail(data.id));

export const getSuggestedReviewers = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => prInput.parse(data))
  .handler(async ({ data }) => suggestReviewers(data.prId, data.limit));

export const getCollaborationPath = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => pathInput.parse(data))
  .handler(async ({ data }) => shortestCollaborationPath(data.from, data.to));
