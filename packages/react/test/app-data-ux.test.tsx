// File: packages/react/test/app-data-ux.test.tsx
// Map: data components (table actions, column menu, sortable row, tree, table compact, list toolbar, alpha tabs)
//   -> app UX components (top progress, confirm dialog, version banner, greeting, stat card, severity card,
//      upgrade banner, page header, accordion accent)
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AccordionAccent, AccordionItem, AlphaTabs, ColumnMenu, ConfirmDialog, Greeting, ListToolbar,
  PageHeader, SeverityCard, SortableRow, StatCard, TableActionIcon, TableActionsMenu, TableCompact, TopProgress,
  Tree, UpgradeBanner, VersionBanner, greetingTimeOfDay,
} from "../src";

describe("data components", () => {
  it("TableActionIcon renders a toned link or button with a name", () => {
    render(<><TableActionIcon label="Edit" href="/e">e</TableActionIcon><TableActionIcon label="Delete" tone="destructive">x</TableActionIcon></>);
    expect(screen.getByRole("link", { name: "Edit" })).toHaveClass("oc-table-actions-icon");
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("oc-table-actions-icon--destructive");
  });

  it("TableActionsMenu links the trigger to its popover", () => {
    const { container } = render(<TableActionsMenu label="Actions for Ada"><a className="oc-dropdown-item" href="#">View</a></TableActionsMenu>);
    const menu = container.querySelector(".oc-dropdown-menu")!;
    expect(menu).toHaveAttribute("popover");
    expect(screen.getByRole("button", { name: "Actions for Ada" })).toHaveAttribute("popovertarget", menu.id);
  });

  it("ColumnMenu numbers the checkboxes and locks columns", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <ColumnMenu columns={[{ label: "Name", locked: true }, { label: "Phone", visible: false }]} onColumnToggle={onToggle}><table className="oc-table" /></ColumnMenu>,
    );
    const boxes = container.querySelectorAll<HTMLInputElement>("input[data-col]");
    expect(boxes[0]).toBeDisabled();
    expect(boxes[1].checked).toBe(false);
    fireEvent.click(boxes[1]);
    expect(onToggle).toHaveBeenCalledWith(2, true);
  });

  it("SortableRow shows drag and drop states", () => {
    const { container } = render(<table><tbody><SortableRow gripLabel="Move Install" dragging drop="after"><td>Install</td></SortableRow></tbody></table>);
    const row = container.querySelector("tr")!;
    expect(row).toHaveClass("oc-sortable-row", "is-dragging", "is-drop-after");
    expect(row).toHaveAttribute("draggable", "true");
    expect(screen.getByRole("button", { name: "Move Install" })).toHaveClass("oc-sortable-row-grip");
  });

  it("Tree renders folders as details and marks the current leaf", () => {
    const { container } = render(<Tree aria-label="Projects" items={[{ label: "Kitchen", open: true, children: [{ label: "Quote", href: "/q", current: true }] }]} />);
    expect(container.querySelector("details.oc-tree-node")).toHaveAttribute("open");
    expect(screen.getByRole("link", { name: "Quote" })).toHaveAttribute("aria-current", "true");
  });

  it("TableCompact builds a table from columns and rows", () => {
    const { container } = render(<TableCompact columns={[{ key: "n", label: "Item" }, { key: "q", label: "Qty", numeric: true }]} rows={[{ n: "Sink", q: 1 }]} footer={{ n: "Total", q: 1 }} />);
    expect(container.firstChild).toHaveClass("oc-table-compact");
    expect(container.querySelector("tbody td[data-numeric]")).toHaveTextContent("1");
    expect(container.querySelector("tfoot")).toHaveTextContent("Total");
  });

  it("ListToolbar switches the view", () => {
    const onView = vi.fn();
    render(<ListToolbar aria-label="Products" views={[{ value: "cards", label: "Cards", icon: "c" }, { value: "table", label: "Table", icon: "t" }]} onViewChange={onView} />);
    fireEvent.click(screen.getByRole("radio", { name: "Table" }));
    expect(onView).toHaveBeenCalledWith("table");
  });

  it("AlphaTabs disables letters without entries and reports clicks", () => {
    const onChange = vi.fn();
    render(<AlphaTabs letters={["A", "B"]} available={["A"]} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "B" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onChange).toHaveBeenCalledWith("A");
  });
});

