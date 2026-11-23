// File: packages/react/test/v0172.test.tsx
// Map: Dropdown radio group -> DataTable bulkActions + column width -> Button asChild
import { fireEvent, render } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown, DropdownItem, DropdownRadioGroup, DropdownRadioItem } from "../src/components/Dropdown";
import { DataTable } from "../src/components/DataTable";
import { Button } from "../src/components/Button";
import { Combobox } from "../src/components/Combobox";

describe("DropdownRadioGroup (0.17.2)", () => {
  it("checks the item with the group value (role menuitemradio) and reports a click", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Dropdown trigger="Sort by">
        <DropdownRadioGroup value="date" onValueChange={onValueChange}>
          <DropdownRadioItem value="name">Name</DropdownRadioItem>
          <DropdownRadioItem value="date">Date</DropdownRadioItem>
        </DropdownRadioGroup>
      </Dropdown>,
    );
    const group = container.querySelector('[role="group"]')!;
    const items = group.querySelectorAll('[role="menuitemradio"]');
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute("aria-checked")).toBe("false");
    expect(items[1].getAttribute("aria-checked")).toBe("true");
    expect(items[0].getAttribute("data-value")).toBe("name");
    expect(items[0].querySelector(".oc-dropdown-check")).not.toBeNull();
    fireEvent.click(items[0]);
    expect(onValueChange).toHaveBeenCalledWith("name");
  });

  it("works uncontrolled and controlled with state", () => {
    function Demo() {
      const [v, setV] = useState("a");
      return (
        <DropdownRadioGroup value={v} onValueChange={setV}>
          <DropdownRadioItem value="a">A</DropdownRadioItem>
          <DropdownRadioItem value="b">B</DropdownRadioItem>
        </DropdownRadioGroup>
      );
    }
    const { container } = render(<Demo />);
    const [a, b] = container.querySelectorAll("button");
    fireEvent.click(b);
    expect(b.getAttribute("aria-checked")).toBe("true");
    expect(a.getAttribute("aria-checked")).toBe("false");

    const un = render(
      <DropdownRadioGroup defaultValue="x">
        <DropdownRadioItem value="x">X</DropdownRadioItem>
        <DropdownRadioItem value="y">Y</DropdownRadioItem>
      </DropdownRadioGroup>,
    );
    const [, y] = un.container.querySelectorAll("button");
    fireEvent.click(y);
    expect(y.getAttribute("aria-checked")).toBe("true");
  });

  it("keeps a toggle menu open like a check item, keepOpen={false} closes it", () => {
    const { container } = render(
      <Dropdown mode="toggle" trigger="Sort" defaultOpen>
        <DropdownRadioGroup defaultValue="a">
          <DropdownRadioItem value="a">A</DropdownRadioItem>
          <DropdownRadioItem value="b" keepOpen={false}>B</DropdownRadioItem>
        </DropdownRadioGroup>
      </Dropdown>,
    );
    const wrap = container.querySelector(".oc-dropdown")!;
    const items = container.querySelectorAll('[role="menuitemradio"]');
    fireEvent.click(items[0]);
    expect(wrap.classList.contains("is-open")).toBe(true);
    fireEvent.click(items[1]);
    expect(wrap.classList.contains("is-open")).toBe(false);
  });

  it("the older DropdownItem radio checked still works", () => {
    const { container } = render(<DropdownItem radio checked>Old</DropdownItem>);
    const item = container.querySelector("button")!;
    expect(item.getAttribute("role")).toBe("menuitemradio");
    expect(item.getAttribute("aria-checked")).toBe("true");
  });
});

const columns = [
  { key: "name", header: "Name", minWidth: "12rem", truncate: "10rem" },
  { key: "amount", header: "Amount", numeric: true, width: "8rem" },
  { key: "code", header: "Code" },
];
const rows = [{ key: "1", cells: { name: "Company 1", amount: "10", code: "C1" } }];

describe("DataTable bulkActions and column width (0.17.2)", () => {
  it("keeps the built-in bar without bulkActions", () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    const keys = [...container.querySelectorAll(".oc-data-table-bulk [data-oc-bulk]")].map((b) => b.getAttribute("data-oc-bulk"));
    expect(keys).toEqual(["export", "duplicate", "archive", "restore", "delete", "clear"]);
    expect(container.querySelector('[data-oc-bulk="delete"]')!.className).toBe("oc-btn oc-btn--destructive oc-btn--sm");
  });

  it("adds, replaces and hides buttons; onBulk gets the custom key", () => {
    const onBulk = vi.fn();
    const { container } = render(
      <DataTable
        columns={columns}
        rows={rows}
        onBulk={onBulk}
        bulkActions={[
          { key: "remind", label: "Send reminder", icon: <svg data-testid="i" />, tone: "primary" },
          { key: "mark", label: "Mark paid", disabled: true },
          { key: "delete", label: "Remove", tone: "ghost" },
          { key: "duplicate", label: "", hidden: true },
        ]}
      />,
    );
    const bar = container.querySelector(".oc-data-table-bulk")!;
    const keys = [...bar.querySelectorAll("[data-oc-bulk]")].map((b) => b.getAttribute("data-oc-bulk"));
    expect(keys).toEqual(["export", "archive", "restore", "delete", "remind", "mark", "clear"]);
    const remind = bar.querySelector<HTMLButtonElement>('[data-oc-bulk="remind"]')!;
    expect(remind.className).toBe("oc-btn oc-btn--sm");
    expect(remind.querySelector("svg")).not.toBeNull();
    expect(remind.textContent).toBe("Send reminder");
    expect(bar.querySelector<HTMLButtonElement>('[data-oc-bulk="mark"]')!.disabled).toBe(true);
    const del = bar.querySelector('[data-oc-bulk="delete"]')!;
    expect(del.textContent).toBe("Remove");
    expect(del.className).toBe("oc-btn oc-btn--ghost oc-btn--sm");
    // a row selected -> the custom key goes to onBulk
    fireEvent.click(container.querySelector<HTMLInputElement>("[data-oc-select]")!);
    fireEvent.click(remind);
    expect(onBulk).toHaveBeenCalledWith("remind", ["1"]);
  });

  it("puts width and min-width on the th and keeps truncate", () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    const name = container.querySelector<HTMLElement>('th[data-oc-col="name"]')!;
    const amount = container.querySelector<HTMLElement>('th[data-oc-col="amount"]')!;
    expect(name.style.minWidth).toBe("12rem");
    expect(amount.style.width).toBe("8rem");
    expect(container.querySelector<HTMLElement>('th[data-oc-col="code"]')!.getAttribute("style")).toBeNull();
    expect(container.querySelector(".oc-data-table-truncate")!.getAttribute("title")).toBe("Company 1");
  });
});

