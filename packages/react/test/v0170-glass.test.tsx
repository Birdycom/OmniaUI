// File: packages/react/test/v0170-glass.test.tsx
// Map: GlassBar { sep: true } -> divider between two groups, the other items keep their roles -> lens prop (Chromium:
//      filter per size; lens={false}: data-oc-glass-lens="off"; flat: no lens; elsewhere html.oc-no-lens) -> draggable

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Glass } from "../src/components/Glass";
import { GlassBar } from "../src/components/GlassBar";

/** Pretend to be Chromium with a layout: every element 240 x 120. */
function chromium(on: boolean) {
  Object.defineProperty(navigator, "userAgentData", { configurable: true, value: on ? { brands: [{ brand: "Chromium", version: "142" }] } : undefined });
}
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 240 });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 120 });
});
afterEach(() => {
  chromium(false);
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight;
  document.documentElement.classList.remove("oc-no-lens");
});

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

  it("Glass gets the lens in Chromium: a filter the size of the sheet, removed on unmount", () => {
    chromium(true);
    const { container, unmount } = render(<Glass className="p-1">Body</Glass>);
    const sheet = container.querySelector(".oc-glass") as HTMLElement;
    expect(sheet).toHaveAttribute("data-oc-lens", "240x120");
    expect(sheet.style.getPropertyValue("--oc-glass-lens")).toBe("url(#oc-lens-240x120)");
    expect(document.getElementById("oc-lens-240x120")?.querySelector("feImage")).toHaveAttribute("width", "240");
    unmount();
    expect(document.getElementById("oc-lens-240x120")).toBeNull();
  });

  it("lens={false} and flat give no lens; the bar takes the lens too", () => {
    chromium(true);
    const { container } = render(
      <>
        <Glass lens={false}>Off</Glass>
        <Glass flat>Flat</Glass>
        <GlassBar label="Main" items={[{ label: "Home", current: true }]} />
      </>,
    );
    const [off, flat] = container.querySelectorAll(".oc-glass");
    expect(off).toHaveAttribute("data-oc-glass-lens", "off");
    expect(off).not.toHaveAttribute("data-oc-lens");
    expect(flat).not.toHaveAttribute("data-oc-lens");
    expect(screen.getByRole("navigation", { name: "Main" })).toHaveAttribute("data-oc-lens", "240x120");
  });

  it("draggable: data-oc-glass-drag (not the native attribute), focusable, arrow keys move it, removed on unmount", () => {
    const { container, unmount, rerender } = render(<div><Glass draggable lens={false}>Body</Glass></div>);
    const sheet = container.querySelector(".oc-glass") as HTMLElement;
    expect(sheet).toHaveAttribute("data-oc-glass-drag", "");
    expect(sheet).not.toHaveAttribute("draggable");
    expect(sheet).toHaveAttribute("tabindex", "0");
    expect(sheet).toHaveAttribute("aria-roledescription", "draggable");
    expect(sheet).toHaveAttribute("aria-label", "Drag to move");
    // jsdom has no layout: every box is 0 x 0 at 0,0 inside a 240 x 120 parent, so 16px to the right fits
    sheet.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(sheet.style.translate).toMatch(/^16px/);
    rerender(<div><Glass lens={false}>Body</Glass></div>);
    expect(sheet).not.toHaveAttribute("data-oc-glass-drag");
    expect(sheet).not.toHaveAttribute("tabindex");
    expect(sheet.style.translate).toBe("");
    unmount();
  });

  it("outside Chromium: frosted glass (html.oc-no-lens), no filter", () => {
    const { container } = render(<Glass>Body</Glass>);
    expect(container.querySelector(".oc-glass")).not.toHaveAttribute("data-oc-lens");
    expect(document.documentElement).toHaveClass("oc-no-lens");
  });
});
