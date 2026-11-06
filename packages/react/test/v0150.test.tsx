// File: packages/react/test/v0150.test.tsx
// Map: ThemeSwitch with icons only (--icons, hidden text, tooltip) -> icon + text -> default without icons

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeSwitch } from "../src/components/ThemeSwitch";

describe("0.15.0 theme switch with icons", () => {
  it("icons only: --icons, a webicon per mode, the text for screen readers and as tooltip", () => {
    const { container } = render(<ThemeSwitch icons />);
    const root = container.querySelector(".oc-theme-switch")!;
    expect(root.classList.contains("oc-theme-switch--icons")).toBe(true);
    expect([...root.querySelectorAll("iconify-icon")].map((i) => i.getAttribute("icon"))).toEqual(["mdi:monitor", "mdi:white-balance-sunny", "mdi:weather-night"]);
    expect([...root.querySelectorAll(".oc-theme-switch__text")].map((s) => s.textContent)).toEqual(["System", "Light", "Dark"]);
    expect(root.querySelector("label")!.getAttribute("title")).toBe("System");
  });

  it("icon + text without the modifier; no icons by default", () => {
    const withText = render(<ThemeSwitch icons="text" />).container;
    expect(withText.querySelector(".oc-theme-switch--icons")).toBeNull();
    expect(withText.querySelectorAll("iconify-icon")).toHaveLength(3);
    expect(withText.querySelector("label")!.textContent).toContain("System");
    expect(render(<ThemeSwitch />).container.querySelector("iconify-icon")).toBeNull();
  });
});
