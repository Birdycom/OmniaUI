// File: packages/react/test/v0170-d3.test.tsx
// Map: compound Tabs (controlled value, keyboard, module) -> compound Dialog (open/close, asChild merge, scroll) ->
//      compound Popover (controlled open, toggle event, side/align, anchor) -> Tooltip (rich content, controlled, provider) ->
//      BlockAppHeader (More overflow with a ResizeObserver mock, search slot) -> old props APIs unchanged

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger, nextTabIndex } from "../src/components/Tabs";
import {
  Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogScrollContent, DialogTitle, DialogTrigger, Modal,
} from "../src/components/Modal";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger, popoverPosition } from "../src/components/Popover";
import { Tooltip, TooltipProvider } from "../src/components/Tooltip";
import { BlockAppHeader, fitNavItems } from "../src/blocks/BlockAppHeader";

// jsdom has no <dialog> modal API and no popover API: small stand-ins.
beforeEach(() => {
  const dlg = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
  dlg.showModal = function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
  dlg.close = function (this: HTMLDialogElement) { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); };
  const el = HTMLElement.prototype as unknown as Record<string, unknown>;
  el.showPopover = function (this: HTMLElement) { this.dataset.testOpen = "1"; };
  el.hidePopover = function (this: HTMLElement) { delete this.dataset.testOpen; };
  const matches = Element.prototype.matches;
  Element.prototype.matches = function (this: Element, sel: string) {
    if (sel === ":popover-open") return (this as HTMLElement).dataset?.testOpen === "1";
    return matches.call(this, sel);
  };
  (Element.prototype as unknown as { __m?: typeof matches }).__m = matches;
});
afterEach(() => {
  const proto = Element.prototype as unknown as { __m?: typeof Element.prototype.matches };
  if (proto.__m) Element.prototype.matches = proto.__m;
});

describe("compound Tabs", () => {
  it("renders list, triggers and panels with linked ids; defaultValue selects", () => {
    render(
      <Tabs defaultValue="b" name="t1" module="green">
        <TabsList aria-label="Sections">
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b" count={3}>Beta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    const b = screen.getByRole("tab", { name: /Beta/ });
    expect(b.getAttribute("aria-selected")).toBe("true");
    expect(b.id).toBe("t1-tab-b");
    expect(b.getAttribute("aria-controls")).toBe("t1-b");
    expect(document.getElementById("t1-b")!.className).toContain("is-active");
    expect(document.getElementById("t1-a")!.className).not.toContain("is-active");
    expect(document.querySelector(".oc-tabs")!.getAttribute("data-module")).toBe("green");
    expect(b.querySelector(".oc-data-table-tab-count")!.textContent).toBe("3");
  });

  it("controlled value + onValueChange (and onChange)", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    function Host() {
      const [v, setV] = useState("a");
      return (
        <Tabs value={v} onValueChange={(x) => { onValueChange(x); setV(x); }} onChange={onChange}>
          <TabsList><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList>
          <TabsContent value="a">PA</TabsContent>
          <TabsContent value="b">PB</TabsContent>
        </Tabs>
      );
    }
    render(<Host />);
    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tab", { name: "B" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("PB").className).toContain("is-active");
  });

  it("arrow keys skip disabled tabs and wrap; Home/End", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>B</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
        <TabsContent value="a">PA</TabsContent>
        <TabsContent value="c">PC</TabsContent>
      </Tabs>,
    );
    const a = screen.getByRole("tab", { name: "A" });
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "C" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(screen.getByRole("tab", { name: "C" }), { key: "ArrowRight" });
    expect(a.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(a, { key: "End" });
    expect(screen.getByRole("tab", { name: "C" }).getAttribute("aria-selected")).toBe("true");
    expect(nextTabIndex(0, [false, true, false], "ArrowLeft")).toBe(2);
    expect(nextTabIndex(0, [false, false], "ArrowDown", true)).toBe(1);
    expect(nextTabIndex(0, [false, false], "x")).toBe(-1);
  });

  it("forceMount=false renders only the active content; the old tabs prop still works", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList>
        <TabsContent value="a" forceMount={false}>Shown</TabsContent>
        <TabsContent value="b" forceMount={false}>Lazy</TabsContent>
      </Tabs>,
    );
    expect(screen.queryByText("Lazy")).toBeNull();
    const { container } = render(<Tabs tabs={[{ value: "x", label: "X", content: "CX" }]} />);
    expect(container.querySelector(".oc-tabset input[type=radio]")).not.toBeNull();
  });
});

