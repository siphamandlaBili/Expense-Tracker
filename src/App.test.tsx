import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { renderWithProviders } from "./test/render";

// Smoke test: the app boots. Page behaviour is tested in each page's own file.
describe("App", () => {
  it("renders without crashing", () => {
    renderWithProviders(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
