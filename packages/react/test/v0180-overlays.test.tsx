// File: packages/react/test/v0180-overlays.test.tsx
// Map: Combobox portal in the top layer (Dialog / Sheet / Drawer, fallback to body) -> PopoverContent lazy +
//      matchTriggerWidth + flip/shift fallback -> Tooltip asChild -> Dropdown side/align, triggerAsChild, DropdownItem asChild

import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forwardRef, useState } from "react";
import type { AnchorHTMLAttributes } from "react";
import { Combobox } from "../src/components/Combobox";
import { Modal } from "../src/components/Modal";
import { Sheet } from "../src/components/Sheet";
import { Drawer } from "../src/components/Drawer";
import { Popover, PopoverContent, PopoverTrigger, popoverPosition } from "../src/components/Popover";
import { Tooltip } from "../src/components/Tooltip";
import { Dropdown, DropdownItem } from "../src/components/Dropdown";

const options = [
  { value: "1", label: "Customer 1" },
  { value: "2", label: "Customer 2" },
];

// jsdom has no <dialog> modal API and no popover API: small stand-ins, removed again after each test.
const realMatches = Element.prototype.matches;
let shown: HTMLElement[] = [];
function installPopover() {
  const dlg = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
  dlg.showModal = function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
  dlg.close = function (this: HTMLDialogElement) { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); };
  const el = HTMLElement.prototype as unknown as Record<string, unknown>;
  el.showPopover = function (this: HTMLElement) { this.dataset.testOpen = "1"; shown.push(this); };
  el.hidePopover = function (this: HTMLElement) { delete this.dataset.testOpen; };
  Element.prototype.matches = function (this: Element, sel: string) {
    if (sel === ":popover-open") return (this as HTMLElement).dataset?.testOpen === "1";
    return realMatches.call(this, sel);
  };
}
function removePopover() {
  const el = HTMLElement.prototype as unknown as Record<string, unknown>;
  delete el.showPopover;
  delete el.hidePopover;
  Element.prototype.matches = realMatches;
}
beforeEach(() => { shown = []; installPopover(); });
afterEach(() => removePopover());

describe("Combobox portal in the top layer (0.18.0)", () => {
  const cases = [
    ["Dialog", (child: React.ReactNode) => <Modal open title="Edit">{child}</Modal>],
    ["Sheet", (child: React.ReactNode) => <Sheet open title="Edit">{child}</Sheet>],
    ["Drawer", (child: React.ReactNode) => <Drawer open title="Edit">{child}</Drawer>],
  ] as const;
  for (const [name, wrap] of cases) {
    it(`stays inside an open modal ${name} as popover="manual" and still chooses`, () => {
      const onChange = vi.fn();
      const { container } = render(wrap(<Combobox options={options} portal onChange={onChange} label="Customer" module="green" />));
      const dialog = container.querySelector("dialog") ?? document.querySelector("dialog")!;
      const root = dialog.querySelector(".oc-combobox")!;
      const list = root.querySelector<HTMLElement>(".oc-combobox-list--portal")!;
      expect(list).not.toBeNull();
      expect(list.getAttribute("popover")).toBe("manual");
      expect(document.body.querySelector(":scope > .oc-combobox-list--portal")).toBeNull();
      const input = root.querySelector("input")!;
      fireEvent.focus(input);
      expect(list.dataset.testOpen).toBe("1");
      expect(list.getAttribute("data-open")).toBe("");
      expect(list.style.position).toBe("fixed");
      // A press in the list keeps the focus; a click chooses and closes.
      const down = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      list.querySelector('[data-value="2"]')!.dispatchEvent(down);
      expect(down.defaultPrevented).toBe(true);
      fireEvent.click(list.querySelector('[data-value="2"]')!);
      expect(onChange).toHaveBeenCalledWith("2");
      expect(list.dataset.testOpen).toBeUndefined();
      // Escape and blur close it (no light dismiss on a manual popover).
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(list.dataset.testOpen).toBe("1");
      fireEvent.keyDown(input, { key: "Escape" });
      expect(list.dataset.testOpen).toBeUndefined();
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(list.dataset.testOpen).toBeUndefined();
    });
  }

  it("the panel with a footer is the popover", () => {
    const { container } = render(<Combobox options={options} portal manageHref="#customers" label="Customer" />);
    const panel = container.querySelector(".oc-combobox-list--panel")!;
    expect(panel.getAttribute("popover")).toBe("manual");
    expect(panel.querySelector('[role="listbox"]')!.hasAttribute("popover")).toBe(false);
  });

  it("falls back to document.body without popover support", () => {
    removePopover();
    render(<Combobox options={options} portal label="Customer" />);
    const list = document.body.querySelector(":scope > .oc-combobox-list--portal")!;
    expect(list).not.toBeNull();
    expect(list.hasAttribute("popover")).toBe(false);
  });

  it("without portal the list is never a popover", () => {
    const { container } = render(<Combobox options={options} label="Customer" />);
    expect(container.querySelector(".oc-combobox-list")!.hasAttribute("popover")).toBe(false);
  });
});

