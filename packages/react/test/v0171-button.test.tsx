// File: packages/react/test/v0171-button.test.tsx | Map: Button / ButtonLink / buttonClass inherit (0.17.1)
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ButtonLink, buttonClass } from "../src/components/Button";

describe("Button inherit (0.17.1)", () => {
  it("adds .oc-btn--inherit next to the variant", () => {
    const { container } = render(<Button variant="outline" inherit>Contact</Button>);
    expect(container.querySelector("button")!.className).toBe("oc-btn oc-btn--outline oc-btn--inherit");
  });
  it("works on ButtonLink and in buttonClass", () => {
    const { container } = render(<ButtonLink variant="ghost" inherit href="/x">More</ButtonLink>);
    expect(container.querySelector("a")!.className).toBe("oc-btn oc-btn--ghost oc-btn--inherit");
    expect(buttonClass({ variant: "outline", inherit: true })).toBe("oc-btn oc-btn--outline oc-btn--inherit");
  });
  it("adds nothing without the prop", () => {
    const { container } = render(<Button variant="outline">Cancel</Button>);
    expect(container.querySelector("button")!.className).toBe("oc-btn oc-btn--outline");
  });
});
