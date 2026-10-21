import axe from "axe-core";
import { expect } from "vitest";

// jsdom has no layout or computed colours, so these rules can't be evaluated
// reliably here; they are covered by the Playwright suite in a real browser.
const DISABLED_RULES = ["color-contrast", "region"];

/** Fails the test with a readable list of any axe accessibility violations. */
export async function expectNoA11yViolations(element: Element) {
  const results = await axe.run(element, {
    rules: Object.fromEntries(
      DISABLED_RULES.map((rule) => [rule, { enabled: false }]),
    ),
  });

  const violations = results.violations.map(
    ({ id, help, nodes }) =>
      `${id}: ${help} -> ${nodes.map((node) => node.target.join(" ")).join(", ")}`,
  );
  expect(violations).toEqual([]);
}
