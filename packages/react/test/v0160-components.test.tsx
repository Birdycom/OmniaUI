// File: packages/react/test/v0160-components.test.tsx
// Map: combobox with icons (filter, keyboard, choose, icon in the field) -> dropdown item icon -> language menu (flags,
//      current, compact tooltip, onChange) -> sheet options -> plain collapsible -> live frame (inert, device, frameRef,
//      onFrameLoad) -> logo -> mode badge -> code plate -> card accent + band -> sidebar meta

import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../src/components/Combobox";
import { Dropdown, DropdownItem } from "../src/components/Dropdown";
import { LanguageMenu } from "../src/components/LanguageMenu";
import { Sheet } from "../src/components/Sheet";
import { Collapsible } from "../src/components/Collapsible";
import { LiveFrame } from "../src/components/LiveFrame";
import { Logo } from "../src/components/Logo";
import { ModeBadge } from "../src/components/ModeBadge";
import { CodePlate } from "../src/components/CodePlate";
import { Card, CardBand } from "../src/components/Card";
import { SidebarMeta } from "../src/components/SidebarMeta";

const methods = [
  { value: "transfer", label: "Bank transfer", icon: "mdi:bank-outline" },
  { value: "card", label: "Credit card", icon: "mdi:credit-card-outline" },
  { value: "voucher", label: "Voucher", icon: "mdi:ticket-percent-outline", disabled: true },
  { value: "other", label: "Other" },
];

describe("0.16.0 combobox with icons", () => {
  it("draws an icon per option and the chosen icon in the field", () => {
    const { container } = render(<Combobox options={methods} defaultValue="card" label="Payment method" />);
    const root = container.querySelector(".oc-combobox")!;
    expect(root.querySelectorAll(".oc-combobox-option-icon")).toHaveLength(3);
    expect(root.querySelector(".oc-combobox-icon iconify-icon")!.getAttribute("icon")).toBe("mdi:credit-card-outline");
    expect((root.querySelector(".oc-combobox-input") as HTMLInputElement).value).toBe("Credit card");
    expect(root.querySelector('[aria-selected="true"]')!.textContent).toBe("Credit card");
    expect(root.querySelector('[role="listbox"]')!.getAttribute("aria-label")).toBe("Payment method");
  });

  it("filters while typing, moves with the arrows over disabled options and chooses with Enter", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox options={methods} onChange={onChange} name="payment" />);
    const input = container.querySelector(".oc-combobox-input") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "card" } });
    expect([...container.querySelectorAll(".oc-combobox-option")].map((o) => o.textContent)).toEqual(["Credit card"]);
    fireEvent.change(input, { target: { value: "" } }); // the first option is active again
    expect(container.querySelector("[data-active]")!.textContent).toBe("Bank transfer");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const active = container.querySelector("[data-active]")!;
    expect(active.textContent).toBe("Other");
    expect(input.getAttribute("aria-activedescendant")).toBe(active.id);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("other");
    expect((container.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe("other");
    expect(container.querySelector(".oc-combobox")!.getAttribute("data-open")).toBe("false");
  });

  it("shows the empty text and has no icon slot without icons", () => {
    const { container } = render(<Combobox options={[{ value: "a", label: "Astro" }]} emptyText="Nothing" />);
    expect(container.querySelector(".oc-combobox-icon")).toBeNull();
    fireEvent.change(container.querySelector("input")!, { target: { value: "zz" } });
    expect(container.querySelector(".oc-combobox-empty")!.textContent).toBe("Nothing");
  });
});

describe("0.16.0 dropdown item icon", () => {
  it("puts a webicon before the label", () => {
    const { container } = render(<Dropdown trigger="Actions"><DropdownItem icon="mdi:pencil-outline">Edit</DropdownItem><DropdownItem>Paid</DropdownItem></Dropdown>);
    const items = container.querySelectorAll(".oc-dropdown-item");
    expect(items[0].querySelector(".oc-dropdown-icon iconify-icon")!.getAttribute("icon")).toBe("mdi:pencil-outline");
    expect(items[1].querySelector(".oc-dropdown-icon")).toBeNull();
  });
});

const langs = [
  { value: "en", label: "English", flag: "flag:gb-4x3", href: "/en/" },
  { value: "nl", label: "Nederlands", flag: "flag:nl-4x3", href: "/nl/" },
  { value: "fr", label: "Français", flag: "flag:fr-4x3" },
];