describe("Button asChild (0.17.2)", () => {
  it("puts the button classes on the child, not a <button>", () => {
    const { container } = render(<Button asChild variant="outline" size="sm"><a href="/x" className="own">Open</a></Button>);
    expect(container.querySelector("button")).toBeNull();
    const a = container.querySelector("a")!;
    expect(a.className).toBe("oc-btn oc-btn--outline oc-btn--sm own");
    expect(a.getAttribute("href")).toBe("/x");
    expect(a.textContent).toBe("Open");
  });

  it("chains handlers, forwards the ref, disabled becomes aria-disabled and icons go around the label", () => {
    const ours = vi.fn();
    const theirs = vi.fn();
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <Button asChild ref={ref} disabled onClick={ours} iconStart={<svg data-x="start" />}>
        <a href="#y" onClick={theirs}>Go</a>
      </Button>,
    );
    const a = container.querySelector("a")!;
    expect(ref.current).toBe(a);
    expect(a.getAttribute("aria-disabled")).toBe("true");
    expect(a.firstElementChild!.getAttribute("data-x")).toBe("start");
    expect(a.textContent).toBe("Go");
    fireEvent.click(a);
    expect(theirs).toHaveBeenCalledTimes(1);
    expect(ours).toHaveBeenCalledTimes(1);
  });

  it("as keeps working", () => {
    const { container } = render(<Button as="a" href="/z" variant="ghost">Z</Button>);
    expect(container.querySelector("a")!.className).toBe("oc-btn oc-btn--ghost");
  });
});

describe("Combobox header trigger (0.17.2)", () => {
  const langs = [
    { value: "nl", label: "Nederlands", icon: <svg data-flag="nl" /> },
    { value: "en", label: "English", emoji: "E" },
  ];

  it("ghost + header: classes, list in the body by default, aria-label from triggerAriaLabel", () => {
    const { container } = render(<Combobox triggerVariant="ghost" size="header" label="Workspaces" triggerAriaLabel="Workspace" options={langs} defaultValue="nl" />);
    const wrap = container.querySelector(".oc-combobox")!;
    expect(wrap.className).toBe("oc-combobox oc-combobox--ghost oc-combobox--header");
    expect(container.querySelector("input")!.getAttribute("aria-label")).toBe("Workspace");
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    expect(document.body.querySelector(".oc-combobox-list--portal")).not.toBeNull();
  });

  it("portal={false} keeps the list inside; full is the default and adds nothing", () => {
    const a = render(<Combobox size="header" portal={false} options={langs} />);
    expect(a.container.querySelector(".oc-combobox-list")).not.toBeNull();
    const b = render(<Combobox options={langs} label="Language" />);
    expect(b.container.querySelector(".oc-combobox")!.className).toBe("oc-combobox");
    expect(b.container.querySelector("input")!.getAttribute("aria-label")).toBe("Language");
  });

  it("iconOnly: code first, else the chosen icon, else emoji, else dots; only with size=header", () => {
    const code = render(<Combobox size="header" iconOnly triggerLabel="NL" triggerAriaLabel="Language" options={langs} defaultValue="nl" />);
    expect(code.container.querySelector(".oc-combobox")!.classList.contains("oc-combobox--icon-only")).toBe(true);
    expect(code.container.querySelector(".oc-combobox-icon .oc-combobox-code")!.textContent).toBe("NL");
    const icon = render(<Combobox size="header" iconOnly options={langs} defaultValue="nl" />);
    expect(icon.container.querySelector('.oc-combobox-icon svg[data-flag="nl"]')).not.toBeNull();
    const emoji = render(<Combobox size="header" iconOnly options={langs} defaultValue="en" />);
    expect(emoji.container.querySelector(".oc-combobox-icon .oc-combobox-option-emoji")!.textContent).toBe("E");
    const dots = render(<Combobox size="header" iconOnly options={[{ value: "a", label: "A" }]} />);
    expect(dots.container.querySelector('.oc-combobox-icon svg[data-webicon="mdi:dots-horizontal"]')).not.toBeNull();
    const notHeader = render(<Combobox iconOnly options={langs} />);
    expect(notHeader.container.querySelector(".oc-combobox")!.classList.contains("oc-combobox--icon-only")).toBe(false);
  });

  it("works with the ledger variant and a module", () => {
    const { container } = render(<Combobox variant="ledger" triggerVariant="ghost" size="header" module="green" portal={false} options={langs} />);
    const wrap = container.querySelector(".oc-combobox")!;
    expect(wrap.className).toBe("oc-combobox oc-combobox--ledger oc-combobox--ghost oc-combobox--header");
    expect(wrap.getAttribute("data-module")).toBe("green");
  });
});
