// File: packages/react/test/v0170-app.test.tsx
// Map: 0.17.0 app-migration fixes: OtpInput onComplete after the value update -> Barcode bare + digit groups ->
//      CopyField masked / wrap / copiedLabel / ariaLabel / icon -> RecoveryCodes copied feedback, icons, print

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "../src/components/OtpInput";
import { Barcode } from "../src/components/Barcode";
import { CopyField } from "../src/components/CopyField";
import { RecoveryCodes } from "../src/components/RecoveryCodes";

describe("0.17.0 OtpInput onComplete", () => {
  it("a controlled parent already holds the full code when onComplete runs", () => {
    const seen: string[] = [];
    function Form() {
      const [code, setCode] = useState("");
      // the parent reads its OWN state in the callback (like form.setData + submit)
      return <OtpInput aria-label="Code" value={code} onChange={setCode} onComplete={() => seen.push(code)} />;
    }
    render(<Form />);
    const input = screen.getByLabelText("Code");
    fireEvent.change(input, { target: { value: "12345" } });
    expect(seen).toEqual([]);
    fireEvent.change(input, { target: { value: "123456" } });
    expect(seen).toEqual(["123456"]);
  });

  it("uncontrolled: fires once with the code, not again for the same value", () => {
    const onComplete = vi.fn();
    render(<OtpInput aria-label="Code" length={4} onComplete={onComplete} />);
    const input = screen.getByLabelText("Code");
    fireEvent.change(input, { target: { value: "12a34" } });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("1234");
    fireEvent.change(input, { target: { value: "123" } });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("0.17.0 Barcode", () => {
  it("bare variant drops the plate; digits are grouped 1 6 6 (EAN-13)", () => {
    const { container } = render(<Barcode value="5400000000010" variant="bare" />);
    const fig = container.querySelector("figure")!;
    expect(fig.className).toBe("oc-barcode oc-barcode--bare");
    const groups = [...fig.querySelectorAll(".oc-barcode__group")].map((g) => g.textContent);
    expect(groups).toEqual(["5", "400000", "000010"]);
    expect(fig.querySelector(".oc-barcode__digits")!.textContent).toBe("5400000000010");
  });

  it("EAN-8 4 4, UPC-A 1 5 5 1, Code 128 one group, groupDigits={false} one run", () => {
    const groups = (el: HTMLElement) => [...el.querySelectorAll(".oc-barcode__group")].map((g) => g.textContent);
    expect(groups(render(<Barcode value="96385074" />).container)).toEqual(["9638", "5074"]);
    expect(groups(render(<Barcode value="03600029145" format="UPC" />).container)).toEqual(["0", "36000", "29145", "2"]);
    expect(groups(render(<Barcode value="SKU-000105" />).container)).toEqual(["SKU-000105"]);
    expect(groups(render(<Barcode value="5400000000010" groupDigits={false} />).container)).toEqual(["5400000000010"]);
  });

  it("the default keeps the plate class list", () => {
    const { container } = render(<Barcode value="5400000000010" size="hero" />);
    expect(container.querySelector("figure")!.className).toBe("oc-barcode oc-barcode--hero");
  });
});

describe("0.17.0 CopyField", () => {
  it("masked: password input, toggle with aria-pressed and eye icons; copy still copies the raw value", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { container } = render(<CopyField value="sk_test_123" masked ariaLabel="API key" revealLabel="Show key" />);
    const input = screen.getByLabelText("API key") as HTMLInputElement;
    expect(input.type).toBe("password");
    const toggle = screen.getByRole("button", { name: "Show key" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAttribute("aria-controls", input.id);
    expect(toggle.querySelector("svg")?.getAttribute("data-webicon")).toBe("mdi:eye");
    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle.querySelector("svg")?.getAttribute("data-webicon")).toBe("mdi:eye-off");
    await act(async () => { fireEvent.click(container.querySelector(".oc-copy-field-button")!); });
    expect(writeText).toHaveBeenCalledWith("sk_test_123");
  });

  it("copy icon, copiedLabel on the button and in the live region", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { container } = render(<CopyField value="abc" buttonLabel="Kopieer" copiedLabel="Gekopieerd" />);
    const btn = screen.getByRole("button", { name: "Kopieer" });
    expect(btn.querySelector("svg")?.getAttribute("data-webicon")).toBe("mdi:content-copy");
    const status = container.querySelector(".oc-copy-field-status")!;
    expect(status).toHaveAttribute("role", "status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status.textContent).toBe("");
    await act(async () => { fireEvent.click(btn); });
    expect(btn).toHaveClass("is-copied");
    expect(btn).toHaveTextContent("Gekopieerd");
    expect(status.textContent).toBe("Gekopieerd");
    expect(btn.querySelector("svg")?.getAttribute("data-webicon")).toBe("mdi:check");
  });

  it("wrap renders an output that can break; ariaLabel wins over the English default", () => {
    const { container } = render(<CopyField value="https://company1.example/a/very/long/path" wrap ariaLabel="Link" icon={false} />);
    expect(container.querySelector(".oc-copy-field")!.className).toBe("oc-copy-field oc-copy-field--wrap");
    const out = container.querySelector("output.oc-copy-field-value")!;
    expect(out).toHaveAttribute("aria-label", "Link");
    expect(container.querySelector(".oc-copy-field-button svg")).toBeNull();
    // without label or ariaLabel the default stays "Value"
    render(<CopyField value="x" />);
    expect(screen.getByLabelText("Value")).toBeInTheDocument();
  });
});

describe("0.17.0 RecoveryCodes", () => {
  it("icons on the buttons and the warning; Copied feedback in a live region; optional print", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { container } = render(<RecoveryCodes codes={["AAAA-1111", "BBBB-2222"]} print copiedLabel="Gekopieerd" />);
    expect(container.querySelector(".oc-recovery-codes-warning svg")?.getAttribute("data-webicon")).toBe("mdi:alert-outline");
    const names = [...container.querySelectorAll(".oc-recovery-codes-actions svg")].map((s) => s.getAttribute("data-webicon"));
    expect(names).toEqual(["mdi:content-copy", "mdi:download", "mdi:printer"]);
    const copy = screen.getByRole("button", { name: "Copy all" });
    await act(async () => { fireEvent.click(copy); });
    expect(copy).toHaveTextContent("Gekopieerd");
    expect(copy).toHaveClass("is-copied");
    expect(container.querySelector(".oc-recovery-codes-status")!.textContent).toBe("Gekopieerd");
  });

  it("no print button by default; icons={false} draws none", () => {
    const { container } = render(<RecoveryCodes codes={["AAAA-1111"]} icons={false} />);
    expect(container.querySelectorAll(".oc-recovery-codes-actions button")).toHaveLength(2);
    expect(container.querySelector("svg")).toBeNull();
  });
});
