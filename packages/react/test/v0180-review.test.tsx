// File: packages/react/test/v0180-review.test.tsx
// Map: Combobox opens on a user action only (not on the focus a dialog gives it) -> TimeInput selectOnFocus
//      -> PhoneInput regroups the number when the country changes
import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Combobox } from "../src/components/Combobox";
import { PhoneInput } from "../src/components/PhoneInput";
import { TimeInput } from "../src/components/TimeInput";

const options = [
  { value: "1", label: "Customer 1" },
  { value: "2", label: "Customer 2" },
];
const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Combobox opens on a user action only (0.18.0)", () => {
  it("a focus from a script or autofocus (a dialog that opens) keeps the list closed", () => {
    const { container } = render(<Combobox options={options} label="Customer" />);
    const input = container.querySelector<HTMLInputElement>(".oc-combobox-input")!;
    fireEvent.focus(input);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".oc-combobox")!.getAttribute("data-open")).toBe("false");
  });

  it("a click, Arrow Down, Enter and typing open it", () => {
    const { container } = render(<Combobox options={options} label="Customer" />);
    const input = container.querySelector<HTMLInputElement>(".oc-combobox-input")!;
    fireEvent.focus(input);
    fireEvent.click(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.change(input, { target: { value: "Cust" } });
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("Tab into the field still opens it (keyboard users keep the old behaviour)", async () => {
    const { container } = render(<Combobox options={options} label="Customer" />);
    const input = container.querySelector<HTMLInputElement>(".oc-combobox-input")!;
    fireEvent.keyDown(document.body, { key: "Tab" });
    fireEvent.focus(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    fireEvent.blur(input);
    await tick(450);
    fireEvent.focus(input);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("TimeInput selectOnFocus (0.18.0)", () => {
  it("is on with slotsPopover: focus selects the whole time", () => {
    const { container } = render(<TimeInput slots={["09:00", "09:30"]} slotsPopover defaultValue="09:00" />);
    const input = container.querySelector<HTMLInputElement>("input.oc-time-input")!;
    input.focus();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(5);
    // the mouseup of the click that focused the field does not drop the selection
    const up = new MouseEvent("mouseup", { bubbles: true, cancelable: true });
    input.dispatchEvent(up);
    expect(up.defaultPrevented).toBe(true);
    const next = new MouseEvent("mouseup", { bubbles: true, cancelable: true });
    input.dispatchEvent(next);
    expect(next.defaultPrevented).toBe(false);
  });

  it("is off by default without slotsPopover, and selectOnFocus={false} turns it off", () => {
    const plain = render(<TimeInput defaultValue="09:00" />).container.querySelector<HTMLInputElement>("input")!;
    plain.setSelectionRange(5, 5);
    plain.focus();
    expect(plain.selectionStart).toBe(5);
    const off = render(<TimeInput slots={["09:00"]} slotsPopover selectOnFocus={false} defaultValue="09:00" />).container.querySelector<HTMLInputElement>("input.oc-time-input")!;
    off.setSelectionRange(5, 5);
    off.focus();
    expect(off.selectionStart).toBe(5);
    const on = render(<TimeInput selectOnFocus defaultValue="10:30" />).container.querySelector<HTMLInputElement>("input")!;
    on.focus();
    expect([on.selectionStart, on.selectionEnd]).toEqual([0, 5]);
  });
});

describe("PhoneInput regroups on a country change (0.18.0)", () => {
  it("keeps the digits and shows them in the grouping of the new country", () => {
    function Demo() {
      const [v, setV] = useState("+32470123456");
      return <PhoneInput value={v} onChange={setV} />;
    }
    const { container } = render(<Demo />);
    const input = container.querySelector<HTMLInputElement>(".oc-phone-input-number")!;
    const select = container.querySelector("select")!;
    expect(input.value).toBe("470 12 34 56");
    fireEvent.change(select, { target: { value: "+31" } });
    expect(input.value).toBe("4 70 12 34 56");
    fireEvent.change(select, { target: { value: "+49" } });
    expect(input.value).toBe("470 1234 56");
  });
});
