// File: packages/react/test/v0180-misc.test.tsx
// Map: BackLink onBack + as -> Card bare -> ScrollArea bare -> Stepper isStepEnabled -> Command JSX children
//      -> DecimalInput rounding / integer / allowNegative -> PhoneInput country grouping -> TimeInput slotsPopover
//      -> Breadcrumb ellipsis + chevron as inline SVG
import { fireEvent, render } from "@testing-library/react";
import { forwardRef, useState } from "react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { BackLink } from "../src/components/BackLink";
import { Card, CardAction, CardHeader, CardTitle } from "../src/components/Card";
import { ScrollArea } from "../src/components/ScrollArea";
import { Stepper } from "../src/components/Stepper";
import { Command, CommandGroup, CommandItem } from "../src/components/Command";
import { DecimalInput, formatDecimal, parseDecimal, roundDecimal } from "../src/components/DecimalInput";
import { PhoneInput, formatPhoneNational, phoneGroups } from "../src/components/PhoneInput";
import { TimeInput } from "../src/components/TimeInput";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "../src/components/Breadcrumb";
import { Combobox } from "../src/components/Combobox";

describe("BackLink onBack + as (0.18.0)", () => {
  it("a plain click runs onBack instead of navigating", () => {
    const onBack = vi.fn();
    const { container } = render(<BackLink href="/products" onBack={onBack}>Back to Products</BackLink>);
    const a = container.querySelector("a.oc-back-link")!;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    a.dispatchEvent(event);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("ctrl, meta, shift and middle click keep the browser behaviour", () => {
    const onBack = vi.fn();
    const { container } = render(<BackLink href="#products" onBack={onBack}>Back</BackLink>);
    const a = container.querySelector("a")!;
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
      a.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(onBack).not.toHaveBeenCalled();
  });

  it("renders your own link component with `as`; its props fall through", () => {
    const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(function Link({ to, ...rest }, ref) {
      return <a ref={ref} data-router="yes" href={to} {...rest} />;
    });
    const { container } = render(<BackLink as={Link} to="/customers">Back to Customers</BackLink>);
    const a = container.querySelector("a")!;
    expect(a.className).toBe("oc-back-link");
    expect(a.getAttribute("data-router")).toBe("yes");
    expect(a.getAttribute("href")).toBe("/customers");
    expect(a.textContent).toBe("Back to Customers");
  });

  it("without onBack or fallbackHref it stays a plain link", () => {
    const { container } = render(<BackLink href="#x">Back</BackLink>);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    container.querySelector("a")!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("Card bare (0.18.0)", () => {
  it("adds oc-card--bare; CardAction stays in the header", () => {
    const { container } = render(
      <Card bare>
        <CardHeader><CardTitle>Customers</CardTitle><CardAction>3</CardAction></CardHeader>
      </Card>,
    );
    expect(container.firstElementChild!.className).toBe("oc-card oc-card--bare");
    expect(container.querySelector(".oc-card-header > .oc-card-action")!.textContent).toBe("3");
    const plain = render(<Card />);
    expect(plain.container.firstElementChild!.className).toBe("oc-card");
  });
});

describe("ScrollArea bare (0.18.0)", () => {
  it("adds oc-scroll-area--bare and keeps the region semantics", () => {
    const { container } = render(<ScrollArea bare label="Activity">x</ScrollArea>);
    const el = container.firstElementChild!;
    expect(el.className).toBe("oc-scroll-area oc-scroll-area--bare");
    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.getAttribute("role")).toBe("region");
  });
});

describe("Stepper isStepEnabled (0.18.0)", () => {
  const steps = [{ label: "Company" }, { label: "Invoicing" }, { label: "Banking" }, { label: "Team" }];

  it("default: done and active steps are enabled, later ones disabled", () => {
    const { container } = render(<Stepper steps={steps} current={1} />);
    const buttons = container.querySelectorAll("button");
    expect([...buttons].map((b) => b.disabled)).toEqual([false, false, true, true]);
    expect([...buttons].map((b) => b.getAttribute("aria-current"))).toEqual([null, "step", null, null]);
  });

  it("a later step can be enabled and clicked; aria-current stays on the active step", () => {
    const onStepChange = vi.fn();
    const { container } = render(<Stepper steps={steps} current={1} isStepEnabled={(i) => i !== 2} onStepChange={onStepChange} />);
    const buttons = container.querySelectorAll("button");
    expect([...buttons].map((b) => b.disabled)).toEqual([false, false, true, false]);
    fireEvent.click(buttons[3]);
    expect(onStepChange).toHaveBeenCalledWith(3);
    expect(buttons[3].getAttribute("aria-current")).toBeNull();
    expect(buttons[3].className).toBe("oc-stepper-item");
  });
});

describe("Command JSX children (0.18.0)", () => {
  it("renders groups and items from children, filters and selects with the keyboard", () => {
    const onSelect = vi.fn();
    const onNew = vi.fn();
    const { container } = render(
      <Command onSelect={onSelect}>
        <CommandGroup label="Invoices">
          <CommandItem value="new" shortcut="Ctrl N" onSelect={onNew}><strong>New</strong> invoice</CommandItem>
          <CommandItem value="list" keywords={["overview"]}>All invoices</CommandItem>
        </CommandGroup>
        <CommandGroup label="Customers">
          {["Customer 1", "Customer 2"].map((c) => <CommandItem key={c}>{c}</CommandItem>)}
        </CommandGroup>
      </Command>,
    );
    expect([...container.querySelectorAll(".oc-command-group-label")].map((l) => l.textContent)).toEqual(["Invoices", "Customers"]);
    const items = container.querySelectorAll(".oc-command-item");
    expect(items).toHaveLength(4);
    expect(items[0].querySelector("strong")!.textContent).toBe("New");
    expect(items[0].querySelector(".oc-command-shortcut")!.textContent).toBe("Ctrl N");
    expect(items[0].getAttribute("aria-selected")).toBe("true");

    const input = container.querySelector("input")!;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(items[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onNew).toHaveBeenCalledWith({ id: "new", label: "New invoice", shortcut: "Ctrl N" });
    expect(onSelect).toHaveBeenCalledWith({ id: "new", label: "New invoice", shortcut: "Ctrl N" });

    fireEvent.change(input, { target: { value: "overview" } });
    expect([...container.querySelectorAll(".oc-command-item")].filter((i) => !i.hidden).map((i) => i.textContent)).toEqual(["All invoices"]);
    fireEvent.click(container.querySelectorAll(".oc-command-item")[1]);
    expect(onSelect).toHaveBeenLastCalledWith({ id: "list", label: "All invoices", keywords: ["overview"] });
  });

  it("finds items in fragments, .map() and helper calls, but not inside an own wrapper component (docs: Items in your own component)", () => {
    const customers = [{ id: "c1", name: "Customer 1" }, { id: "c2", name: "Customer 2" }];
    const companies = [{ id: "co1", name: "Company 1" }];
    function CustomerItem({ id, name }: { id: string; name: string }) {
      return <CommandItem value={id}>{name}</CommandItem>;
    }
    const rowItem = (r: { id: string; name: string }) => <CommandItem key={r.id} value={r.id}>{r.name}</CommandItem>;
    const labels = (el: HTMLElement) => [...el.querySelectorAll(".oc-command-item")].map((i) => i.textContent);

    const wrong = render(
      <Command>
        <CommandGroup label="Invoices"><CommandItem value="new">New invoice</CommandItem></CommandGroup>
        <CommandGroup label="Customers">{customers.map((c) => <CustomerItem key={c.id} {...c} />)}</CommandGroup>
      </Command>,
    );
    expect(labels(wrong.container)).toEqual(["New invoice"]);

    const show = true;
    const right = render(
      <Command>
        <>
          <CommandGroup label="Invoices"><>{show && <CommandItem value="new">New invoice</CommandItem>}</></CommandGroup>
        </>
        <CommandGroup label="Customers">{customers.map((c) => <CommandItem key={c.id} value={c.id}>{c.name}</CommandItem>)}</CommandGroup>
        <CommandGroup label="Companies">{companies.map(rowItem)}</CommandGroup>
      </Command>,
    );
    expect(labels(right.container)).toEqual(["New invoice", "Customer 1", "Customer 2", "Company 1"]);
  });

  it("data groups still pass the same object to onSelect", () => {
    const item = { id: "a", label: "Alpha" };
    const onSelect = vi.fn();
    const { container } = render(<Command groups={[{ items: [item] }]} onSelect={onSelect} />);
    fireEvent.click(container.querySelector(".oc-command-item")!);
    expect(onSelect.mock.calls[0][0]).toBe(item);
  });
});

describe("DecimalInput rounding, integer, allowNegative (0.18.0)", () => {
  it("rounds half away from zero on the visible digits", () => {
    expect(roundDecimal(1.005, 2)).toBe(1.01);
    expect(roundDecimal(2.675, 2)).toBe(2.68);
    expect(roundDecimal(-1.005, 2)).toBe(-1.01);
    expect(roundDecimal(1.004, 2)).toBe(1);
    expect(roundDecimal(2.5, 0)).toBe(3);
    expect(roundDecimal(1e-7, 2)).toBe(0);
    expect(formatDecimal(1.005, "nl-BE", 2)).toBe("1,01");
    expect(formatDecimal(2.675, "nl-BE", 2)).toBe("2,68");
    expect(formatDecimal(1234.5, "nl-BE", 2)).toBe("1.234,50");
    expect(parseDecimal("1.234,56", "nl-BE")).toBe(1234.56);
    expect(parseDecimal("-12,5", "nl-BE")).toBe(-12.5);
  });

  it("reports the rounded value and shows it after blur", () => {
    const onValueChange = vi.fn();
    const { container } = render(<DecimalInput locale="nl-BE" onValueChange={onValueChange} />);
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "2,675" } });
    expect(onValueChange).toHaveBeenLastCalledWith(2.68);
    fireEvent.blur(input);
    expect(input.value).toBe("2,68");
    fireEvent.change(input, { target: { value: "1,005" } });
    expect(onValueChange).toHaveBeenLastCalledWith(1.01);
    fireEvent.blur(input);
    expect(input.value).toBe("1,01");
  });

  it("integer: no decimals, numeric keypad, the decimal mark is dropped", () => {
    const onValueChange = vi.fn();
    const { container } = render(<DecimalInput integer onValueChange={onValueChange} />);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("inputmode")).toBe("numeric");
    fireEvent.change(input, { target: { value: "12,7" } });
    expect(input.value).toBe("127");
    expect(onValueChange).toHaveBeenLastCalledWith(127);
    fireEvent.blur(input);
    expect(input.value).toBe("127");
  });

  it("allowNegative false drops the minus sign; the default keeps it", () => {
    const off = vi.fn();
    const a = render(<DecimalInput allowNegative={false} onValueChange={off} />);
    const input = a.container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "-5,25" } });
    expect(input.value).toBe("5,25");
    expect(off).toHaveBeenLastCalledWith(5.25);
    const on = vi.fn();
    const b = render(<DecimalInput onValueChange={on} />);
    fireEvent.change(b.container.querySelector("input")!, { target: { value: "-5,25" } });
    expect(on).toHaveBeenLastCalledWith(-5.25);
  });
});

