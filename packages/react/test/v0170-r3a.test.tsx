// File: packages/react/test/v0170-r3a.test.tsx
// Map: dropdown toggle mode -> dropdown item extras + sub-menu -> accordion script mode -> card parts + grid -> date picker / search webicons
// 0.17.0 (round 3, A): the last plain markup of the docs as components.

import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown, DropdownItem, DropdownSub } from "../src/components/Dropdown";
import { Accordion, AccordionItem } from "../src/components/Accordion";
import { Card, CardAction, CardContent, CardGrid, CardHeader, CardLink, CardText, CardTitle } from "../src/components/Card";
import { DatePicker } from "../src/components/DatePicker";
import { Search } from "../src/components/Search";

describe("Dropdown toggle mode", () => {
  it("renders .oc-dropdown without popover and toggles .is-open", () => {
    const { container } = render(
      <Dropdown mode="toggle" trigger="Options" id="m1">
        <DropdownItem>Profile</DropdownItem>
      </Dropdown>,
    );
    const box = container.querySelector(".oc-dropdown")!;
    const menu = container.querySelector(".oc-dropdown-menu")!;
    const btn = container.querySelector("button.oc-btn")!;
    expect(menu.hasAttribute("popover")).toBe(false);
    expect(menu.id).toBe("m1");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-controls")).toBe("m1");
    expect(btn.hasAttribute("popovertarget")).toBe(false);
    fireEvent.click(btn);
    expect(box.className).toBe("oc-dropdown is-open");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(container.querySelector(".oc-dropdown-item")!);
    expect(box.className).toBe("oc-dropdown");
  });

  it("closes on Esc and an outside click, and works controlled", () => {
    const onOpenChange = vi.fn();
    function Demo() {
      const [open, setOpen] = useState(true);
      return <Dropdown mode="toggle" trigger="Options" open={open} onOpenChange={(v) => { onOpenChange(v); setOpen(v); }}><DropdownItem>One</DropdownItem></Dropdown>;
    }
    const { container } = render(<Demo />);
    expect(container.querySelector(".oc-dropdown.is-open")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(container.querySelector(".oc-dropdown.is-open")).toBeNull();
    fireEvent.click(container.querySelector("button.oc-btn")!);
    expect(container.querySelector(".oc-dropdown.is-open")).not.toBeNull();
    fireEvent.pointerDown(document.body);
    expect(container.querySelector(".oc-dropdown.is-open")).toBeNull();
  });

  it("keeps the popover version unchanged by default", () => {
    const { container } = render(<Dropdown trigger="Options" id="m2"><DropdownItem>One</DropdownItem></Dropdown>);
    expect(container.querySelector(".oc-dropdown")).toBeNull();
    expect(container.querySelector(".oc-dropdown-menu")!.hasAttribute("popover")).toBe(true);
    expect(container.querySelector("button.oc-btn")!.getAttribute("popovertarget")).toBe("m2");
  });

  it("gives a custom trigger the toggle props", () => {
    const { container } = render(
      <Dropdown mode="toggle" renderTrigger={({ props, open }) => <button className="mine" {...props}>{open ? "Close" : "Open"}</button>}>
        <DropdownItem>One</DropdownItem>
      </Dropdown>,
    );
    const btn = container.querySelector("button.mine")!;
    fireEvent.click(btn);
    expect(btn.textContent).toBe("Close");
    expect(container.querySelector(".oc-dropdown")!.classList.contains("is-open")).toBe(true);
  });
});

describe("Dropdown item extras", () => {
  it("destructive, radio and a sub-menu", () => {
    const { container } = render(
      <Dropdown trigger="Menu">
        <DropdownItem checked radio>Top</DropdownItem>
        <DropdownItem checked={false}>Status bar</DropdownItem>
        <DropdownSub label="More tools" icon="mdi:magnify">
          <DropdownItem>Developer tools</DropdownItem>
        </DropdownSub>
        <DropdownItem destructive>Delete</DropdownItem>
      </Dropdown>,
    );
    const items = container.querySelectorAll(".oc-dropdown-menu > .oc-dropdown-item");
    expect(items[0].getAttribute("role")).toBe("menuitemradio");
    expect(items[0].getAttribute("aria-checked")).toBe("true");
    expect(items[1].getAttribute("role")).toBe("menuitemcheckbox");
    expect(items[2].className).toBe("oc-dropdown-item oc-dropdown-item--destructive");
    const sub = container.querySelector(".oc-dropdown-sub")!;
    const trigger = sub.querySelector(":scope > button")!;
    expect(trigger.className).toBe("oc-dropdown-item");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.textContent).toBe("More tools");
    expect(trigger.querySelector(".oc-dropdown-icon svg[data-webicon='mdi:magnify']")).not.toBeNull();
    const panel = sub.querySelector(":scope > .oc-dropdown-submenu")!;
    expect(panel.getAttribute("role")).toBe("menu");
    expect(panel.textContent).toBe("Developer tools");
  });
});

