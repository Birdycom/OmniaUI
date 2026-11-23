// File: packages/react/test/v0170-r4.test.tsx
// Map: 0.17.0 round 4: DataTable column hideBelow -> data-hide-below on the th, the tds and the skeleton tds

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "../src/components/DataTable";

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "E-mail", hideBelow: "lg" as const },
  { key: "status", header: "Status", hideBelow: "sm" as const },
];
const rows = [
  { key: "c1", cells: { name: "Contact 1", email: "info@contact1.example", status: "Active" } },
  { key: "c2", cells: { name: "Contact 2", email: "info@contact2.example", status: "Pending" } },
];

describe("DataTable hideBelow", () => {
  it("puts data-hide-below on the header and every cell of that column", () => {
    const { container } = render(<DataTable id="dt-hide" columns={columns} rows={rows} />);
    expect(container.querySelector('th[data-oc-col="email"]')?.getAttribute("data-hide-below")).toBe("lg");
    expect(container.querySelector('th[data-oc-col="status"]')?.getAttribute("data-hide-below")).toBe("sm");
    expect(container.querySelector('th[data-oc-col="name"]')?.hasAttribute("data-hide-below")).toBe(false);
    expect(container.querySelectorAll('td[data-oc-col="email"][data-hide-below="lg"]')).toHaveLength(2);
    expect(container.querySelectorAll('td[data-oc-col="status"][data-hide-below="sm"]')).toHaveLength(2);
    expect(container.querySelectorAll('td[data-oc-col="name"][data-hide-below]')).toHaveLength(0);
  });

  it("keeps the switch on the skeleton cells while loading", () => {
    const { container } = render(<DataTable id="dt-hide-load" columns={columns} rows={[]} loading skeletonRows={2} />);
    expect(container.querySelectorAll('.oc-data-table-skeleton td[data-hide-below="lg"]')).toHaveLength(2);
    expect(container.querySelectorAll('.oc-data-table-skeleton td[data-hide-below="sm"]')).toHaveLength(2);
  });
});
