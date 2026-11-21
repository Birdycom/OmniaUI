// File: packages/react/test/v0170-d2.test.tsx
// Map: Combobox catalog mode (numeric, server search debounce, selected, clear row, custom row, manage footer, portal,
//      description/image/emoji, ledger + module) -> FormField extras (tooltip, required, labelTrailing, errorKey, hideLabel,
//      ledger, module, validation message) -> Input mask + validation -> Select/Textarea/InputGroup ledger + module

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { Combobox } from "../src/components/Combobox";
import type { ComboboxOption } from "../src/components/Combobox";
import { FormField } from "../src/components/FormField";
import { Input } from "../src/components/Input";
import { Select } from "../src/components/Select";
import { Textarea } from "../src/components/Textarea";
import { InputGroup } from "../src/components/InputGroup";

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

const catalog: ComboboxOption[] = [
  { value: 1, label: "Company 1", description: "info@company1.example", emoji: "🏢" },
  { value: 2, label: "Customer 1", image: "/img/customer-1.png" },
  { value: 3, label: "Customer 2", icon: "mdi:account" },
];

describe("0.17.0 combobox catalog mode", () => {
  it("gives numbers with valueType=number and keeps the hidden input a string", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox options={catalog} valueType="number" name="customer" onChange={onChange} label="Customer" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.click(screen.getByText("Customer 1"));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')!.value).toBe("2");
    expect(container.querySelector('[data-value="2"]')!.getAttribute("aria-selected")).toBe("true");
  });

  it("debounces onSearch, does not filter locally and marks the list busy while loading", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const { rerender } = render(<Combobox options={catalog} onSearch={onSearch} searchDelay={300} label="Customer" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.change(input, { target: { value: "cu" } });
    act(() => { vi.advanceTimersByTime(299); });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("cu");
    // No local filter: Company 1 does not contain "cu" and is still listed.
    expect(screen.getByText("Company 1")).toBeTruthy();
    rerender(<Combobox options={[]} onSearch={onSearch} loading label="Customer" />);
    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBe("true");
    expect(document.querySelector(".oc-combobox-loading")!.textContent).toBe("Loading...");
    expect(document.querySelector(".oc-combobox-empty")).toBeNull();
  });

  it("shows the label of a selected option that is not in the options", () => {
    render(<Combobox options={[]} valueType="number" value={42} selected={{ value: 42, label: "Company 42", emoji: "🏢" }} onSearch={() => {}} label="Company" />);
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Company 42");
    expect(document.querySelector(".oc-combobox-icon .oc-combobox-option-emoji")!.textContent).toBe("🏢");
  });

  it("keeps the label of a server result after the results change", () => {
    function Remote() {
      const [value, setValue] = useState<number | null>(null);
      const [options, setOptions] = useState(catalog);
      return <><Combobox options={options} value={value} onChange={setValue} valueType="number" onSearch={() => {}} label="Customer" /><button onClick={() => setOptions([])}>reset</button></>;
    }
    render(<Remote />);
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Customer 2"));
    fireEvent.click(screen.getByText("reset"));
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Customer 2");
  });

  it("has a clear row as first option that empties the choice", () => {
    const onChange = vi.fn();
    render(<Combobox options={catalog} defaultValue={1} valueType="number" clearLabel="No customer" onChange={onChange} label="Customer" />);
    fireEvent.focus(screen.getByRole("combobox"));
    const rows = screen.getAllByRole("option");
    expect(rows[0].className).toContain("oc-combobox-clear");
    expect(rows[0].textContent).toBe("No customer");
    fireEvent.click(rows[0]);
    expect(onChange).toHaveBeenCalledWith(null);
    // String mode clears to "".
    const onText = vi.fn();
    render(<Combobox options={[{ value: "a", label: "A" }]} defaultValue="a" clearLabel="None" onChange={onText} label="Letter" />);
    fireEvent.click(screen.getAllByText("None")[0]);
    expect(onText).toHaveBeenCalledWith("");
  });

  it("offers what was typed when nothing matches exactly", () => {
    const onChange = vi.fn();
    const onCustom = vi.fn();
    render(<Combobox options={catalog} allowCustomFromSearch onChange={onChange} onCustom={onCustom} label="Customer" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Customer 9" } });
    const custom = document.querySelector(".oc-combobox-custom")!;
    expect(custom.getAttribute("role")).toBe("option");
    expect(custom.textContent).toBe('Use "Customer 9"');
    // Keyboard reaches the custom row too.
    fireEvent.keyDown(input, { key: "End" });
    expect(input.getAttribute("aria-activedescendant")).toBe(custom.id);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Customer 9");
    expect(onCustom).toHaveBeenCalledWith("Customer 9");
    fireEvent.change(input, { target: { value: "company 1" } });
    expect(document.querySelector(".oc-combobox-custom")).toBeNull();
  });

  it("with numbers the custom row only calls onCustom", () => {
    const onChange = vi.fn();
    const onCustom = vi.fn();
    render(<Combobox options={catalog} valueType="number" allowCustomFromSearch onChange={onChange} onCustom={onCustom} label="Customer" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Company 9" } });
    fireEvent.click(document.querySelector(".oc-combobox-custom")!);
    expect(onCustom).toHaveBeenCalledWith("Company 9");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps useState<string> setters assignable to onChange", () => {
    function Typed() {
      const [v, setV] = useState("a");
      return <Combobox options={[{ value: "a", label: "A" }]} value={v} onChange={setV} />;
    }
    render(<Typed />);
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("A");
  });

  it("puts a manage link in a footer outside the listbox", () => {
    const onManage = vi.fn();
    render(<Combobox options={catalog} manageHref="/customers" manageLabel="Manage customers" onManage={onManage} label="Customer" />);
    const link = screen.getByText("Manage customers") as HTMLAnchorElement;
    expect(link.closest(".oc-combobox-footer")).toBeTruthy();
    expect(link.closest('[role="listbox"]')).toBeNull();
    expect(link.getAttribute("href")).toBe("/customers");
    expect(document.querySelector(".oc-combobox-list--panel > ul.oc-combobox-options[role=listbox]")).toBeTruthy();
    document.addEventListener("click", (e) => e.preventDefault(), { once: true });
    fireEvent.click(link);
    expect(onManage).toHaveBeenCalled();
  });

  it("renders the list in document.body with portal and still chooses", () => {
    const onChange = vi.fn();
    const { container } = render(<div style={{ overflow: "auto" }}><Combobox options={catalog} portal onChange={onChange} label="Customer" module="green" /></div>);
    const list = document.body.querySelector(":scope > .oc-combobox-list--portal")!;
    expect(list).toBeTruthy();
    expect(container.querySelector(".oc-combobox-list")).toBeNull();
    expect(list.getAttribute("data-open")).toBe("false");
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(list.getAttribute("data-open")).toBe("");
    expect((list as HTMLElement).style.position).toBe("fixed");
    const option = screen.getByText("Company 1").closest("li")!;
    // A press in the list does not take the focus from the field.
    expect(fireEvent.mouseDown(option)).toBe(false);
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledWith("1");
    expect(list.getAttribute("data-open")).toBe("false");
  });

  it("draws description, image and emoji and the visual of the choice in the field", () => {
    render(<Combobox options={catalog} defaultValue="2" label="Customer" />);
    expect(document.querySelector(".oc-combobox-option-description")!.textContent).toBe("info@company1.example");
    expect(document.querySelector(".oc-combobox-option-label")!.textContent).toBe("Company 1");
    expect(document.querySelector(".oc-combobox-list .oc-combobox-option-emoji")!.textContent).toBe("🏢");
    const img = document.querySelector(".oc-combobox-list img.oc-combobox-option-image")!;
    expect(img.getAttribute("alt")).toBe("");
    expect(document.querySelector(".oc-combobox-icon img.oc-combobox-option-image")).toBeTruthy();
  });

  it("sets the ledger classes and data-module", () => {
    const { container } = render(<Combobox options={catalog} variant="ledger" module="purple" label="Customer" />);
    const root = container.querySelector(".oc-combobox")!;
    expect(root.className).toContain("oc-combobox--ledger");
    expect(root.getAttribute("data-module")).toBe("purple");
    expect(screen.getByRole("combobox").className).toContain("oc-input--ledger");
  });

  it("keeps the old behaviour without the new props", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox options={[{ value: "a", label: "Apple" }, { value: "b", label: "Banana" }]} onChange={onChange} />);
    expect(container.querySelector("ul.oc-combobox-list[role=listbox]")).toBeTruthy();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ban" } });
    expect(screen.queryByText("Apple")).toBeNull();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("0.17.0 form field extras", () => {
  it("draws tooltip, required mark and trailing content in a label row", () => {
    render(
      <FormField label="IBAN" tooltip="The account the refund goes to" required labelTrailing={<a href="#help">Help</a>}>
        <Input />
      </FormField>,
    );
    const row = document.querySelector(".oc-field-label-row")!;
    expect(row.querySelector(".oc-field-label .oc-field-required")!.getAttribute("aria-hidden")).toBe("true");
    const button = row.querySelector("button.oc-field-tooltip")!;
    expect(button.getAttribute("aria-label")).toBe("More information");
    expect(document.getElementById(button.getAttribute("aria-describedby")!)!.textContent).toBe("The account the refund goes to");
    expect(row.querySelector(".oc-tooltip")!.getAttribute("data-tooltip")).toBe("The account the refund goes to");
    expect(row.querySelector(".oc-field-label-trailing a")!.textContent).toBe("Help");
    const input = screen.getByRole("textbox");
    expect(input.hasAttribute("required")).toBe(true);
    expect(input.getAttribute("aria-required")).toBe("true");
  });

  it("renders a rich tooltip as .oc-tooltip__content", () => {
    render(<FormField label="VAT" tooltip={<strong>BE0123.456.789</strong>}><Input /></FormField>);
    const tip = document.querySelector(".oc-tooltip__content[role=tooltip]")!;
    expect(tip.querySelector("strong")!.textContent).toBe("BE0123.456.789");
  });

  it("uses errorKey for data-error-key and the error id", () => {
    const { container } = render(<FormField label="Email" errorKey="email" error="Required"><Input /></FormField>);
    expect(container.firstElementChild!.getAttribute("data-error-key")).toBe("email");
    expect(document.getElementById("email-error")!.textContent).toBe("Required");
    expect(screen.getByRole("textbox").getAttribute("aria-describedby")).toContain("email-error");
  });

  it("hides the label visually only and sets ledger + module", () => {
    const { container } = render(<FormField label="Amount" hideLabel variant="ledger" module="gold"><Input /></FormField>);
    const field = container.firstElementChild!;
    expect(field.className).toContain("oc-field--ledger");
    expect(field.getAttribute("data-module")).toBe("gold");
    expect(screen.getByText("Amount").className).toContain("oc-visually-hidden");
    expect(screen.getByLabelText("Amount")).toBeTruthy();
  });

  it("shows the validation message of its input when it has no error of its own", () => {
    const onValidate = vi.fn();
    render(<FormField label="IBAN"><Input validationType="iban" validationMessage="Not a valid IBAN" onValidate={onValidate} /></FormField>);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "BE00 0000" } });
    fireEvent.blur(input);
    expect(onValidate).toHaveBeenCalledWith(false, "BE00 0000");
    expect(screen.getByRole("alert").textContent).toBe("Not a valid IBAN");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(input, { target: { value: "BE68 5390 0754 7034" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("0.17.0 input mask and validation", () => {
  it("formats an IBAN while typing", () => {
    const onChange = vi.fn();
    render(<Input mask="iban" onChange={(e) => onChange(e.target.value)} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "be68539007547034" } });
    expect(input.value).toBe("BE68 5390 0754 7034");
    expect(onChange).toHaveBeenCalledWith("BE68 5390 0754 7034");
  });

  it("formats with a pattern", () => {
    render(<Input mask="9999 AA" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1234ab" } });
    expect(input.value).toBe("1234 AB");
  });

  it("marks an invalid value on blur and clears it once right", () => {
    render(<Input validationType="email" />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "info@company1" } });
    fireEvent.blur(input);
    expect(input.className).toContain("oc-input--error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(input, { target: { value: "info@company1.example" } });
    expect(input.className).not.toContain("oc-input--error");
  });

  it("sets ledger + module on Input, Select, Textarea and InputGroup", () => {
    const { container } = render(
      <>
        <Input variant="ledger" module="blue" />
        <Select variant="ledger" module="blue" options={["A"]} />
        <Textarea variant="ledger" module="blue" />
        <InputGroup variant="ledger" module="blue" prefix="EUR"><Input variant="ledger" /></InputGroup>
      </>,
    );
    expect(container.querySelector("input.oc-input--ledger[data-module=blue]")).toBeTruthy();
    expect(container.querySelector("select.oc-select--ledger[data-module=blue]")).toBeTruthy();
    expect(container.querySelector("textarea.oc-textarea--ledger[data-module=blue]")).toBeTruthy();
    expect(container.querySelector(".oc-input-group--ledger[data-module=blue]")).toBeTruthy();
  });
});
