// File: packages/react/test/data-table.test.tsx
// Map: DataTable -> search hides rows, sort reorders, trash filter, bulk event

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, DataTableName } from "../src/components/DataTable";

const columns = [
  { key: "sku", header: "Article ID" },
  { key: "name", header: "Name" },
  { key: "price", header: "Price", numeric: true },
];

const rows = [
  { key: "schar", status: "active" as const, cells: { sku: "SET-SCHAR", name: "Scharnier 1105", price: "5,15" }, values: { price: "5.15" } },
  { key: "greep", status: "active" as const, cells: { sku: "SET-GREEP", name: "Greep 40", price: "12,40" }, values: { price: "12.40" } },
  { key: "schroef", status: "deleted" as const, cells: { sku: "SCHROEF", name: "Schroef 4x40", price: "0,08" }, values: { price: "0.08" } },
];

describe("Data table", () => {
  it("searches, sorts and filters trash like a list", () => {
    render(<DataTable id="dt-react" title="Articles" pageSize={10} columns={columns} rows={rows} />);
    const row = (name: string) => [...document.querySelectorAll<HTMLTableRowElement>("#dt-react tbody tr")].find((tr) => tr.textContent?.includes(name));
    expect(row("Schroef 4x40")).toHaveProperty("hidden", true);
    expect(screen.getByText("Showing 1–2 of 2")).toBeTruthy();

    fireEvent.input(screen.getByLabelText("Search Articles"), { target: { value: "greep" } });
    expect(row("Greep 40")).toHaveProperty("hidden", false);
    expect(row("Scharnier 1105")).toHaveProperty("hidden", true);

    fireEvent.input(screen.getByLabelText("Search Articles"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Price" }));
    const names = [...document.querySelectorAll<HTMLTableRowElement>("#dt-react tbody tr")].filter((tr) => !tr.hidden).map((tr) => tr.textContent);
    expect(names[0]).toContain("Scharnier");
    expect(names[1]).toContain("Greep");

    fireEvent.click(screen.getByRole("button", { name: "Trash only" }));
    expect(row("Schroef 4x40")).toHaveProperty("hidden", false);
    expect(row("Greep 40")).toHaveProperty("hidden", true);
  });

  it("filters a column with tabs and selects, and renders rich name cells", () => {
    const people = [
      { key: "lotte", cells: { name: <DataTableName name="Customer 1" sub="info@customer1.example" />, type: "Private", region: "Antwerp" }, values: { name: "Customer 1", type: "private", region: "Antwerp" } },
      { key: "noord", cells: { name: <DataTableName name="Company 1" sub="BE0000.000.001" />, type: "Company", region: "Antwerp" }, values: { name: "Company 1", type: "company", region: "Antwerp" } },
      { key: "reno", cells: { name: <DataTableName name="Company 2" />, type: "Company", region: "East Flanders" }, values: { name: "Company 2", type: "company", region: "East Flanders" } },
    ];
    render(
      <DataTable
        id="dt-people"
        title="Customers"
        pageSize={10}
        draggable={false}
        summary="Showing {from}–{to} of {total} customers"
        columns={[{ key: "name", header: "Name" }, { key: "type", header: "Type" }, { key: "region", header: "Region" }]}
        rows={people}
        tabs={{ column: "type", items: [{ value: "", label: "All", count: 3 }, { value: "private", label: "Private", count: 1 }, { value: "company", label: "Companies", count: 2 }] }}
        columnFilters={[{ column: "region", label: "Region", options: [{ value: "", label: "All regions" }, { value: "Antwerp", label: "Antwerp" }, { value: "East Flanders", label: "East Flanders" }] }]}
      />,
    );
    const visible = () => [...document.querySelectorAll<HTMLTableRowElement>("#dt-people tbody tr")].filter((tr) => !tr.hidden).length;
    expect(screen.getByText("Showing 1–3 of 3 customers")).toBeTruthy();
    expect(document.querySelector("#dt-people tbody tr .oc-avatar")?.textContent).toBe("C1");
    expect(document.querySelector("#dt-people tbody .oc-data-table-name-sub")?.textContent).toBe("info@customer1.example");

    fireEvent.click(screen.getByRole("tab", { name: /Companies/ }));
    expect(visible()).toBe(2);
    fireEvent.change(screen.getByRole("combobox", { name: "Region" }), { target: { value: "Antwerp" } });
    expect(visible()).toBe(1);
    fireEvent.click(screen.getByRole("tab", { name: /All/ }));
    expect(visible()).toBe(2);
  });

  it("reports a bulk action with the selected keys", () => {
    const onBulk = vi.fn();
    render(<DataTable id="dt-bulk" title="Articles" pageSize={10} columns={columns} rows={rows} onBulk={onBulk} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Scharnier 1105" }));
    expect(screen.getByText("1 selected")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Move to trash" }));
    expect(onBulk).toHaveBeenCalledWith("archive", ["schar"]);
  });
});
