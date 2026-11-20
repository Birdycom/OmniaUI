// File: packages/react/test/v0170-glass.test.tsx
// Map: GlassBar { sep: true } -> divider between two groups, the other items keep their roles

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlassBar } from "../src/components/GlassBar";

describe("glass 0.17.0", () => {
  it("glass bar draws a divider for { sep: true }", () => {
    const { container } = render(
      <GlassBar icons label="Tools" items={[{ label: "Draw", current: true }, { label: "Text" }, { sep: true }, { label: "Share" }]} />,
    );
    const nav = screen.getByRole("navigation", { name: "Tools" });
    const children = [...nav.children];
    expect(children).toHaveLength(4);
    expect(children[2]).toHaveClass("oc-glass-bar__sep");
    expect(children[2]).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".oc-glass-bar__item")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute("aria-pressed", "false");
  });
});
