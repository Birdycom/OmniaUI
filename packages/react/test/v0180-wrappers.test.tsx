// File: packages/react/test/v0180-wrappers.test.tsx
// Map: MeterList (variants + live) -> StatCardGrid -> FormGroup (legacy) - wrappers for markup that was a plain div before
//      -> Command JSX row content: mixed text in one span, a leading icon stays its own flex item
import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { MeterList, MeterRow } from "../src/components/MeterRow";
import { StatCard, StatCardGrid } from "../src/components/StatCard";
import { FormGroup } from "../src/components/FormField";
import { Command, CommandItem } from "../src/components/Command";
import { addWebicons, Webicon } from "../src/components/Webicon";
import * as api from "../src";

describe("MeterList (0.18.0)", () => {
  it("renders .oc-meter-list with its rows, extra class, rest props and ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <MeterList ref={ref} className="mt-2" data-x="1">
        <MeterRow label="Session" percent={40} />
        <MeterRow label="Week" percent={80} />
      </MeterList>,
    );
    const list = container.firstElementChild as HTMLDivElement;
    expect(list.className).toBe("oc-meter-list mt-2");
    expect(list.dataset.x).toBe("1");
    expect(list.querySelectorAll(".oc-meter-row")).toHaveLength(2);
    expect(ref.current).toBe(list);
  });

  it.each(["compact", "dense", "live"] as const)("variant %s adds its modifier", (variant) => {
    const { container } = render(<MeterList variant={variant} />);
    expect(container.firstElementChild!.className).toBe(`oc-meter-list oc-meter-list--${variant}`);
  });

  it("live combines with another variant and is not doubled", () => {
    const { container } = render(<MeterList variant="dense" live />);
    expect(container.firstElementChild!.className).toBe("oc-meter-list oc-meter-list--dense oc-meter-list--live");
    const { container: c2 } = render(<MeterList variant="live" live />);
    expect(c2.firstElementChild!.className).toBe("oc-meter-list oc-meter-list--live");
    const { container: c3 } = render(<MeterList live />);
    expect(c3.firstElementChild!.className).toBe("oc-meter-list oc-meter-list--live");
  });
});

describe("StatCardGrid", () => {
  it("renders .oc-stat-card-grid with cards, class and ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <StatCardGrid ref={ref} className="mb-4">
        <StatCard value="12" label="Open invoices" />
        <StatCard value="3" label="Overdue" />
      </StatCardGrid>,
    );
    const grid = container.firstElementChild as HTMLDivElement;
    expect(grid.className).toBe("oc-stat-card-grid mb-4");
    expect(grid.querySelectorAll(".oc-stat-card")).toHaveLength(2);
    expect(ref.current).toBe(grid);
  });
});

describe("FormGroup (0.18.0, legacy)", () => {
  it("renders .oc-form-group with children, class, rest props and ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <FormGroup ref={ref} className="mb-0" id="g1">
        <label className="oc-label" htmlFor="name">Name</label>
        <input id="name" className="oc-input" />
      </FormGroup>,
    );
    const group = container.firstElementChild as HTMLDivElement;
    expect(group.className).toBe("oc-form-group mb-0");
    expect(group.id).toBe("g1");
    expect(group.querySelector("input.oc-input")).not.toBeNull();
    expect(ref.current).toBe(group);
  });
});

describe("exports", () => {
  it("MeterList, StatCardGrid and FormGroup come from the package index", () => {
    expect(api.MeterList).toBe(MeterList);
    expect(api.StatCardGrid).toBe(StatCardGrid);
    expect(api.FormGroup).toBe(FormGroup);
  });
});

describe("Command row content (0.18.0 QA)", () => {
  addWebicons({ "mdi:file-document-outline": "M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2" });
  const row = (ui: JSX.Element) => render(<Command>{ui}</Command>).container.querySelector("li.oc-command-item")!;

  it("puts mixed text (<strong>New</strong> invoice) in one span so the row gap does not split it", () => {
    const li = row(<CommandItem value="new" shortcut="Ctrl N"><strong>New</strong> invoice</CommandItem>);
    const first = li.firstElementChild!;
    expect(first.tagName).toBe("SPAN");
    expect(first.innerHTML).toBe("<strong>New</strong> invoice");
    expect(li.querySelector(".oc-command-shortcut")!.textContent).toBe("Ctrl N");
  });

  it("keeps a leading icon outside the text span", () => {
    const li = row(<CommandItem><Webicon name="mdi:file-document-outline" /> <strong>New</strong> invoice</CommandItem>);
    expect(li.firstElementChild!.tagName.toLowerCase()).toBe("svg");
    const span = li.children[1];
    expect(span.tagName).toBe("SPAN");
    expect(span.textContent).toBe(" New invoice");
  });

  it("leaves an icon with one text node and plain text as they were", () => {
    const li = row(<CommandItem><svg className="icon" aria-hidden="true" /> New invoice</CommandItem>);
    expect(li.children[0].tagName.toLowerCase()).toBe("svg");
    expect(li.querySelectorAll("span")).toHaveLength(0);
    expect(li.textContent).toBe(" New invoice");
    const plain = row(<CommandItem>All invoices</CommandItem>);
    expect(plain.innerHTML).toBe("All invoices");
  });

  it("looks inside a fragment", () => {
    const li = row(<CommandItem><><strong>New</strong> invoice</></CommandItem>);
    expect(li.firstElementChild!.innerHTML).toBe("<strong>New</strong> invoice");
  });
});
