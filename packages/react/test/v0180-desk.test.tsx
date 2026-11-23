// File: packages/react/test/v0180-desk.test.tsx
// Map: Badge status set + readonly -> Breadcrumb maxItems + compound parts -> DecimalInput currency / percent ->
//      Barcode fallback + exports -> OtpInput active cell + onComplete from a controlled value -> app header searchCollapse

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { Badge, badgeStatuses } from "../src/components/Badge";
import {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, collapseBreadcrumb,
} from "../src/components/Breadcrumb";
import { DecimalInput, currencyAffix } from "../src/components/DecimalInput";
import { Barcode, encodeBarcode, guessFormat } from "../src/components/Barcode";
import { OtpInput } from "../src/components/OtpInput";
import { BlockAppHeader } from "../src/blocks/BlockAppHeader";

describe("0.18.0 status badges", () => {
  it("status sets the class, data-status, its icon and its label", () => {
    const { container } = render(<Badge status="paid" />);
    const b = container.querySelector("span.oc-badge")!;
    expect(b.className).toBe("oc-badge oc-badge--status");
    expect(b.getAttribute("data-status")).toBe("paid");
    expect(b.textContent).toBe("Paid");
    expect(b.querySelector("svg, iconify-icon")).not.toBeNull();
    expect(b.getAttribute("role")).toBeNull();
  });

  it("children translate the label, icon replaces or hides the icon", () => {
    const { container } = render(<><Badge status="overdue">Vervallen</Badge><Badge status="draft" icon={false} /><Badge status="sent" icon="mdi:email-outline" /></>);
    const [a, b, c] = container.querySelectorAll("span.oc-badge");
    expect(a.textContent).toBe("Vervallen");
    expect(b.querySelector("svg, iconify-icon")).toBeNull();
    expect(b.textContent).toBe("Draft");
    expect(c.querySelector("[icon='mdi:email-outline'], svg")).not.toBeNull();
  });

  it("every status of the set has a label and a webicon; an unknown status only sets data-status", () => {
    for (const [name, s] of Object.entries(badgeStatuses)) {
      expect(s.label, name).toBeTruthy();
      expect(s.icon.startsWith("mdi:"), name).toBe(true);
    }
    expect(Object.keys(badgeStatuses)).toEqual(expect.arrayContaining(["paid", "pending", "overdue", "draft", "sent", "cancelled", "approved", "rejected", "active", "inactive", "archived", "failed", "refunded", "scheduled", "in-progress", "done", "read-only"]));
    const { container } = render(<Badge status="on-hold">On hold</Badge>);
    const b = container.querySelector("span")!;
    expect(b.getAttribute("data-status")).toBe("on-hold");
    expect(b.querySelector("svg, iconify-icon")).toBeNull();
  });

  it("variant readonly wraps the text so it can be cut off", () => {
    const { container } = render(<Badge variant="readonly" icon="mdi:account-outline" title="Customer 1">Customer 1</Badge>);
    const b = container.querySelector("span.oc-badge")!;
    expect(b.className).toBe("oc-badge oc-badge--readonly");
    expect(b.querySelector(":scope > span")!.textContent).toBe("Customer 1");
  });
});

