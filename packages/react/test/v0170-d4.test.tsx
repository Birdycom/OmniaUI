// File: packages/react/test/v0170-d4.test.tsx
// Map: SidebarProvider (persist, controlled, trigger, rail, mobile overlay via a matchMedia mock, shortcut, useSidebar) ->
//      SidebarInset / MenuAction / MenuBadge / MenuSub -> DataTable server mode (no local slice, controlled sort, page
//      callback, trashed, debounced search, query, skeleton rows, empty state, column chooser, selection over pages)

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import {
  Sidebar,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "../src/components/Sidebar";
import { DataTable } from "../src/components/DataTable";
import type { DataTableQuery, DataTableRow, DataTableSort, DataTableTrashed } from "../src/components/DataTable";

/* ------------------------------------------------------------------ matchMedia mock */

let narrow = false;
const mediaListeners = new Set<() => void>();
beforeEach(() => {
  narrow = false;
  mediaListeners.clear();
  window.localStorage.clear();
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() { return narrow; },
    addEventListener: (_: string, fn: () => void) => mediaListeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => mediaListeners.delete(fn),
  })) as unknown as typeof window.matchMedia;
});
afterEach(() => vi.useRealTimers());
const setNarrow = (on: boolean) => act(() => { narrow = on; mediaListeners.forEach((fn) => fn()); });

function Shell(props: Partial<React.ComponentProps<typeof SidebarProvider>>) {
  return (
    <SidebarProvider {...props}>
      <Sidebar aria-label="Main">
        <SidebarGroup label="Main">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" current>Home</SidebarMenuButton>
              <SidebarMenuAction label="More" showOnHover />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <SidebarTrigger />
        <p>Page</p>
      </SidebarInset>
    </SidebarProvider>
  );
}
const aside = () => document.querySelector("aside.oc-sidebar")!;
const trigger = () => document.querySelector<HTMLButtonElement>("button.oc-sidebar-trigger")!;
const provider = () => document.querySelector(".oc-sidebar-provider")!;