describe("Accordion script mode", () => {
  it("renders div + button with .is-open and reports the next state", () => {
    function Demo() {
      const [open, setOpen] = useState<number | null>(0);
      return (
        <Accordion>
          <AccordionItem title="One" expanded={open === 0} onExpandedChange={(v) => setOpen(v ? 0 : null)}>A</AccordionItem>
          <AccordionItem title="Two" expanded={false} disabled>B</AccordionItem>
          <AccordionItem title="Three" expanded={open === 2} onExpandedChange={(v) => setOpen(v ? 2 : null)}>C</AccordionItem>
        </Accordion>
      );
    }
    const { container } = render(<Demo />);
    const items = container.querySelectorAll(".oc-accordion > div.oc-accordion-item");
    expect(items).toHaveLength(3);
    expect(container.querySelector("details")).toBeNull();
    expect(items[0].className).toBe("oc-accordion-item is-open");
    const triggers = container.querySelectorAll("button.oc-accordion-trigger");
    expect(triggers[0].getAttribute("aria-expanded")).toBe("true");
    expect((triggers[1] as HTMLButtonElement).disabled).toBe(true);
    expect(triggers[1].hasAttribute("aria-expanded")).toBe(false);
    fireEvent.click(triggers[2]);
    expect(items[0].className).toBe("oc-accordion-item");
    expect(items[2].className).toBe("oc-accordion-item is-open");
    expect(items[2].querySelector(".oc-accordion-content")!.textContent).toBe("C");
  });

  it("stays a details element without expanded", () => {
    const { container } = render(<Accordion name="g"><AccordionItem title="One">A</AccordionItem></Accordion>);
    expect(container.querySelector("details.oc-accordion-item")!.getAttribute("name")).toBe("g");
  });
});

describe("Card parts and grid", () => {
  it("action, text and link", () => {
    const { container } = render(
      <Card>
        <CardHeader><CardTitle>Team</CardTitle><CardAction><span>3 / 5</span></CardAction></CardHeader>
        <CardContent><CardText>Two seats left.</CardText></CardContent>
        <CardLink href="/members">Manage members</CardLink>
      </Card>,
    );
    expect(container.querySelector(".oc-card-header > div.oc-card-action")!.textContent).toBe("3 / 5");
    expect(container.querySelector("p.oc-card-text")!.textContent).toBe("Two seats left.");
    const link = container.querySelector("a.oc-card-link")!;
    expect(link.getAttribute("href")).toBe("/members");
  });

  it("grid classes and custom properties", () => {
    const { container } = render(<CardGrid bands fit min={15} gap="1rem" className="w-full"><Card /></CardGrid>);
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.className).toBe("oc-card-grid oc-card-grid--bands oc-card-grid--fit w-full");
    expect(grid.style.getPropertyValue("--oc-card-min")).toBe("15rem");
    expect(grid.style.getPropertyValue("--oc-card-gap")).toBe("1rem");
    const plain = render(<CardGrid wide />).container.firstElementChild as HTMLElement;
    expect(plain.className).toBe("oc-card-grid oc-card-grid--wide");
    expect(plain.getAttribute("style")).toBeNull();
  });
});

describe("Built-in webicons in DatePicker and Search", () => {
  it("date picker draws mdi:calendar", () => {
    const { container } = render(<DatePicker />);
    const svg = container.querySelector("button.oc-date-picker-trigger > svg")!;
    expect(svg.getAttribute("data-webicon")).toBe("mdi:calendar");
    expect(svg.getAttribute("class")).toBe("oc-icon oc-icon--sm");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("search draws mdi:magnify", () => {
    const { container } = render(<Search placeholder="Search" />);
    const svg = container.querySelector("label.oc-search > svg")!;
    expect(svg.getAttribute("data-webicon")).toBe("mdi:magnify");
    expect(svg.getAttribute("class")).toBe("oc-search-icon");
  });
});
