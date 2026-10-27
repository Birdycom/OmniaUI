// File: packages/react/test/forms-inputs.test.tsx
// Map: group A form components -> markup classes, modifiers and the small bits of behaviour each wrapper adds.
// Imports straight from the component files, so this test does not depend on the generated index.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AffixInput } from "../src/components/AffixInput";
import { BarcodeInput } from "../src/components/BarcodeInput";
import { ChipFilter } from "../src/components/ChipFilter";
import { ColorSelect } from "../src/components/ColorSelect";
import { DecimalInput, formatDecimal, parseDecimal } from "../src/components/DecimalInput";
import { FilterCounts } from "../src/components/FilterCounts";
import { LanguageSelect } from "../src/components/LanguageSelect";
import { NumberInput } from "../src/components/NumberInput";
import { PasswordRequirements } from "../src/components/PasswordRequirements";
import { PhoneInput, formatPhoneNational } from "../src/components/PhoneInput";
import { TimeInput, formatTime24h } from "../src/components/TimeInput";
import { ToggleField } from "../src/components/ToggleField";

describe("Forms - inputs", () => {
  it("PhoneInput groups digits and emits dial code + number", () => {
    const onChange = vi.fn();
    render(<PhoneInput aria-label="Phone" defaultValue="+32470123456" onChange={onChange} error />);
    const input = screen.getByLabelText("Phone") as HTMLInputElement;
    expect(input.value).toBe("470 12 34 56");
    expect(input.parentElement).toHaveClass("oc-phone-input", "oc-phone-input--error");
    fireEvent.change(input, { target: { value: "485 11" } });
    expect(onChange).toHaveBeenLastCalledWith("+3248511");
    fireEvent.change(screen.getByLabelText("Country code"), { target: { value: "+31" } });
    expect(onChange).toHaveBeenLastCalledWith("+3148511");
    expect(formatPhoneNational("0470")).toBe("047 0");
  });

  it("NumberInput steps, clamps and disables at the limits", () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="Qty" defaultValue={9} min={0} max={10} onChange={onChange} block />);
    const plus = screen.getByRole("button", { name: "Increase" });
    fireEvent.click(plus);
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(plus).toBeDisabled();
    expect(screen.getByLabelText("Qty")).toHaveValue(10);
    expect(screen.getByLabelText("Qty").parentElement).toHaveClass("oc-number-input", "oc-number-input--block");
  });

  it("AffixInput applies the variant presets", () => {
    render(<AffixInput variant="email" aria-label="Mail" />);
    const input = screen.getByLabelText("Mail");
    expect(input).toHaveAttribute("type", "email");
    expect(input.parentElement!.className).toBe("oc-input-group oc-input-group--affix");
    expect(input.previousElementSibling).toHaveTextContent("@");
    const { container } = render(<AffixInput variant="percent" aria-label="Vat" />);
    expect(container.querySelector(".oc-input-group")).not.toHaveClass("oc-input-group--end");
    expect(screen.getByLabelText("Vat").previousElementSibling).toHaveTextContent("%");
  });

  it("DecimalInput parses and formats locale numbers", () => {
    expect(parseDecimal("1.234,56", "nl-BE")).toBe(1234.56);
    expect(parseDecimal("1,234.5", "en-US")).toBe(1234.5);
    expect(parseDecimal("", "nl-BE")).toBeNull();
    expect(formatDecimal(1234.5, "en-US", 2)).toBe("1,234.50");
    const onValueChange = vi.fn();
    render(<DecimalInput aria-label="Amount" locale="en-US" unit="kg" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Amount") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1234.5" } });
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5);
    fireEvent.blur(input);
    expect(input.value).toBe("1,234.50");
    expect(input.parentElement).toHaveClass("oc-decimal-field");
  });

  it("TimeInput adds the colon and a datalist", () => {
    expect(formatTime24h("0930")).toBe("09:30");
    const onChange = vi.fn();
    render(<TimeInput aria-label="Start" slots={["08:00", "08:30"]} onChange={onChange} />);
    const input = screen.getByLabelText("Start");
    fireEvent.change(input, { target: { value: "0815" } });
    expect(onChange).toHaveBeenLastCalledWith("08:15");
    const list = document.getElementById(input.getAttribute("list")!);
    expect(list?.querySelectorAll("option")).toHaveLength(2);
  });

  it("BarcodeInput keeps digits and fills the preview", () => {
    render(<BarcodeInput label="EAN" />);
    const input = screen.getByLabelText("EAN");
    const figure = document.querySelector(".oc-barcode-preview")!;
    expect(figure).toHaveClass("oc-barcode-preview--empty");
    fireEvent.change(input, { target: { value: "SET-1105" } });
    expect(input).toHaveValue("SET-1105");
    expect(figure).not.toHaveClass("oc-barcode-preview--empty");
    expect(figure.querySelector(".oc-barcode-preview-code")).toHaveTextContent("SET-1105");
  });

  it("ColorSelect sets --oc-swatch and reports the choice", () => {
    const onChange = vi.fn();
    render(<ColorSelect aria-label="Color" list onChange={onChange} options={[{ value: "red", label: "Red", color: "var(--color-red-70)" }, { value: "blue", label: "Blue", color: "var(--oc-primary)" }]} />);
    const red = screen.getByLabelText("Red");
    expect(red.parentElement!.style.getPropertyValue("--oc-swatch")).toBe("var(--color-red-70)");
    fireEvent.click(red);
    expect(onChange).toHaveBeenCalledWith("red");
    expect(screen.getByRole("radiogroup")).toHaveClass("oc-color-select", "oc-color-select--list");
  });

  it("LanguageSelect renders the pill and the currency variant", () => {
    const onChange = vi.fn();
    render(<LanguageSelect currency ghost onChange={onChange} options={[{ value: "EUR", label: "EUR" }, { value: "USD", label: "USD" }]} />);
    const select = screen.getByLabelText("Currency");
    expect(select.parentElement!.className).toBe("oc-language-select oc-language-select--ghost oc-language-select--currency");
    fireEvent.change(select, { target: { value: "USD" } });
    expect(onChange).toHaveBeenCalledWith("USD");
  });

  it("ToggleField wires the description and flips via the row", () => {
    render(<ToggleField label="Alerts" description="Daily mail" card />);
    const input = screen.getByRole("switch");
    expect(input.closest("label")).toHaveClass("oc-toggle-field", "oc-toggle-field--card");
    expect(document.getElementById(input.getAttribute("aria-describedby")!)).toHaveTextContent("Daily mail");
    fireEvent.click(screen.getByText("Alerts"));
    expect(input).toBeChecked();
  });

  it("PasswordRequirements marks met rules", () => {
    render(<PasswordRequirements password="Secret1" />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.classList.contains("oc-password-requirement--met"))).toEqual([false, true, true, false]);
    const { container } = render(<PasswordRequirements password="" hideWhenEmpty />);
    expect(container).toBeEmptyDOMElement();
  });

  it("ChipFilter toggles several values with multiple", () => {
    const onChange = vi.fn();
    render(<ChipFilter multiple aria-label="Type" defaultValue={["a"]} onChange={onChange} options={[{ value: "a", label: "A", count: 2 }, { value: "b", label: "B" }]} />);
    expect(screen.getByRole("group")).toHaveClass("oc-chip-filter");
    expect(document.querySelector(".oc-chip-filter-count")).toHaveTextContent("2");
    fireEvent.click(screen.getByLabelText("B"));
    expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);
  });

  it("FilterCounts maps tones and selection", () => {
    const onChange = vi.fn();
    render(<FilterCounts aria-label="View" compact onChange={onChange} options={[{ value: "active", label: "Active", count: 12, tone: "success" }, { value: "all", label: "All", count: 14 }]} />);
    expect(screen.getByRole("radiogroup")).toHaveClass("oc-filter-counts", "oc-filter-counts--compact");
    expect(screen.getByLabelText(/Active/).parentElement).toHaveClass("oc-filter-counts-item--success");
    fireEvent.click(screen.getByLabelText(/All/));
    expect(onChange).toHaveBeenCalledWith("all");
  });
});
