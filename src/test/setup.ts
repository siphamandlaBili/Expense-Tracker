import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { resetDb } from "../mocks/db";
import { server } from "../mocks/server";
import { TEST_NOW } from "./constants";
import "./i18n";

// Any request without a matching MSW handler fails the test.
beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

beforeEach(() => {
  window.localStorage.clear();
  resetDb({ now: TEST_NOW, fresh: true });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