describe("app UX components", () => {
  it("TopProgress fades out and hides after active turns off", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<TopProgress aria-label="Loading" />);
    const bar = container.querySelector("progress")!;
    expect(bar).not.toHaveAttribute("hidden");
    rerender(<TopProgress aria-label="Loading" active={false} />);
    expect(bar).toHaveClass("is-done");
    act(() => { vi.advanceTimersByTime(500); });
    expect(bar).toHaveAttribute("hidden");
    vi.useRealTimers();
  });

  it("ConfirmDialog confirms and closes", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    const { container } = render(<ConfirmDialog defaultOpen title="Delete?" message="Gone." confirmLabel="Delete" onConfirm={onConfirm} onOpenChange={onOpenChange} />);
    expect(container.querySelector(".oc-alert-dialog--confirm")).toHaveClass("oc-alert-dialog--error");
    fireEvent.submit(container.querySelector("form")!);
    expect(onConfirm).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ConfirmDialog adds the typed field", () => {
    const { container } = render(<ConfirmDialog defaultOpen title="Delete?" confirmWord="DELETE" />);
    expect(container.querySelector(".oc-alert-dialog-typed input")).toHaveAttribute("pattern", "DELETE");
  });

  it("VersionBanner renders nothing without a version", () => {
    const { container, rerender } = render(<VersionBanner />);
    expect(container.firstChild).toBeNull();
    rerender(<VersionBanner version="v0.6.0" />);
    expect(screen.getByRole("status")).toHaveTextContent("v0.6.0");
  });

  it("Greeting picks the time of day", () => {
    expect(greetingTimeOfDay(new Date(2026, 9, 15, 8))).toBe("morning");
    expect(greetingTimeOfDay(new Date(2026, 9, 15, 14))).toBe("afternoon");
    expect(greetingTimeOfDay(new Date(2026, 9, 15, 22))).toBe("evening");
    const { container } = render(<Greeting name="Ada" date={new Date(2026, 9, 15, 21)} locale="en-GB" />);
    expect(container.firstChild).toHaveClass("oc-greeting--evening");
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-10-15");
  });

  it("StatCard becomes a link with href", () => {
    render(<StatCard value="7" label="Open orders" tone="accent" href="/orders" trend="+2" />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("oc-stat-card", "oc-stat-card--accent");
    expect(link.querySelector(".oc-stat-card-trend--up")).toHaveTextContent("+2");
  });

  it("SeverityCard shows the level and tags", () => {
    const { container } = render(<SeverityCard level="high" title="Leak" tags={["email"]} resolved>Body</SeverityCard>);
    expect(container.firstChild).toHaveClass("oc-severity-card--high", "is-resolved");
    expect(container.querySelector(".oc-severity-card-level")).toHaveTextContent("High");
  });

  it("UpgradeBanner shows usage and a dismiss button", () => {
    const onDismiss = vi.fn();
    const { container } = render(<UpgradeBanner title="Free plan" plan="Free" usage={{ label: "Projects", value: 4, max: 5 }} onDismiss={onDismiss} />);
    expect(container.querySelector("meter")).toHaveAttribute("value", "4");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("PageHeader renders the title at the chosen level", () => {
    render(<PageHeader title="Invoices" level={2} size="sm" actions={<button>New</button>} />);
    expect(screen.getByRole("heading", { level: 2, name: "Invoices" })).toHaveClass("oc-page-header-title");
  });

  it("AccordionAccent adds the accent and color classes", () => {
    const { container } = render(<AccordionAccent accent="violet" flush><AccordionItem title="One">1</AccordionItem></AccordionAccent>);
    expect(container.firstChild).toHaveClass("oc-accordion", "oc-accordion--accent", "oc-accent--violet", "oc-accordion--flush");
  });
});