describe("0.17.0 sidebar provider", () => {
  it("renders the parts with their classes", () => {
    render(<Shell />);
    expect(provider()).toHaveAttribute("data-state", "expanded");
    expect(document.querySelector("main.oc-sidebar-inset")).toBeTruthy();
    expect(document.querySelector("button.oc-sidebar-rail")).toHaveAttribute("data-oc-sidebar-rail");
    const trigger = screen.getByRole("button", { name: "Toggle sidebar", expanded: true });
    expect(trigger).toHaveClass("oc-sidebar-trigger");
    expect(trigger.querySelector('svg[data-webicon="mdi:menu"]')).toBeTruthy();
    const action = screen.getByRole("button", { name: "More" });
    expect(action).toHaveClass("oc-sidebar-menu-action", "oc-sidebar-menu-action--hover");
  });

  it("trigger and rail toggle; persist remembers it", () => {
    render(<Shell persist="app" />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar", expanded: true }));
    expect(aside()).toHaveClass("oc-sidebar--collapsed");
    expect(provider()).toHaveAttribute("data-state", "collapsed");
    expect(window.localStorage.getItem("oc-sidebar:app")).toBe("1");
    fireEvent.click(document.querySelector(".oc-sidebar-rail")!);
    expect(aside()).not.toHaveClass("oc-sidebar--collapsed");
    expect(window.localStorage.getItem("oc-sidebar:app")).toBe("0");
  });

  it("reads the remembered state after mounting", () => {
    window.localStorage.setItem("oc-sidebar:app", "1");
    render(<Shell persist="app" />);
    expect(aside()).toHaveClass("oc-sidebar--collapsed");
  });

  it("cookie storage", () => {
    document.cookie = "oc-sidebar-ck=; max-age=0; path=/";
    render(<Shell persist="ck" storage="cookie" />);
    fireEvent.click(trigger());
    expect(document.cookie).toMatch(/oc-sidebar-ck=1/);
  });

  it("controlled: collapsed + onCollapsedChange", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Shell collapsed={false} onCollapsedChange={onChange} />);
    fireEvent.click(trigger());
    expect(onChange).toHaveBeenCalledWith(true);
    expect(aside()).not.toHaveClass("oc-sidebar--collapsed");
    rerender(<Shell collapsed onCollapsedChange={onChange} />);
    expect(aside()).toHaveClass("oc-sidebar--collapsed");
  });

  it("a Sidebar's own collapsed prop wins over the provider", () => {
    render(<SidebarProvider defaultCollapsed><Sidebar collapsed={false}>x</Sidebar></SidebarProvider>);
    expect(aside()).not.toHaveClass("oc-sidebar--collapsed");
  });

  it("mobile: overlay, closed at first, Escape and a click outside close it, the trigger does not fight", () => {
    narrow = true;
    render(<Shell persist="m" />);
    expect(aside()).toHaveClass("oc-sidebar--overlay", "oc-sidebar--collapsed");
    expect(provider()).toHaveAttribute("data-mobile");
    fireEvent.pointerDown(trigger());
    fireEvent.click(trigger());
    expect(aside()).not.toHaveClass("oc-sidebar--collapsed");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(aside()).toHaveClass("oc-sidebar--collapsed");
    fireEvent.click(trigger());
    fireEvent.pointerDown(screen.getByText("Page"));
    expect(aside()).toHaveClass("oc-sidebar--collapsed");
    expect(window.localStorage.getItem("oc-sidebar:m")).toBeNull();
    setNarrow(false);
    expect(aside()).not.toHaveClass("oc-sidebar--overlay");
    expect(aside()).not.toHaveClass("oc-sidebar--collapsed");
  });

  it("Ctrl/Cmd+B toggles, shortcut={false} does not", () => {
    const { unmount } = render(<Shell />);
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(aside()).toHaveClass("oc-sidebar--collapsed");
    fireEvent.keyDown(window, { key: "b", metaKey: true });
    expect(aside()).not.toHaveClass("oc-sidebar--collapsed");
    unmount();
    render(<Shell shortcut={false} />);
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(aside()).not.toHaveClass("oc-sidebar--collapsed");
  });

  it("useSidebar exposes the state; outside a provider it throws", () => {
    function Probe() {
      const s = useSidebar();
      return <button type="button" onClick={s.toggle}>{s.collapsed ? "closed" : "open"}{s.isMobile ? " mobile" : ""}</button>;
    }
    render(<SidebarProvider><Probe /></SidebarProvider>);
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByRole("button", { name: "closed" })).toBeTruthy();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/SidebarProvider/);
    spy.mockRestore();
  });

  it("menu badge and sub list components", () => {
    render(<SidebarMenuSub><li><SidebarMenuBadge>3</SidebarMenuBadge></li></SidebarMenuSub>);
    expect(document.querySelector("ul.oc-sidebar-menu-sub span.oc-sidebar-menu-badge")).toHaveTextContent("3");
  });

  it("without a provider the sidebar behaves as before", () => {
    render(<Sidebar collapsed>x</Sidebar>);
    expect(aside()).toHaveClass("oc-sidebar oc-sidebar--collapsed");
    expect(aside()).not.toHaveClass("oc-sidebar--overlay");
  });
});

/* ------------------------------------------------------------------ server DataTable */

const columns = [
  { key: "name", header: "Name", hideable: false },
  { key: "sku", header: "Article ID" },
  { key: "price", header: "Price", numeric: true },
];
const ALL = Array.from({ length: 23 }, (_, i) => ({
  key: `a${i + 1}`,
  status: (i % 7 === 6 ? "deleted" : "active") as DataTableRow["status"],
  cells: { name: `Article ${i + 1}`, sku: `SKU-${i + 1}`, price: String(i + 1) },
}));
const names = () => [...document.querySelectorAll<HTMLTableRowElement>("tbody tr[data-oc-row]")].filter((r) => !r.hidden).map((r) => r.cells[1].textContent);