describe("PhoneInput country grouping (0.18.0)", () => {
  it("formatPhoneNational groups per country; without one it keeps 3 + pairs", () => {
    expect(formatPhoneNational("470123456")).toBe("470 12 34 56");
    expect(formatPhoneNational("470123456", { format: "### ## ## ##" })).toBe("470 12 34 56");
    expect(formatPhoneNational("612345678", { format: "# ## ## ## ##" })).toBe("6 12 34 56 78");
    expect(formatPhoneNational("15123456789", { groups: [3, 4, 4] })).toBe("151 2345 6789");
    expect(formatPhoneNational("1234567890123", { groups: [3, 4] })).toBe("123 4567 89 01 23");
    expect(phoneGroups({ format: "## ###" })).toEqual([2, 3]);
  });

  it("shows the number in the grouping of the chosen country", () => {
    function Demo() {
      const [v, setV] = useState("+31612345678");
      return <PhoneInput value={v} onChange={setV} />;
    }
    const { container } = render(<Demo />);
    const input = container.querySelector<HTMLInputElement>(".oc-phone-input-number")!;
    expect(input.value).toBe("6 12 34 56 78");
    fireEvent.change(container.querySelector("select")!, { target: { value: "+32" } });
    expect(input.value).toBe("612 34 56 78");
  });
});

