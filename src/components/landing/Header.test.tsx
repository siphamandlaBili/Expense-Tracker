import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "../../test/axe";
import { renderWithProviders } from "../../test/render";
import { Header } from "./Header";

describe("Header", () => {
  it("marks Home as the current page", () => {
    renderWithProviders(<Header onSignIn={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens and closes the menu", async () => {
    const { user } = renderWithProviders(<Header onSignIn={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(screen.getByRole("button", { name: /close menu/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /close menu/i }));
    expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("closes the menu when a link is chosen", async () => {
    const { user } = renderWithProviders(<Header onSignIn={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const menu = screen.getByRole("navigation", { name: "Menu" });
    expect(menu).toBeInTheDocument();

    const featureLinks = screen.getAllByRole("link", { name: "Features" });
    await user.click(featureLinks[featureLinks.length - 1]);
    expect(menu).not.toBeInTheDocument();
  });

  it("calls onSignIn from the header and from the menu", async () => {
    const onSignIn = vi.fn();
    const { user } = renderWithProviders(<Header onSignIn={onSignIn} />);

    await user.click(screen.getAllByRole("button", { name: "Sign in" })[0]);
    expect(onSignIn).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const signInButtons = screen.getAllByRole("button", { name: "Sign in" });
    await user.click(signInButtons[signInButtons.length - 1]);

    expect(onSignIn).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole("button", { name: /open menu/i }),
    ).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderWithProviders(<Header onSignIn={vi.fn()} />);

    await expectNoA11yViolations(container);
  });
});
