// File: packages/react/test/v0140.test.tsx
// Map: MeterRow (sub-line) -> Reading -> Callout -> MenuStatic + DropdownItem (check, hint) -> LanguageSelect (code)
//      -> Group -> Button (neon) -> ParticleField

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Button } from "../src/components/Button";
import { Callout } from "../src/components/Callout";
import { DropdownItem, DropdownLabel } from "../src/components/Dropdown";
import { Group } from "../src/components/Group";
import { LanguageSelect } from "../src/components/LanguageSelect";
import { MenuStatic } from "../src/components/MenuStatic";
import { MeterRow } from "../src/components/MeterRow";
import { ParticleField } from "../src/components/ParticleField";
import { Reading } from "../src/components/Reading";

// jsdom has no canvas: the particle field then simply draws nothing.
beforeAll(() => { vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null); });

describe("v0.14.0 components", () => {
  it("meter row draws a sub-line with its own thin bar", () => {
    const { container } = render(<MeterRow label="GPU" percent={40} sub="VRAM 2.7 / 8.0 GB" subPercent={34} subLevel="warn" />);
    expect(container.querySelector(".oc-meter-row__sub")?.textContent).toBe("VRAM 2.7 / 8.0 GB");
    const bar = container.querySelector<HTMLElement>(".oc-meter-row__subbar");
    expect(bar?.style.getPropertyValue("--oc-meter")).toBe("34%");
    expect(bar?.dataset.level).toBe("warn");
  });

  it("reading takes its level as a modifier", () => {
    const { container } = render(<><Reading>41 °C</Reading><Reading level="hot">88 °C</Reading></>);
    const [cool, hot] = container.querySelectorAll(".oc-reading");
    expect(cool.className).toBe("oc-reading");
    expect(hot.className).toBe("oc-reading oc-reading--hot");
  });

  it("callout puts the text and the action side by side", () => {
    const { container } = render(<Callout action={<Button size="sm">Support</Button>}>Like the app?</Callout>);
    expect(container.querySelector(".oc-callout__text")?.textContent).toBe("Like the app?");
    expect(container.querySelector(".oc-callout__action .oc-btn")).toBeTruthy();
  });

  it("static menu items get a check column and a hint", () => {
    render(
      <MenuStatic flat aria-label="Tray">
        <DropdownLabel>View</DropdownLabel>
        <DropdownItem checked hint="Ctrl+T">Always on top</DropdownItem>
        <DropdownItem checked={false}>Start with Windows</DropdownItem>
        <DropdownItem>Quit</DropdownItem>
      </MenuStatic>,
    );
    expect(screen.getByRole("menu").className).toBe("oc-dropdown-menu oc-dropdown-menu--static oc-dropdown-menu--flat");
    const on = screen.getByRole("menuitemcheckbox", { name: /Always on top/ });
    expect(on.getAttribute("aria-checked")).toBe("true");
    expect(on.querySelector(".oc-dropdown-check")).toBeTruthy();
    expect(on.querySelector(".oc-dropdown-hint")?.textContent).toBe("Ctrl+T");
    expect(screen.getByRole("menuitemcheckbox", { name: /Start with Windows/ }).getAttribute("aria-checked")).toBe("false");
    expect(screen.getByText("Quit").getAttribute("role")).toBeNull();
  });

  it("language select shows only the code and follows the choice", () => {
    const { container } = render(<LanguageSelect code ghost options={[{ value: "nl", label: "Nederlands" }, { value: "en", label: "English" }]} />);
    const label = container.querySelector<HTMLElement>(".oc-language-select--code");
    expect(label?.dataset.code).toBe("NL");
    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "en" } });
    expect(label?.dataset.code).toBe("EN");
  });

  it("group renders title, status and meta", () => {
    const { container } = render(<Group title="Service 1" aside="2 busy" asideTone="busy" meta="Last run 2 min ago">rows</Group>);
    expect(container.querySelector("h2.oc-group__title")?.textContent).toBe("Service 1");
    expect(container.querySelector<HTMLElement>(".oc-group__aside")?.dataset.tone).toBe("busy");
    expect(container.querySelector(".oc-group__meta")?.textContent).toBe("Last run 2 min ago");
  });

  it("neon is a button variant", () => {
    render(<Button variant="neon">Scan</Button>);
    expect(screen.getByRole("button").className).toBe("oc-btn oc-btn--neon");
  });

  it("particle field renders a hidden canvas", () => {
    const { container } = render(<ParticleField local count={20} />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.className).toBe("oc-particles oc-particles--local");
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });
});