describe("PopoverContent lazy, matchTriggerWidth and fallback flip (0.18.0)", () => {
  it("lazy renders the children from the first open on; unmountOnClose removes them again", () => {
    function Demo({ unmount }: { unmount?: boolean }) {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" data-t="toggle" onClick={() => setOpen(!open)}>t</button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent lazy unmountOnClose={unmount} title="Customer 1"><p data-t="heavy">Details</p></PopoverContent>
          </Popover>
        </>
      );
    }
    for (const unmount of [false, true]) {
      const { container, unmount: done } = render(<Demo unmount={unmount} />);
      const toggle = container.querySelector('[data-t="toggle"]')!;
      expect(container.querySelector(".oc-popover-title")!.textContent).toBe("Customer 1");
      expect(container.querySelector('[data-t="heavy"]')).toBeNull();
      fireEvent.click(toggle);
      expect(container.querySelector('[data-t="heavy"]')).not.toBeNull();
      fireEvent.click(toggle);
      expect(container.querySelector('[data-t="heavy"]') === null).toBe(unmount);
      done();
    }
  });

  it("without lazy the children render while closed (unchanged)", () => {
    const { container } = render(<Popover><PopoverTrigger>Open</PopoverTrigger><PopoverContent><p data-t="x">x</p></PopoverContent></Popover>);
    expect(container.querySelector('[data-t="x"]')).not.toBeNull();
  });

  it("matchTriggerWidth sets data-match-width and the trigger width in px without anchor positioning", () => {
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return { top: 100, left: 40, width: 240, height: 36, bottom: 136, right: 280, x: 40, y: 100, toJSON: () => ({}) } as DOMRect;
    });
    const { container } = render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent matchTriggerWidth>Customer 1</PopoverContent>
      </Popover>,
    );
    const panel = container.querySelector<HTMLElement>(".oc-popover")!;
    expect(panel.hasAttribute("data-match-width")).toBe(true);
    expect(panel.style.width).toBe("240px");
    rect.mockRestore();
  });

  it("popoverPosition flips to the side with room and shifts into the viewport", () => {
    const view = { width: 400, height: 300 };
    const panel = { width: 200, height: 100 };
    // Bottom has no room (anchor near the bottom edge): flips to top.
    expect(popoverPosition({ top: 250, left: 50, width: 80, height: 30 }, panel, "bottom", "start", 4, view)).toEqual({ top: 146, left: 50, side: "top" });
    // Enough room: stays.
    expect(popoverPosition({ top: 20, left: 50, width: 80, height: 30 }, panel, "bottom", "start", 4, view)).toEqual({ top: 54, left: 50, side: "bottom" });
    // Too far right: shifted left to 8px from the edge.
    expect(popoverPosition({ top: 20, left: 350, width: 40, height: 30 }, panel, "bottom", "start", 4, view).left).toBe(192);
    // Right side without room flips to the left.
    expect(popoverPosition({ top: 100, left: 300, width: 40, height: 30 }, panel, "right", "start", 4, view).side).toBe("left");
    // Without a viewport: the old result (no side key).
    expect(popoverPosition({ top: 250, left: 50, width: 80, height: 30 }, panel, "bottom", "start", 4)).toEqual({ top: 284, left: 50 });
  });
});