describe("TimeInput slotsPopover (0.18.0)", () => {
  it("puts the slots in a native popover; a picked slot fills the field", () => {
    const onChange = vi.fn();
    const { container } = render(<TimeInput slots={["09:00", "09:30"]} slotsPopover defaultValue="09:00" onChange={onChange} />);
    const root = container.querySelector(".oc-time-picker")!;
    const input = root.querySelector<HTMLInputElement>("input.oc-time-input")!;
    expect(input.getAttribute("list")).toBeNull();
    expect(container.querySelector("datalist")).toBeNull();
    const button = root.querySelector("button")!;
    const panel = root.querySelector(".oc-popover")!;
    expect(button.getAttribute("popovertarget")).toBe(panel.id);
    expect(panel.getAttribute("popover")).toBe("auto");
    const radios = panel.querySelectorAll<HTMLInputElement>(".oc-time-slots input[type=radio]");
    expect(radios).toHaveLength(2);
    expect(radios[0].checked).toBe(true);
    fireEvent.click(radios[1]);
    expect(onChange).toHaveBeenLastCalledWith("09:30");
    expect(input.value).toBe("09:30");
    // typing still works
    fireEvent.change(input, { target: { value: "1015" } });
    expect(input.value).toBe("10:15");
  });

  it("without slotsPopover the datalist stays", () => {
    const { container } = render(<TimeInput slots={["09:00"]} />);
    expect(container.querySelector("datalist option")!.getAttribute("value")).toBe("09:00");
    expect(container.querySelector(".oc-time-picker")).toBeNull();
  });
});