describe("0.16.0 language menu", () => {
  it("trigger with flag and code, popover with flags, native names, codes and the current one", () => {
    const { container } = render(<LanguageMenu options={langs} value="nl" ghost />);
    const btn = container.querySelector("button.oc-language-select")!;
    const menu = container.querySelector(".oc-dropdown-menu.oc-language-menu")!;
    expect(btn.classList.contains("oc-language-select--ghost")).toBe(true);
    expect(btn.getAttribute("popovertarget")).toBe(menu.id);
    expect(btn.getAttribute("aria-label")).toBe("Language: Nederlands");
    expect(btn.querySelector(".oc-language-select-code")!.textContent).toBe("NL");
    expect(btn.querySelector(".oc-language-flag iconify-icon")!.getAttribute("icon")).toBe("flag:nl-4x3");
    expect(menu.hasAttribute("popover")).toBe(true);
    const items = [...menu.querySelectorAll(".oc-dropdown-item")];
    expect(items.map((i) => i.getAttribute("lang"))).toEqual(["en", "nl", "fr"]);
    expect(items[0].tagName).toBe("A");
    expect(items[0].getAttribute("hreflang")).toBe("en");
    expect(items[2].tagName).toBe("BUTTON");
    expect(items[1].getAttribute("aria-current")).toBe("true");
    expect(items.map((i) => i.querySelector(".oc-language-menu-code")!.textContent)).toEqual(["EN", "NL", "FR"]);
  });

  it("compact: round icon-only trigger with a tooltip; a click sets the value", () => {
    const onChange = vi.fn();
    const { container } = render(<LanguageMenu options={langs.map(({ href, ...l }) => l)} defaultValue="en" onChange={onChange} compact label="Taal" />);
    const btn = container.querySelector("button.oc-language-select")!;
    expect(btn.className).toContain("oc-language-select--icon");
    expect(btn.className).toContain("oc-tooltip");
    expect(btn.getAttribute("data-tooltip")).toBe("Taal: English");
    expect(btn.querySelector(".oc-language-select-code")).toBeNull();
    fireEvent.click(container.querySelector('[lang="fr"]')!);
    expect(onChange).toHaveBeenCalledWith("fr");
    expect(container.querySelector('[aria-current="true"]')!.getAttribute("lang")).toBe("fr");
  });

  it("show=name and a globe without flags", () => {
    const { container } = render(<LanguageMenu options={[{ value: "de", label: "Deutsch" }]} show="name" />);
    expect(container.querySelector("button")!.textContent).toBe("Deutsch");
    const compact = render(<LanguageMenu options={[{ value: "de", label: "Deutsch" }]} compact />).container;
    expect(compact.querySelector(".oc-language-select-icon svg")).not.toBeNull();
  });
});

describe("0.16.0 sheet, collapsible, live frame", () => {
  it("sheet glass, inset and footer panel", () => {
    const { container } = render(<Sheet glass inset footerPanel footer={<span>App 1</span>} title="Menu">Body</Sheet>);
    const dlg = container.querySelector("dialog")!;
    expect(dlg.className).toBe("oc-sheet oc-sheet--glass oc-sheet--inset");
    expect(container.querySelector(".oc-sheet-footer")!.className).toBe("oc-sheet-footer oc-sheet-footer--panel");
    expect(render(<Sheet>Body</Sheet>).container.querySelector("dialog")!.className).toBe("oc-sheet");
  });

  it("plain collapsible", () => {
    const { container } = render(<Collapsible plain title="Help">Text</Collapsible>);
    expect(container.querySelector("details")!.className).toBe("oc-collapsible oc-collapsible--plain");
  });

  it("live frame: inert, phone size by default, frameRef and onFrameLoad", () => {
    const ref = createRef<HTMLIFrameElement>();
    const onLoad = vi.fn();
    const { container } = render(<LiveFrame src="/preview" title="Preview" device="phone" inert frameRef={ref} onFrameLoad={onLoad} />);
    const box = container.querySelector(".oc-live-frame") as HTMLElement;
    expect(box.classList.contains("oc-live-frame--phone")).toBe(true);
    expect(box.style.getPropertyValue("--oc-live-w")).toBe("390");
    expect(box.style.getPropertyValue("--oc-live-h")).toBe("844");
    const frame = container.querySelector("iframe")!;
    expect(ref.current).toBe(frame);
    expect(frame.hasAttribute("inert")).toBe(true);
    expect(frame.getAttribute("aria-hidden")).toBe("true");
    expect(frame.getAttribute("tabindex")).toBe("-1");
    fireEvent.load(frame);
    expect(onLoad).toHaveBeenCalledTimes(1);
    const tv = render(<LiveFrame src="/x" device="tv" />).container.querySelector(".oc-live-frame") as HTMLElement;
    expect(tv.classList.contains("oc-live-frame--tv")).toBe(true);
    expect(tv.style.getPropertyValue("--oc-live-w")).toBe("1280");
    expect(render(<LiveFrame src="/x" />).container.querySelector("iframe")!.hasAttribute("inert")).toBe(false);
  });
});

