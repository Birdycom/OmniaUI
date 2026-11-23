// File: packages/react/test/v0170-scrim.test.tsx
// Map: 0.17.0 Scrim: default (bottom, aria-hidden) -> side / dark modifiers -> tokens as inline custom properties

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Scrim } from "../src/components/Scrim";

describe("Scrim", () => {
  it("renders an aria-hidden span.oc-scrim with the bottom side by default", () => {
    const { container } = render(<figure className="relative"><img src="/a.jpg" alt="" /><Scrim /></figure>);
    const s = container.querySelector("span.oc-scrim")!;
    expect(s).toHaveAttribute("aria-hidden", "true");
    expect(s.className).toBe("oc-scrim");
  });

  it("adds the side and dark modifiers and writes the tokens", () => {
    const { container } = render(<Scrim side="start" dark strength={0.6} size="12rem" color="black" />);
    const s = container.querySelector(".oc-scrim") as HTMLElement;
    expect(s).toHaveClass("oc-scrim--start", "oc-scrim--dark");
    expect(s.style.getPropertyValue("--oc-scrim-strength")).toBe("0.6");
    expect(s.style.getPropertyValue("--oc-scrim-size")).toBe("12rem");
    expect(s.style.getPropertyValue("--oc-scrim-color")).toBe("black");
  });
});
