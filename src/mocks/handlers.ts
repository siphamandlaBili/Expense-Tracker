import type { RequestHandler } from "msw";

// Default API handlers shared by tests (and, later, the dev-mode browser
// worker). Add a handler here for every endpoint the app calls; override per
// test with `server.use(...)` for error and edge cases.
export const handlers: RequestHandler[] = [];