describe("0.16.0 logo, mode badge, code plate, card accent, sidebar meta", () => {
  it("logo: own image, a set plate, the box fit and size tokens", () => {
    const { container } = render(<Logo src="/logo.svg" alt="Company 1" plate="light" fit="box" height="2rem" maxWidth="10rem" />);
    const el = container.querySelector(".oc-logo") as HTMLElement;
    expect(el.className).toBe("oc-logo oc-logo--box");
    expect(el.dataset.plate).toBe("light");
    expect(el.style.getPropertyValue("--oc-logo-h")).toBe("2rem");
    expect(el.style.getPropertyValue("--oc-logo-w")).toBe("10rem");
    expect(el.querySelector("img")!.getAttribute("alt")).toBe("Company 1");
    expect(render(<Logo src="/a.svg" alt="A" />).container.querySelector(".oc-logo")!.getAttribute("data-plate")).toBe("auto");
  });

  it("mode badge: test, live, both as two parts, sizes, translated words", () => {
    const t = render(<ModeBadge mode="test" size="lg" />).container.firstElementChild!;
    expect(t.className).toBe("oc-mode-badge oc-mode-badge--lg");
    expect(t.getAttribute("data-mode")).toBe("test");
    expect(t.textContent).toBe("Test");
    const both = render(<ModeBadge mode="both" labels={{ test: "Proef", live: "Echt" }} />).container.firstElementChild!;
    expect([...both.children].map((c) => c.textContent)).toEqual(["Proef", "Echt"]);
    expect(render(<ModeBadge mode="live" />).container.textContent).toBe("Live");
  });

  it("code plate: the code, then the caption on the plate", () => {
    const { container } = render(<CodePlate mode="live" caption="Live"><img alt="QR" src="/qr.svg" /></CodePlate>);
    const fig = container.querySelector("figure.oc-code-plate")!;
    expect(fig.getAttribute("data-mode")).toBe("live");
    expect(fig.firstElementChild!.tagName).toBe("IMG");
    expect(fig.querySelector("figcaption.oc-code-plate__caption")!.textContent).toBe("Live");
    const both = render(<CodePlate mode="both" size="sm"><img alt="QR" src="/qr.svg" /></CodePlate>).container;
    expect(both.querySelector("figure")!.className).toBe("oc-code-plate oc-code-plate--sm");
    expect([...both.querySelectorAll("figcaption span")].map((s) => s.textContent)).toEqual(["Test", "Live"]);
    expect(render(<CodePlate><img alt="QR" src="/qr.svg" /></CodePlate>).container.querySelector("figcaption")).toBeNull();
  });

  it("card accent with a band; inactive", () => {
    const { container } = render(<Card accent="test" inactive><CardBand start={<ModeBadge mode="test" />} title="Test round" description="Try it">Now</CardBand></Card>);
    const card = container.querySelector(".oc-card")!;
    expect(card.className).toBe("oc-card oc-card--accent");
    expect(card.getAttribute("data-tone")).toBe("test");
    expect(card.getAttribute("data-active")).toBe("false");
    const band = card.querySelector(".oc-card-band")!;
    expect(band.firstElementChild!.className).toBe("oc-mode-badge");
    expect(band.querySelector(".oc-card-band__title")!.textContent).toBe("Test roundTry it");
    expect(band.querySelector(".oc-card-band__title small")!.textContent).toBe("Try it");
    const plain = render(<Card>x</Card>).container.querySelector(".oc-card")!;
    expect(plain.className).toBe("oc-card");
    expect(plain.hasAttribute("data-tone")).toBe(false);
    expect(plain.hasAttribute("data-active")).toBe(false);
  });

  it("sidebar meta: brand, version, copyright and the whole line as tooltip", () => {
    const { container } = render(<SidebarMeta brand="App 1" version="2.4.0" copyright="© 2026 Company 1" />);
    const el = container.querySelector(".oc-sidebar-meta")!;
    expect(el.className).toBe("oc-sidebar-meta oc-tooltip oc-tooltip--right");
    expect(el.getAttribute("data-tooltip")).toBe("App 1 2.4.0 · © 2026 Company 1");
    expect(el.getAttribute("tabindex")).toBe("0");
    expect([...el.children].map((c) => c.className)).toEqual(["oc-sidebar-meta__brand", "oc-sidebar-meta__version", "oc-sidebar-meta__copy"]);
  });
});