describe("0.17.0 server-driven DataTable", () => {
  it("shows the given rows (no local filter, sort or slice) with summary and pager from total", () => {
    render(<DataTable id="s1" title="Articles" server total={23} page={2} pageSize={10} columns={columns} rows={ALL.slice(10, 20)} />);
    const root = document.getElementById("s1")!;
    expect(root).toHaveAttribute("data-oc-server", "true");
    expect(root).toHaveAttribute("data-oc-total", "23");
    expect(root).toHaveAttribute("data-oc-current-page", "2");
    expect(names()).toHaveLength(10);
    expect(names()).toContain("Article 14");
    expect(screen.getByText("Showing 11–20 of 23")).toBeTruthy();
    expect(document.querySelector('[data-oc-pager] [aria-current="page"]')).toHaveTextContent("2");
  });

  it("controlled sort: the click calls onSortChange and aria-sort follows the prop", () => {
    const onSortChange = vi.fn();
    const { rerender } = render(<DataTable id="s2" title="Articles" server total={23} sort={null} onSortChange={onSortChange} columns={columns} rows={ALL.slice(0, 10)} />);
    fireEvent.click(screen.getByRole("button", { name: "Price" }));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "price", dir: "asc" });
    expect(names()[0]).toBe("Article 1");
    rerender(<DataTable id="s2" title="Articles" server total={23} sort={{ key: "price", dir: "desc" }} onSortChange={onSortChange} columns={columns} rows={ALL.slice(0, 10).reverse()} />);
    expect(document.querySelector('th[data-oc-col="price"]')).toHaveAttribute("aria-sort", "descending");
    expect(names()[0]).toBe("Article 10");
  });

  it("page, page size, trash and filter callbacks; onQueryChange gets everything", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const onTrashedChange = vi.fn();
    const onQueryChange = vi.fn();
    render(
      <DataTable id="s3" title="Articles" server total={23} pageSize={10} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
        onTrashedChange={onTrashedChange} onQueryChange={onQueryChange} columns={columns} rows={ALL.slice(0, 10)} />,
    );
    fireEvent.click(document.querySelector('[data-oc-pager] [data-oc-page="3"]')!);
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    expect(document.getElementById("s3")).toHaveAttribute("data-oc-current-page", "3");
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "20" } });
    expect(onPageSizeChange).toHaveBeenLastCalledWith(20);
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole("button", { name: "Trash only" }));
    expect(onTrashedChange).toHaveBeenLastCalledWith("deleted");
    const last = onQueryChange.mock.lastCall![0] as DataTableQuery;
    expect(last).toMatchObject({ reason: "trashed", trashed: "deleted", page: 1, pageSize: 20 });
  });

  it("trashed is controlled", () => {
    render(<DataTable id="s4" server total={0} trashed="all" columns={columns} rows={[]} />);
    expect(screen.getByRole("button", { name: "Including trash" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Active only" })).not.toHaveAttribute("aria-current");
  });

  it("debounced search with searchDelay; search sets the field", () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    render(<DataTable id="s5" title="Articles" server total={23} search="art" searchDelay={200} onSearchChange={onSearchChange} columns={columns} rows={ALL.slice(0, 10)} />);
    const field = screen.getByLabelText("Search Articles") as HTMLInputElement;
    expect(field.value).toBe("art");
    fireEvent.input(field, { target: { value: "artic" } });
    act(() => { vi.advanceTimersByTime(100); });
    expect(onSearchChange).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(150); });
    expect(onSearchChange).toHaveBeenCalledWith("artic");
    expect(names()).toHaveLength(10);
  });

  it("loading: skeleton rows (page size), aria-busy, no empty text", () => {
    render(<DataTable id="s6" server loading pageSize={5} total={0} columns={columns} rows={[]} />);
    const root = document.getElementById("s6")!;
    expect(root).toHaveAttribute("aria-busy", "true");
    const sk = root.querySelectorAll("tr.oc-data-table-skeleton");
    expect(sk).toHaveLength(5);
    expect(sk[0].querySelectorAll(".oc-skeleton.oc-data-table-skeleton-bar")).toHaveLength(3);
    expect(root.querySelector(".oc-data-table-empty")).toHaveProperty("hidden", true);
  });

  it("emptyState replaces the no results text", () => {
    render(<DataTable id="s7" server total={0} emptyState={<span>Nothing for Company 1</span>} columns={columns} rows={[]} />);
    const empty = document.querySelector("#s7 .oc-data-table-empty")!;
    expect(empty.tagName).toBe("DIV");
    expect(empty).toHaveProperty("hidden", false);
    expect(empty).toHaveTextContent("Nothing for Company 1");
  });

  it("column chooser: unchecked columns are not rendered; hideable false is locked", () => {
    const onVisible = vi.fn();
    function Demo() {
      const [visible, setVisible] = useState(["name", "price"]);
      return <DataTable id="s8" visibleColumns={visible} onVisibleColumnsChange={(k) => { onVisible(k); setVisible(k); }} columns={columns} rows={ALL.slice(0, 3)} />;
    }
    render(<Demo />);
    expect(document.querySelector('#s8 th[data-oc-col="sku"]')).toBeNull();
    expect(document.querySelector("#s8 .oc-data-table-colpick")).toHaveAttribute("popover", "auto");
    expect(document.querySelector('#s8 .oc-data-table-columns-btn')).toHaveAttribute("popovertarget", "s8-colpick");
    const name = document.querySelector<HTMLInputElement>('[data-oc-visible-col="name"]')!;
    expect(name.disabled).toBe(true);
    fireEvent.click(document.querySelector('[data-oc-visible-col="sku"]')!);
    expect(onVisible).toHaveBeenLastCalledWith(["name", "sku", "price"]);
    expect(document.querySelector('#s8 th[data-oc-col="sku"]')).toBeTruthy();
    expect(document.querySelector('#s8 tbody td[data-oc-col="sku"]')).toHaveTextContent("SKU-1");
  });

  it("defaultVisibleColumns (uncontrolled) and defaultHidden", () => {
    render(<DataTable id="s9" defaultVisibleColumns={["name"]} columns={columns} rows={ALL.slice(0, 1)} />);
    expect(document.querySelector('#s9 th[data-oc-col="price"]')).toBeNull();
    fireEvent.click(document.querySelector('[data-oc-visible-col="price"]')!);
    expect(document.querySelector('#s9 th[data-oc-col="price"]')).toBeTruthy();
  });

  it("selection is kept over pages and controlled with selectedKeys", () => {
    const onSelectionChange = vi.fn();
    function Demo() {
      const [page, setPage] = useState(1);
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <DataTable id="s10" server total={23} page={page} onPageChange={setPage} pageSize={10} selectedKeys={selected}
          onSelectionChange={(k) => { onSelectionChange(k); setSelected(k); }} columns={columns} rows={ALL.slice((page - 1) * 10, page * 10)} />
      );
    }
    render(<Demo />);
    fireEvent.click(screen.getByLabelText("Select Article 2"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a2"]);
    fireEvent.click(document.querySelector('[data-oc-pager] [data-oc-page="2"]')!);
    expect(names()[0]).toBe("Article 11");
    fireEvent.click(screen.getByLabelText("Select Article 12"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a2", "a12"]);
    expect(screen.getByText("2 selected")).toBeTruthy();
    fireEvent.click(document.querySelector('[data-oc-pager] [data-oc-page="1"]')!);
    expect(screen.getByLabelText<HTMLInputElement>("Select Article 2").checked).toBe(true);
  });

  it("a full server loop: the parent fetches on every change (stale answers ignored)", async () => {
    vi.useFakeTimers();
    function fetchPage(q: { page: number; pageSize: number; sort: DataTableSort | null; trashed: DataTableTrashed }) {
      let list = ALL.filter((r) => (q.trashed === "all" ? true : q.trashed === "deleted" ? r.status === "deleted" : r.status !== "deleted"));
      if (q.sort) list = [...list].sort((a, b) => (Number(a.cells.price) - Number(b.cells.price)) * (q.sort!.dir === "desc" ? -1 : 1));
      return { rows: list.slice((q.page - 1) * q.pageSize, q.page * q.pageSize), total: list.length };
    }
    function Demo() {
      const [page, setPage] = useState(1);
      const [sort, setSort] = useState<DataTableSort | null>(null);
      const [trashed, setTrashed] = useState<DataTableTrashed>("active");
      const data = fetchPage({ page, pageSize: 10, sort, trashed });
      return <DataTable id="s11" title="Articles" server total={data.total} page={page} onPageChange={setPage} sort={sort}
        onSortChange={setSort} trashed={trashed} onTrashedChange={(t) => { setTrashed(t); setPage(1); }} columns={columns} rows={data.rows} />;
    }
    render(<Demo />);
    expect(screen.getByText("Showing 1–10 of 20")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Price" }));
    fireEvent.click(screen.getByRole("button", { name: "Price" }));
    expect(document.querySelector('th[data-oc-col="price"]')).toHaveAttribute("aria-sort", "descending");
    expect(names()[0]).toBe("Article 23");
    fireEvent.click(screen.getByRole("button", { name: "Trash only" }));
    expect(screen.getByText("Showing 1–3 of 3")).toBeTruthy();
    expect(names()).toEqual(["Article 21", "Article 14", "Article 7"]);
  });

  it("without server the client table is unchanged", () => {
    render(<DataTable id="s12" pageSize={10} columns={columns} rows={ALL} />);
    const root = document.getElementById("s12")!;
    expect(root).not.toHaveAttribute("data-oc-server");
    expect(root).not.toHaveAttribute("aria-busy");
    expect(names()).toHaveLength(10);
    expect(screen.getByText("Showing 1–10 of 20")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Active only" })).toHaveAttribute("aria-current", "true");
  });
});