describe("compound Dialog", () => {
  it("trigger opens, DialogClose closes, title/description wire aria", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger>Edit</DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit customer</DialogTitle><DialogDescription>Customer 1</DialogDescription></DialogHeader>
          <DialogBody>Body</DialogBody>
          <DialogFooter><DialogClose>Cancel</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const dialog = document.querySelector("dialog.oc-modal") as HTMLDialogElement;
    expect(dialog.hasAttribute("open")).toBe(false);
    const trigger = screen.getByRole("button", { name: "Edit" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    fireEvent.click(trigger);
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const title = screen.getByText("Edit customer");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBe(screen.getByText("Customer 1").id);
    fireEvent.click(screen.getByText("Cancel"));
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("controlled open; native close reports false; corner close button", () => {
    function Host() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <Dialog open={open} onOpenChange={setOpen}><DialogContent closeLabel="Close it"><DialogTitle>T</DialogTitle></DialogContent></Dialog>
        </>
      );
    }
    render(<Host />);
    const dialog = document.querySelector("dialog.oc-modal") as HTMLDialogElement;
    expect(dialog.hasAttribute("open")).toBe(true);
    fireEvent.click(screen.getByLabelText("Close it"));
    expect(screen.getByTestId("state").textContent).toBe("false");
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  it("asChild merges the trigger into the child (classes joined, both handlers run)", () => {
    const own = vi.fn();
    render(
      <Dialog>
        <DialogTrigger asChild className="from-trigger"><a href="#x" className="my-link" onClick={own}>Open link</a></DialogTrigger>
        <DialogContent><DialogTitle>T</DialogTitle></DialogContent>
      </Dialog>,
    );
    const link = screen.getByText("Open link");
    expect(link.tagName).toBe("A");
    expect(link.className).toContain("my-link");
    expect(link.className).toContain("from-trigger");
    expect(link.getAttribute("aria-haspopup")).toBe("dialog");
    fireEvent.click(link);
    expect(own).toHaveBeenCalled();
    expect((document.querySelector("dialog") as HTMLDialogElement).hasAttribute("open")).toBe(true);
  });

  it("DialogScrollContent adds the scroll modifier; Modal keeps its props API", () => {
    render(<Dialog defaultOpen><DialogScrollContent size="lg"><DialogBody>Long</DialogBody></DialogScrollContent></Dialog>);
    expect(document.querySelector(".oc-modal-content--scroll.oc-modal-content--lg")).not.toBeNull();
    render(<Modal title="Old" open />);
    expect(screen.getByText("Old").className).toBe("oc-modal-title");
  });
});

describe("compound Popover", () => {
  it("controlled open shows and hides the native popover; toggle event reports back", () => {
    const onOpenChange = vi.fn();
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>outside</button>
          <Popover open={open} onOpenChange={(v) => { onOpenChange(v); setOpen(v); }}>
            <PopoverTrigger>Filter</PopoverTrigger>
            <PopoverContent side="top" align="center" sideOffset={8} title="Filters">Body</PopoverContent>
          </Popover>
        </>
      );
    }
    render(<Host />);
    const panel = document.querySelector(".oc-popover") as HTMLElement;
    const trigger = screen.getByRole("button", { name: "Filter" });
    expect(trigger.getAttribute("popovertarget")).toBe(panel.id);
    expect(panel.getAttribute("data-side")).toBe("top");
    expect(panel.getAttribute("data-align")).toBe("center");
    expect(panel.style.getPropertyValue("--oc-popover-offset")).toBe("8px");
    expect(panel.dataset.testOpen).toBeUndefined();
    fireEvent.click(screen.getByText("outside"));
    expect(panel.dataset.testOpen).toBe("1");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    // A native close (Esc / light dismiss) arrives as a toggle event.
    act(() => {
      delete panel.dataset.testOpen;
      const e = new Event("toggle") as Event & { newState?: string };
      e.newState = "closed";
      panel.dispatchEvent(e);
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("PopoverAnchor names the anchor; asChild trigger; old trigger prop unchanged", () => {
    render(
      <Popover defaultOpen>
        <PopoverAnchor><span>Row 1</span></PopoverAnchor>
        <PopoverTrigger asChild><button className="oc-btn oc-btn--ghost">More</button></PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    const anchor = document.querySelector("[data-oc-popover-anchor]") as HTMLElement;
    const panel = document.querySelector(".oc-popover") as HTMLElement;
    const name = anchor.style.getPropertyValue("anchor-name") || (anchor.style as unknown as Record<string, string>).anchorName;
    expect(name).toBe(`--${panel.id}`);
    expect(screen.getByRole("button", { name: "More" }).className).toBe("oc-btn oc-btn--ghost");
    expect(panel.dataset.testOpen).toBe("1");
    render(<Popover trigger="Old">Old body</Popover>);
    expect(screen.getByRole("button", { name: "Old" }).getAttribute("popovertarget")).toBeTruthy();
  });

  it("popoverPosition places the panel on each side (fallback without anchor positioning)", () => {
    const a = { top: 100, left: 50, width: 40, height: 20 };
    const p = { width: 100, height: 60 };
    expect(popoverPosition(a, p, "bottom", "start", 4)).toEqual({ top: 124, left: 50 });
    expect(popoverPosition(a, p, "top", "end", 4)).toEqual({ top: 36, left: -10 });
    expect(popoverPosition(a, p, "right", "center", 4)).toEqual({ top: 80, left: 94 });
    expect(popoverPosition(a, p, "left", "start", 4)).toEqual({ top: 100, left: -54 });
  });
});

describe("Tooltip", () => {
  it("node content renders rich .oc-tooltip__content with aria-describedby", () => {
    render(<Tooltip content={<span>Due <strong>today</strong></span>}><button>Info</button></Tooltip>);
    const wrap = screen.getByText("Info").parentElement!;
    const bubble = wrap.querySelector(".oc-tooltip__content")!;
    expect(bubble.getAttribute("role")).toBe("tooltip");
    expect(wrap.getAttribute("aria-describedby")).toBe(bubble.id);
    expect(wrap.hasAttribute("data-tooltip")).toBe(false);
  });

  it("string content stays data-tooltip; controlled open toggles is-open/is-closed", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Tooltip content="Plain" open={false} onOpenChange={onOpenChange}><span>X</span></Tooltip>);
    const wrap = screen.getByText("X").parentElement!;
    expect(wrap.getAttribute("data-tooltip")).toBe("Plain");
    expect(wrap.className).toContain("is-closed");
    fireEvent.mouseEnter(wrap);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    rerender(<Tooltip content="Plain" open onOpenChange={onOpenChange}><span>X</span></Tooltip>);
    expect(wrap.className).toContain("is-open");
  });

  it("TooltipProvider sets the delay variable; uncontrolled tooltip has no state class", () => {
    render(<TooltipProvider delayDuration={300}><Tooltip content="Hi"><span>Y</span></Tooltip></TooltipProvider>);
    const provider = document.querySelector(".oc-tooltip-provider") as HTMLElement;
    expect(provider.style.getPropertyValue("--oc-tooltip-delay")).toBe("300ms");
    const wrap = screen.getByText("Y").parentElement!;
    expect(wrap.className).toBe("oc-tooltip");
  });
});

describe("BlockAppHeader overflow + search", () => {
  let observers: Array<() => void> = [];
  beforeEach(() => {
    observers = [];
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      cb: () => void;
      constructor(cb: () => void) { this.cb = cb; observers.push(cb); }
      observe() {}
      disconnect() {}
    };
  });

  it("fitNavItems: all fit, or as many as fit next to More", () => {
    expect(fitNavItems([50, 50, 50], 200, 40, 10)).toBe(3);
    expect(fitNavItems([50, 50, 50], 140, 40, 10)).toBe(1);
    expect(fitNavItems([50, 50, 50], 30, 40, 10)).toBe(0);
  });

  it("items that do not fit go into the More menu; More is current when the current page is hidden", () => {
    const width = (el: HTMLElement) => (el.hasAttribute("data-oc-nav-more") ? 60 : el.tagName === "LI" ? 80 : 0);
    const ow = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) { return width(this); });
    const cw = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.classList.contains("oc-block-appbar-nav") ? 240 : 0;
    });
    render(
      <BlockAppHeader
        overflow
        moreLabel="More"
        module="blue"
        nav={[
          { label: "Contacts", href: "/c" },
          { label: "Companies", href: "/co" },
          { label: "Segments", href: "/s" },
          { label: "Reports", href: "/r", current: true },
        ]}
        search={<input className="oc-input" type="search" aria-label="Search" />}
        actions={<button>U1</button>}
      />,
    );
    // 240 px: 2 items (80 + 80) + More (60) fit, 3 items + More do not.
    const hidden = document.querySelectorAll(".oc-block-appbar-nav li[data-oc-hidden]:not([data-oc-nav-more])");
    expect(hidden.length).toBe(2);
    const menu = document.querySelector(".oc-dropdown-menu")!;
    expect([...menu.querySelectorAll("a")].map((a) => a.textContent)).toEqual(["Segments", "Reports"]);
    const more = screen.getByRole("button", { name: /More/ });
    expect(more.getAttribute("aria-current")).toBe("page");
    expect(more.getAttribute("popovertarget")).toBe(menu.id);
    expect(document.querySelector(".oc-block-appbar")!.getAttribute("data-module")).toBe("blue");
    const search = document.querySelector(".oc-block-appbar-search")!;
    expect(search.nextElementSibling!.className).toBe("oc-block-appbar-actions");
    expect(search.previousElementSibling!.className).toContain("oc-block-appbar-nav");
    // Wider: everything fits, More is hidden again.
    cw.mockImplementation(function (this: HTMLElement) { return this.classList.contains("oc-block-appbar-nav") ? 1000 : 0; });
    act(() => observers.forEach((cb) => cb()));
    expect(document.querySelectorAll(".oc-block-appbar-nav li[data-oc-hidden]:not([data-oc-nav-more])").length).toBe(0);
    expect(document.querySelector("[data-oc-nav-more]")!.hasAttribute("data-oc-hidden")).toBe(true);
    ow.mockRestore();
    cw.mockRestore();
  });

  it("without overflow nothing changes (no More item)", () => {
    render(<BlockAppHeader nav={[{ label: "A", href: "/a" }]} />);
    expect(document.querySelector("[data-oc-nav-more]")).toBeNull();
    expect(document.querySelector(".oc-block-appbar-search")).toBeNull();
  });
});