describe("Tooltip asChild (0.18.0)", () => {
  it("puts the tooltip on the child without a wrapping span", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Tooltip content="Save" side="bottom" asChild>
        <button type="button" className="oc-btn" onClick={onClick}>S</button>
      </Tooltip>,
    );
    expect(container.querySelector("span.oc-tooltip")).toBeNull();
    const btn = container.querySelector("button")!;
    expect(container.firstElementChild).toBe(btn);
    expect(btn.className).toBe("oc-tooltip oc-tooltip--bottom oc-btn");
    expect(btn.getAttribute("data-tooltip")).toBe("Save");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it("appends rich content inside the child and links it", () => {
    const { container } = render(
      <Tooltip content={<b>Customer 1</b>} heading="customer" asChild>
        <a href="#c">Open</a>
      </Tooltip>,
    );
    const a = container.querySelector("a")!;
    expect(a.classList.contains("oc-tooltip")).toBe(true);
    expect(a.textContent).toBe("OpencustomerCustomer 1");
    const content = a.querySelector(".oc-tooltip__content")!;
    expect(content.getAttribute("role")).toBe("tooltip");
    expect(a.getAttribute("aria-describedby")).toBe(content.id);
    expect(a.hasAttribute("data-tooltip")).toBe(false);
  });

  it("controlled open works on the child", () => {
    const onOpenChange = vi.fn();
    const { container } = render(<Tooltip content="Save" open={false} onOpenChange={onOpenChange} asChild><button type="button">S</button></Tooltip>);
    const btn = container.querySelector("button")!;
    expect(btn.classList.contains("is-closed")).toBe(true);
    fireEvent.mouseEnter(btn);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("Dropdown side/align, triggerAsChild, DropdownItem asChild (0.18.0)", () => {
  it("side and align land on the menu as data-side / data-align (bottom start by default once set)", () => {
    const a = render(<Dropdown trigger="Actions" side="top" align="end"><DropdownItem>Edit</DropdownItem></Dropdown>);
    const menu = a.container.querySelector(".oc-dropdown-menu")!;
    expect(menu.getAttribute("data-side")).toBe("top");
    expect(menu.getAttribute("data-align")).toBe("end");
    a.unmount();
    const b = render(<Dropdown trigger="Actions" align="end"><DropdownItem>Edit</DropdownItem></Dropdown>);
    expect(b.container.querySelector(".oc-dropdown-menu")!.getAttribute("data-side")).toBe("bottom");
    b.unmount();
    const c = render(<Dropdown trigger="Actions"><DropdownItem>Edit</DropdownItem></Dropdown>);
    expect(c.container.querySelector(".oc-dropdown-menu")!.hasAttribute("data-side")).toBe(false);
    c.unmount();
    const d = render(<Dropdown trigger="Actions" mode="toggle" side="right"><DropdownItem>Edit</DropdownItem></Dropdown>);
    expect(d.container.querySelector(".oc-dropdown-menu")!.getAttribute("data-side")).toBe("right");
  });

  it("triggerAsChild merges popoverTarget into the trigger element", () => {
    const { container } = render(
      <Dropdown id="m1" triggerAsChild trigger={<button type="button" className="oc-btn oc-btn--ghost" aria-label="More">...</button>}>
        <DropdownItem>Edit</DropdownItem>
      </Dropdown>,
    );
    const btn = container.querySelector("button.oc-btn--ghost")!;
    expect(btn.getAttribute("popovertarget")).toBe("m1");
    expect(btn.classList.contains("oc-btn--outline")).toBe(false);
    expect(container.querySelectorAll("button.oc-btn").length).toBe(1);
  });

  it("triggerAsChild in toggle mode merges the toggle click", () => {
    const { container } = render(
      <Dropdown mode="toggle" triggerAsChild trigger={<button type="button" className="oc-avatar-btn">C1</button>}>
        <DropdownItem>Edit</DropdownItem>
      </Dropdown>,
    );
    const btn = container.querySelector("button.oc-avatar-btn")!;
    fireEvent.click(btn);
    expect(container.querySelector(".oc-dropdown")!.classList.contains("is-open")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("DropdownItem asChild renders a router link as the item and closes the menu on a click", () => {
    const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(function Link({ to, ...rest }, ref) {
      return <a ref={ref} href={to} data-router="" {...rest} />;
    });
    const { container } = render(
      <Dropdown trigger="Account">
        <DropdownItem asChild icon={<svg data-i="" />} hint="Ctrl P"><Link to="#profile">Profile</Link></DropdownItem>
      </Dropdown>,
    );
    const menu = container.querySelector<HTMLElement>(".oc-dropdown-menu")!;
    act(() => menu.showPopover());
    const a = container.querySelector("a[data-router]")!;
    expect(a.getAttribute("href")).toBe("#profile");
    expect(a.classList.contains("oc-dropdown-item")).toBe(true);
    expect(a.querySelector(".oc-dropdown-icon svg")).not.toBeNull();
    expect(a.querySelector(".oc-dropdown-hint")!.textContent).toBe("Ctrl P");
    expect(a.textContent).toContain("Profile");
    expect(menu.querySelectorAll(".oc-dropdown-item").length).toBe(1);
    fireEvent.click(a);
    expect(menu.dataset.testOpen).toBeUndefined();
  });
});
