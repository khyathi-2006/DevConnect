export const GRAPH_UNAVAILABLE = "GRAPH_UNAVAILABLE";

/** Thrown when the graph database cannot be reached or a query fails. */
export class GraphUnavailableError extends Error {
  override name = "GraphUnavailableError";
  constructor(message = "The developer graph is temporarily unreachable.") {
    super(`${GRAPH_UNAVAILABLE}: ${message}`);
  }
}

/** Friendly, stack-trace-free copy for any error surfaced in the UI. */
export function friendlyErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  if (raw.includes(GRAPH_UNAVAILABLE)) {
    return raw.split(`${GRAPH_UNAVAILABLE}:`)[1]?.trim() || "The developer graph is unreachable.";
  }
  return "Something went wrong while reading the developer graph. Please try again.";
}