describe("0.18.0 breadcrumb", () => {
  const trail = [
    { label: "Dashboard", href: "/" },
    { label: "Relations", href: "/relations" },
    { label: "Customers", href: "/customers" },
    { label: "Company 1", href: "/customers/1" },
    { label: "Projects", href: "/customers/1/projects" },
    { label: "Kitchen" },
  ];

  it("collapseBreadcrumb keeps the first and the last levels", () => {
    expect(collapseBreadcrumb(trail, 4)?.map((p) => p.length)).toEqual([1, 3, 2]);
    expect(collapseBreadcrumb(trail, 6)).toBeNull();
    expect(collapseBreadcrumb(trail)).toBeNull();
    expect(collapseBreadcrumb(trail, 3, 1, 1)?.map((p) => p.length)).toEqual([1, 4, 1]);
  });

  it("maxItems folds the middle into a … button with a menu of the hidden levels", () => {
    const { container } = render(<Breadcrumb items={trail} maxItems={4} separator="chevron" />);
    const items = container.querySelectorAll("nav > .oc-breadcrumb-item");
    expect(items).toHaveLength(4);
    const button = screen.getByRole("button", { name: "Show 3 more levels" });
    expect(button.className).toBe("oc-breadcrumb-ellipsis");
    const menu = container.querySelector(`#${button.getAttribute("popovertarget")}`)!;
    expect(menu.getAttribute("popover")).toBe("auto");
    expect([...menu.querySelectorAll("a.oc-dropdown-item")].map((a) => a.textContent)).toEqual(["Relations", "Customers", "Company 1"]);
    expect(items[3].getAttribute("aria-current")).toBe("page");
    expect(items[3].textContent).toBe("Kitchen");
    expect(items[2].getAttribute("href")).toBe("/customers/1/projects");
  });

  it("compound parts: list items, link with asChild, page, separator and ellipsis", () => {
    const { container } = render(
      <Breadcrumb separator="chevron">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/" icon="mdi:home-outline">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbEllipsis items={[{ label: "Customers", href: "/customers" }]} label="More ({count})" /></BreadcrumbItem>
          <BreadcrumbSeparator>|</BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink asChild><a href="/projects" data-router="">Projects</a></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem><BreadcrumbPage>Kitchen</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    const nav = container.querySelector("nav.oc-breadcrumb.oc-breadcrumb--chevron")!;
    expect(nav.getAttribute("aria-label")).toBe("Breadcrumb");
    const lis = nav.querySelectorAll("ol > li");
    expect(lis).toHaveLength(6);
    expect(lis[1].className).toBe("oc-breadcrumb-separator");
    expect(lis[1].getAttribute("aria-hidden")).toBe("true");
    expect(lis[1].querySelector("svg, iconify-icon")).not.toBeNull();
    expect(lis[3].textContent).toBe("|");
    expect(screen.getByRole("button", { name: "More (1)" })).toBeTruthy();
    expect(screen.getByText("Projects").getAttribute("data-router")).toBe("");
    expect(screen.getByText("Kitchen").getAttribute("aria-current")).toBe("page");
  });

  it("items without a list are spans; an ellipsis without items is only a mark", () => {
    const { container } = render(<Breadcrumb><BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem></Breadcrumb>);
    expect(container.querySelector("nav > span.oc-breadcrumb-item > span.oc-breadcrumb-ellipsis")!.getAttribute("aria-label")).toBe("More levels");
    expect(container.querySelector("button")).toBeNull();
  });
});

describe("0.18.0 DecimalInput currency and percent", () => {
  it("currencyAffix reads the symbol, its side and the decimals from the locale", () => {
    expect(currencyAffix("nl-BE", "EUR")).toEqual({ symbol: "€", before: true, decimals: 2 });
    expect(currencyAffix("fr-BE", "EUR").before).toBe(false);
    expect(currencyAffix("nl-BE", "JPY").decimals).toBe(0);
  });

  it("currency EUR: € before the value in the affix frame, nl-BE notation", () => {
    const onValueChange = vi.fn();
    const { container } = render(<DecimalInput currency="EUR" defaultValue={1234.5} onValueChange={onValueChange} aria-label="Amount" />);
    const group = container.querySelector(".oc-input-group.oc-input-group--affix")!;
    expect(group.getAttribute("data-currency")).toBe("EUR");
    expect(group.firstElementChild!.className).toBe("oc-input-addon");
    expect(group.firstElementChild!.textContent).toBe("€");
    const input = screen.getByLabelText("Amount") as HTMLInputElement;
    expect(input.className).toBe("oc-input oc-decimal-input");
    expect(input.value).toBe("1.234,50");
    fireEvent.change(input, { target: { value: "99,95" } });
    expect(onValueChange).toHaveBeenLastCalledWith(99.95);
  });

  it("percent: % after the value; decimals still win", () => {
    const { container } = render(<DecimalInput percent defaultValue={21} decimals={1} aria-label="VAT" />);
    const group = container.querySelector(".oc-input-group--affix")!;
    expect(group.lastElementChild!.textContent).toBe("%");
    expect((screen.getByLabelText("VAT") as HTMLInputElement).value).toBe("21,0");
  });

  it("error marks the frame", () => {
    const { container } = render(<DecimalInput currency="EUR" error aria-label="Amount" />);
    expect(container.querySelector(".oc-input-group--error")).not.toBeNull();
    expect(screen.getByLabelText("Amount").getAttribute("aria-invalid")).toBe("true");
  });
});

describe("0.18.0 Barcode fallback", () => {
  it("draws a wrong check digit as Code 128 with fallback, else shows the error", () => {
    const { container } = render(<><Barcode value="4006381333932" fallback="code128" /><Barcode value="4006381333932" /></>);
    const [a, b] = container.querySelectorAll("figure");
    expect(a.hasAttribute("data-fallback-used")).toBe(true);
    expect(a.querySelector("svg")).not.toBeNull();
    expect(b.hasAttribute("data-error")).toBe(true);
  });

  it("exports the encoder; 12 digits with a UPC check digit are UPC-A", () => {
    expect(guessFormat("036000291452")).toBe("UPC");
    expect(encodeBarcode("4006381333932", "auto", { fallback: "code128" }).format).toBe("CODE128");
  });
});

describe("0.18.0 OtpInput", () => {
  it("marks the active cell while it has focus", () => {
    render(<OtpInput aria-label="Code" defaultValue="12" />);
    const input = screen.getByLabelText("Code") as HTMLInputElement;
    act(() => { input.focus(); input.setSelectionRange(2, 2); });
    fireEvent.keyUp(input);
    expect(input.getAttribute("data-otp-active")).toBe("2");
    act(() => input.blur());
    expect(input.hasAttribute("data-otp-active")).toBe(false);
  });

  it("onComplete also runs when a controlled value arrives complete from outside, once per code", () => {
    const onComplete = vi.fn();
    function Host() {
      const [code, setCode] = useState("");
      return (
        <>
          <OtpInput aria-label="Code" value={code} onChange={setCode} onComplete={onComplete} />
          <button type="button" onClick={() => setCode("123456")}>Fill</button>
          <button type="button" onClick={() => setCode("")}>Clear</button>
        </>
      );
    }
    render(<Host />);
    fireEvent.click(screen.getByText("Fill"));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenLastCalledWith("123456");
    fireEvent.click(screen.getByText("Fill"));
    expect(onComplete).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Clear"));
    fireEvent.change(screen.getByLabelText("Code"), { target: { value: "123456" } });
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("a complete controlled value on mount counts, a complete defaultValue does not", () => {
    const a = vi.fn();
    const b = vi.fn();
    render(<><OtpInput aria-label="A" value="654321" onChange={() => {}} onComplete={a} /><OtpInput aria-label="B" defaultValue="654321" onComplete={b} /></>);
    expect(a).toHaveBeenCalledWith("654321");
    expect(b).not.toHaveBeenCalled();
  });
});

describe("0.18.0 app header search collapse", () => {
  it("searchCollapse adds the modifier to the search slot", () => {
    const { container, rerender } = render(<BlockAppHeader search={<input className="oc-input" type="search" aria-label="Search" />} searchCollapse />);
    expect(container.querySelector(".oc-block-appbar-search")!.className).toBe("oc-block-appbar-search oc-block-appbar-search--collapse");
    rerender(<BlockAppHeader search={<input className="oc-input" type="search" aria-label="Search" />} />);
    expect(container.querySelector(".oc-block-appbar-search")!.className).toBe("oc-block-appbar-search");
  });
});
