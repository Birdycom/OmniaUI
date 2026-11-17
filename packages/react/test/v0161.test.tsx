// File: packages/react/test/v0161.test.tsx
// Map: Webicon (registered set, size, label, unknown, ratio, subset by name, aliases + flip, map with a path, late
//      registration, unique ids, iconify fallback) -> components without the Iconify runtime (language menu flags,
//      combobox) -> dialog close options -> live frame laptop -> card fill

import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { addWebicons, getWebicon, hasWebicon, registerWebicons, Webicon } from "../src/components/Webicon";
import { LanguageMenu } from "../src/components/LanguageMenu";
import { Combobox } from "../src/components/Combobox";
import { Sheet } from "../src/components/Sheet";
import { Modal } from "../src/components/Modal";
import { ConfirmDialog } from "../src/components/ConfirmDialog";
import { AlertDialog } from "../src/components/AlertDialog";
import { LiveFrame } from "../src/components/LiveFrame";
import { Card } from "../src/components/Card";

const HOME = "M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z";
registerWebicons({
  prefix: "mdi",
  width: 24,
  height: 24,
  icons: {
    home: { body: `<path fill="currentColor" d="${HOME}"/>` },
    "arrow-left": { body: '<path fill="currentColor" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z"/>' },
  },
  aliases: { "home-alias": { parent: "home" }, "arrow-right-flipped": { parent: "arrow-left", hFlip: true } },
});

describe("0.16.1 Webicon", () => {
  it("draws a registered icon as inline SVG in currentColor, decorative by default", () => {
    const { container } = render(<Webicon name="mdi:home" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg.getAttribute("fill")).toBe("currentColor");
    expect(svg.getAttribute("class")).toBe("oc-icon");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();
    expect(svg.getAttribute("data-webicon")).toBe("mdi:home");
    expect(svg.querySelector("path")!.getAttribute("d")).toBe(HOME);
  });

  it("size class, own class and attributes", () => {
    const { container } = render(<Webicon name="mdi:home" size="lg" className="text-primary" id="i1" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toBe("oc-icon oc-icon--lg text-primary");
    expect(svg.id).toBe("i1");
  });

  it("a label makes it role img with a title", () => {
    const { container } = render(<Webicon name="mdi:home" label="Home <page>" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Home <page>");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(svg.querySelector("title")!.textContent).toBe("Home <page>");
  });

  it("an unknown icon draws nothing and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<><Webicon name="mdi:no-such-icon" /><Webicon name="mdi:no-such-icon" /></>);
    expect(container.innerHTML).toBe("");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("mdi:no-such-icon");
    warn.mockRestore();
  });

  it("a 4:3 flag keeps its ratio (built in)", () => {
    const { container } = render(<Webicon name="flag:nl-4x3" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 640 480");
    expect(svg.getAttribute("width")).toBe("1.3333em");
    expect(svg.style.getPropertyValue("--oc-icon-ratio")).toBe("1.3333");
  });

  it("aliases and flips of a set; a subset by name", () => {
    expect(getWebicon("mdi:home-alias")!.body).toContain(HOME);
    const { container } = render(<Webicon name="mdi:arrow-right-flipped" />);
    expect(container.querySelector("g")!.getAttribute("transform")).toBe("translate(24 0) scale(-1 1)");
    registerWebicons({ prefix: "mdi-light", width: 24, height: 24, icons: { truck: { body: "<path d='M1 1h2'/>" }, other: { body: "<path/>" } } }, ["truck", "mdi-light:nope"]);
    expect(hasWebicon("mdi-light:truck")).toBe(true);
    expect(hasWebicon("mdi-light:other")).toBe(false);
  });

  it("a map by full name with a 24x24 path; icons registered after the first render show up", () => {
    const { container } = render(<Webicon name="material-symbols:star" />);
    expect(container.querySelector("svg")).toBeNull();
    act(() => addWebicons({ "material-symbols:star": "m12 17.27l6.18 3.73l-1.64-7.03L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21z" }));
    expect(container.querySelector("svg path")!.getAttribute("d")).toMatch(/^m12 17.27/);
  });

  it("ids inside an icon are unique per copy", () => {
    addWebicons({ "vscode-icons:file": { body: '<defs><linearGradient id="a"/></defs><path fill="url(#a)" d="M0 0h32v32H0z"/>', width: 32, height: 32 } });
    const { container } = render(<><Webicon name="vscode-icons:file" /><Webicon name="vscode-icons:file" /></>);
    const ids = [...container.querySelectorAll("linearGradient")].map((g) => g.id);
    expect(ids[0]).not.toBe(ids[1]);
    expect(container.querySelectorAll("path")[0].getAttribute("fill")).toBe(`url(#${ids[0]})`);
  });

  it("fallback iconify draws the Iconify element for a name only that runtime knows", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Webicon name="mdi:only-in-runtime" fallback="iconify" />);
    expect(container.querySelector("iconify-icon")!.getAttribute("icon")).toBe("mdi:only-in-runtime");
    warn.mockRestore();
  });
});

