// File: packages/react/test/v0126.test.tsx
// Map: NameCard -> DateField (ISO week) -> Barcode (SVG, error) -> FormSection -> AvatarPicker -> MeterRow (levels)

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarPicker } from "../src/components/AvatarPicker";
import { Barcode } from "../src/components/Barcode";
import { DateField } from "../src/components/DateField";
import { FormSection } from "../src/components/FormSection";
import { MeterRow } from "../src/components/MeterRow";
import { NameCard } from "../src/components/NameCard";

describe("v0.12.6 components", () => {
  it("name card shows name, amount and the rename pencil", () => {
    const { container } = render(<NameCard name="Worktop" amount="€ 1.940,00" meta="1 article" onRename={() => {}} open>Body</NameCard>);
    expect(container.querySelector(".oc-name-card__title")?.textContent).toBe("Worktop");
    expect(container.querySelector(".oc-name-card__amount")?.textContent).toBe("€ 1.940,00");
    expect(screen.getByRole("button", { name: "Rename Worktop" })).toBeTruthy();
  });

  it("date field shows the ISO week of its value", () => {
    const { container } = render(<DateField defaultValue="2027-01-01" weekLabel="Week {week} · {year}" aria-label="Start" />);
    expect(container.querySelector(".oc-date-field__week")?.textContent).toBe("Week 53 · 2026");
    fireEvent.change(screen.getByLabelText("Start"), { target: { value: "2026-11-12" } });
    expect(container.querySelector(".oc-date-field__week")?.textContent).toBe("Week 46 · 2026");
  });

  it("barcode draws bars, or the reason when the check digit is wrong", () => {
    const ok = render(<Barcode value="5400000000010" />);
    expect(ok.container.querySelectorAll("rect").length).toBeGreaterThan(20);
    expect(ok.container.querySelector(".oc-barcode__digits")?.textContent).toBe("5400000000010");
    const bad = render(<Barcode value="5400000000018" />);
    expect(bad.container.querySelector(".oc-barcode")?.hasAttribute("data-error")).toBe(true);
    expect(bad.container.textContent).toContain("check digit should be 0");
  });

  it("form section and avatar picker render their parts", () => {
    const { container } = render(
      <>
        <FormSection title="Address" hint="Invoice address" status="Complete" open><input aria-label="Street" /></FormSection>
        <AvatarPicker initials="C1" hint="PNG or JPG" />
      </>,
    );
    expect(container.querySelector(".oc-form-section__title")?.textContent).toBe("Address");
    expect(container.querySelector("[data-oc-initials]")?.textContent).toBe("C1");
    expect(screen.getByRole("button", { name: "Upload" })).toBeTruthy();
  });

  it("meter row picks its level from the percentage", () => {
    const { container } = render(
      <>
        <MeterRow label="Session" percent={62} />
        <MeterRow label="Week" percent={81} />
        <MeterRow label="Storage" percent={96} />
      </>,
    );
    const rows = container.querySelectorAll(".oc-meter-row");
    expect(rows[0].getAttribute("data-level")).toBeNull();
    expect(rows[1].getAttribute("data-level")).toBe("warn");
    expect(rows[2].getAttribute("data-level")).toBe("critical");
    expect((rows[2] as HTMLElement).style.getPropertyValue("--oc-meter")).toBe("96%");
  });
});