describe("Breadcrumb icons as inline SVG (0.18.0)", () => {
  it("ellipsis and chevron separator draw an SVG without iconify-icon", () => {
    const { container } = render(
      <Breadcrumb separator="chevron">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbEllipsis items={[{ label: "Customers", href: "/c" }]} /></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(container.querySelector("iconify-icon")).toBeNull();
    expect(container.querySelectorAll('svg[data-webicon="mdi:dots-horizontal"]')).toHaveLength(2);
    expect(container.querySelector('.oc-breadcrumb-separator svg[data-webicon="mdi:chevron-right"]')).not.toBeNull();
  });
});

describe("0.18.0 Combobox rows", () => {
  it("renders the clear, option and custom rows without a React key warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const { container } = render(
        <Combobox options={[{ value: "a", label: "Customer 1" }, { value: "b", label: "Customer 2" }]} clearLabel="None" allowCustomFromSearch />,
      );
      const input = container.querySelector(".oc-combobox-input") as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "Customer" } });
      expect(container.querySelector(".oc-combobox-clear")).not.toBeNull();
      expect(container.querySelector(".oc-combobox-custom")).not.toBeNull();
      expect(container.querySelectorAll(".oc-combobox-option:not(.oc-combobox-clear):not(.oc-combobox-custom)")).toHaveLength(2);
      const keyWarnings = error.mock.calls.filter((args) => args.some((a) => typeof a === "string" && /\bkey\b/.test(a)));
      expect(keyWarnings).toEqual([]);
    } finally {
      error.mockRestore();
    }
  });
});