describe("0.16.1 components draw webicons without the Iconify runtime", () => {
  it("language menu shows its flags as inline SVG", () => {
    expect(customElements.get("iconify-icon")).toBeUndefined();
    const langs = [
      { value: "en", label: "English", flag: "flag:gb-4x3" },
      { value: "nl", label: "Nederlands", flag: "flag:nl-4x3" },
      { value: "fr", label: "Français", flag: "flag:fr-4x3" },
    ];
    const { container } = render(<LanguageMenu options={langs} value="nl" />);
    expect(container.querySelector("iconify-icon")).toBeNull();
    const flags = [...container.querySelectorAll(".oc-language-flag svg")];
    expect(flags.map((f) => f.getAttribute("data-webicon"))).toEqual(["flag:nl-4x3", "flag:gb-4x3", "flag:nl-4x3", "flag:fr-4x3"]);
    expect(flags.every((f) => f.querySelector("path"))).toBe(true);
  });

  it("combobox draws registered option icons as SVG", () => {
    const { container } = render(<Combobox options={[{ value: "h", label: "Home", icon: "mdi:home" }]} defaultValue="h" label="Page" />);
    expect(container.querySelector(".oc-combobox-icon svg")!.getAttribute("data-webicon")).toBe("mdi:home");
  });
});

describe("0.16.1 close button options", () => {
  it("sheet and confirm dialog: closeRound and closeClassName", () => {
    const sheet = render(<Sheet open title="Filters" closeRound closeClassName="my-close">x</Sheet>).container;
    expect(sheet.querySelector(".oc-sheet-close")!.className).toBe("oc-sheet-close oc-close--round my-close");
    const confirm = render(<ConfirmDialog open title="Delete?" closeRound />).container;
    expect(confirm.querySelector(".oc-alert-dialog-close")!.className).toBe("oc-alert-dialog-close oc-close--round");
    expect(render(<Sheet open title="Plain">x</Sheet>).container.querySelector(".oc-sheet-close")!.className).toBe("oc-sheet-close");
  });

  it("modal and alert dialog: a close button only when asked", () => {
    expect(render(<Modal open title="Edit">x</Modal>).container.querySelector(".oc-modal-close")).toBeNull();
    const modal = render(<Modal open title="Edit" closeButton closeLabel="Sluiten">x</Modal>).container;
    expect(modal.querySelector(".oc-modal-close")!.getAttribute("aria-label")).toBe("Sluiten");
    const round = render(<Modal open title="Edit" closeRound>x</Modal>).container;
    expect(round.querySelector(".oc-modal-close")!.className).toBe("oc-modal-close oc-close--round");
    const onOpenChange = vi.fn();
    const alert = render(<AlertDialog open title="Saved" closeClassName="x" onOpenChange={onOpenChange} />).container;
    const btn = alert.querySelector<HTMLButtonElement>(".oc-alert-dialog-close")!;
    expect(btn.className).toBe("oc-alert-dialog-close x");
    act(() => btn.click());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("0.16.1 live frame laptop and card fill", () => {
  it("laptop: class and 1440 x 900 by default", () => {
    const frame = render(<LiveFrame device="laptop" src="/p" title="Preview" />).container.querySelector<HTMLElement>(".oc-live-frame")!;
    expect(frame.className).toBe("oc-live-frame oc-live-frame--laptop");
    expect(frame.style.getPropertyValue("--oc-live-w")).toBe("1440");
    expect(frame.style.getPropertyValue("--oc-live-h")).toBe("900");
  });

  it("card fill", () => {
    expect(render(<Card accent="test" fill />).container.firstElementChild!.className).toBe("oc-card oc-card--accent oc-card--fill");
  });
});
