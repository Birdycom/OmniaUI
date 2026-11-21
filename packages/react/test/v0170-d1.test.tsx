// File: packages/react/test/v0170-d1.test.tsx
// Map: module prop -> data-module (Badge, Button, ButtonLink, LauncherCard, FormSection, BlockModuleHeader) -> Badge variant
//      module -> Button float (particles, data-float-icon, mask of a registered webicon) -> BlockModuleHeader eyebrow + fixedHeight

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "../src/components/Badge";
import { Button, ButtonLink } from "../src/components/Button";
import { FormSection } from "../src/components/FormSection";
import { LauncherCard } from "../src/components/LauncherCard";
import { BlockModuleHeader } from "../src/blocks/BlockModuleHeader";
import { registerWebicons } from "../src/components/Webicon";

registerWebicons({
  prefix: "mdi",
  width: 24,
  height: 24,
  icons: { "thumb-up": { body: '<path d="M1 21h4V9H1zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57l.03-.32c0-.41-.17-.79-.44-1.06L14.17 1L7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73z"/>' } },
});

describe("0.17.0 module prop", () => {
  it("sets data-module on the root of each wrapper", () => {
    const { container } = render(
      <>
        <Badge module="green">Paid</Badge>
        <Button module="blue">Save</Button>
        <ButtonLink module="red" href="/x">Open</ButtonLink>
        <LauncherCard module="purple" href="/contacts" title="Contacts" />
        <LauncherCard module="gold" title="Off" disabled />
        <FormSection module="teal" title="Address">fields</FormSection>
        <BlockModuleHeader module="orange" title="Contacts" />
      </>,
    );
    expect(container.querySelector(".oc-badge")?.getAttribute("data-module")).toBe("green");
    expect(container.querySelector("button.oc-btn")?.getAttribute("data-module")).toBe("blue");
    expect(container.querySelector("a.oc-btn")?.getAttribute("data-module")).toBe("red");
    expect(container.querySelector("a.oc-launcher")?.getAttribute("data-module")).toBe("purple");
    expect(container.querySelector("span.oc-launcher")?.getAttribute("data-module")).toBe("gold");
    expect(container.querySelector("details.oc-form-section")?.getAttribute("data-module")).toBe("teal");
    expect(container.querySelector("header.oc-block-modulehead")?.getAttribute("data-module")).toBe("orange");
  });

  it("adds nothing without the prop (existing markup unchanged)", () => {
    const { container } = render(
      <>
        <Badge>New</Badge>
        <Button>Save</Button>
        <LauncherCard href="/a" title="A" />
        <FormSection title="B">x</FormSection>
        <BlockModuleHeader title="C" />
      </>,
    );
    expect(container.querySelector("[data-module]")).toBeNull();
    expect(container.querySelector(".oc-btn-float")).toBeNull();
    expect(container.querySelector("button")?.className).toBe("oc-btn");
  });

  it("Badge variant module is the soft tint class", () => {
    const { container } = render(<Badge variant="module">Sales</Badge>);
    expect(container.querySelector(".oc-badge")?.className).toBe("oc-badge oc-badge--module");
  });
});

describe("0.17.0 floating button", () => {
  it("hearts: class, data-float-icon and five hidden particles before the label", () => {
    const { container } = render(<Button float="hearts">Donate</Button>);
    const btn = container.querySelector("button")!;
    expect(btn.className).toBe("oc-btn oc-btn--float");
    expect(btn.getAttribute("data-float-icon")).toBe("mdi:heart");
    const layer = btn.firstElementChild!;
    expect(layer.className).toBe("oc-btn-float");
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    expect(layer.querySelectorAll("i")).toHaveLength(5);
    expect(btn.textContent).toBe("Donate");
    expect(btn.getAttribute("style")).toBeNull();
  });

  it("mdi:star uses the built-in mask; another registered webicon becomes a data-URI mask", () => {
    const { container } = render(
      <>
        <Button float="mdi:star">Star</Button>
        <ButtonLink float="mdi:thumb-up" href="/like" style={{ minWidth: 100 }}>Like</ButtonLink>
      </>,
    );
    const [star, like] = Array.from(container.querySelectorAll<HTMLElement>(".oc-btn"));
    expect(star.getAttribute("data-float-icon")).toBe("mdi:star");
    expect(star.style.getPropertyValue("--oc-btn-float-icon")).toBe("");
    expect(like.getAttribute("data-float-icon")).toBe("mdi:thumb-up");
    const mask = like.style.getPropertyValue("--oc-btn-float-icon");
    expect(mask.startsWith('url("data:image/svg+xml,%3Csvg')).toBe(true);
    expect(decodeURIComponent(mask)).toContain('viewBox="0 0 24 24"');
    expect(like.style.minWidth).toBe("100px");
    expect(like.querySelector(".oc-btn-float")).not.toBeNull();
  });

  it("works with module and as", () => {
    const { container } = render(<Button as="a" href="/give" float="hearts" module="pink">Give</Button>);
    const a = container.querySelector("a")!;
    expect(a.className).toContain("oc-btn--float");
    expect(a.getAttribute("data-module")).toBe("pink");
  });
});

describe("0.17.0 module header", () => {
  it("eyebrow above the title and fixed height class", () => {
    const { container } = render(<BlockModuleHeader title="Invoices" eyebrow="Sales" fixedHeight module="blue" />);
    const head = container.querySelector("header")!;
    expect(head.className).toBe("oc-block-modulehead oc-block-modulehead--fixed");
    const eyebrow = head.querySelector(".oc-block-modulehead-eyebrow")!;
    expect(eyebrow.tagName).toBe("P");
    expect(eyebrow.textContent).toBe("Sales");
    expect(eyebrow.nextElementSibling?.className).toBe("oc-block-modulehead-title");
  });

  it("no eyebrow element without the prop", () => {
    const { container } = render(<BlockModuleHeader title="Invoices" />);
    expect(container.querySelector(".oc-block-modulehead-eyebrow")).toBeNull();
    expect(container.querySelector("header")?.className).toBe("oc-block-modulehead");
  });
});
