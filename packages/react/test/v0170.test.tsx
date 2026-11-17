// File: packages/react/test/v0170.test.tsx
// Map: language menu flags="auto" + languageFlag -> dropdown item description + icon tone -> sidebar meta wrap/collapsed -> form section invalid + count -> otp fit/group

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { languageFlag } from "../src/components/Webicon";
import { LanguageMenu } from "../src/components/LanguageMenu";
import { DropdownItem } from "../src/components/Dropdown";
import { SidebarMeta } from "../src/components/SidebarMeta";
import { FormSection } from "../src/components/FormSection";
import { OtpInput } from "../src/components/OtpInput";

describe("0.17.0 language menu", () => {
  it("languageFlag: region wins, else the usual country, else undefined", () => {
    expect(languageFlag("en")).toBe("flag:gb-4x3");
    expect(languageFlag("en-US")).toBe("flag:us-4x3");
    expect(languageFlag("nl_BE")).toBe("flag:be-4x3");
    expect(languageFlag("nl")).toBe("flag:nl-4x3");
    expect(languageFlag("da")).toBe("flag:dk-4x3");
    expect(languageFlag("fil")).toBeUndefined();
  });

  it('flags="auto" draws a flag from the code; own flag and flagFor win', () => {
    const langs = [{ value: "en", label: "English" }, { value: "nl-BE", label: "Vlaams" }, { value: "fr", label: "Français", flag: "flag:be-4x3" }, { value: "de", label: "Deutsch" }];
    const { container } = render(<LanguageMenu options={langs} value="en" flags="auto" flagFor={(v) => (v === "de" ? "flag:it-4x3" : undefined)} />);
    const names = [...container.querySelectorAll(".oc-language-flag svg")].map((f) => f.getAttribute("data-webicon"));
    expect(names).toEqual(["flag:gb-4x3", "flag:gb-4x3", "flag:be-4x3", "flag:be-4x3", "flag:it-4x3"]);
  });

  it("without flags no flag is guessed", () => {
    const { container } = render(<LanguageMenu options={[{ value: "en", label: "English" }]} value="en" />);
    expect(container.querySelector(".oc-language-flag")).toBeNull();
  });
});

describe("0.17.0 dropdown item", () => {
  it("description makes a two-line item; iconTone a tinted icon square", () => {
    const { container } = render(<DropdownItem icon="mdi:check" iconTone="success" description="Players scan a code here">Checkpoint</DropdownItem>);
    const item = container.querySelector(".oc-dropdown-item")!;
    expect(item.querySelector(".oc-dropdown-icon")!.className).toBe("oc-dropdown-icon oc-dropdown-icon--success");
    expect(item.querySelector(".oc-dropdown-text > span")!.textContent).toBe("Checkpoint");
    expect(item.querySelector(".oc-dropdown-desc")!.textContent).toBe("Players scan a code here");
  });
  it("without description the label stays a plain text node", () => {
    const { container } = render(<DropdownItem>Edit</DropdownItem>);
    expect(container.querySelector(".oc-dropdown-text")).toBeNull();
  });
});

describe("0.17.0 sidebar meta", () => {
  it("wrap and collapsed add their modifiers", () => {
    const { container } = render(<><SidebarMeta wrap brand="App 1" version="2.4.0" copyright="© 2026 Company 1" /><SidebarMeta collapsed version="2.4.0" /></>);
    const [a, b] = container.querySelectorAll(".oc-sidebar-meta");
    expect(a.className).toBe("oc-sidebar-meta oc-tooltip oc-tooltip--right oc-sidebar-meta--wrap");
    expect(b.className).toBe("oc-sidebar-meta oc-tooltip oc-tooltip--right oc-sidebar-meta--collapsed");
  });
});

describe("0.17.0 form section", () => {
  it("invalid sets data-issue, issues shows a labelled count", () => {
    const { container } = render(<FormSection title="Location" invalid="error" issues={2} status="Check">x</FormSection>);
    const d = container.querySelector("details")!;
    expect(d.getAttribute("data-issue")).toBe("error");
    const count = d.querySelector(".oc-form-section__count")!;
    expect(count.textContent).toBe("2");
    expect(count.getAttribute("aria-label")).toBe("2 errors");
    expect(d.querySelector(".oc-form-section__status")!.textContent).toBe("2Check");
  });
  it("one warning; no count without invalid", () => {
    const { container } = render(<><FormSection title="A" invalid="warning" issues={1}>x</FormSection><FormSection title="B" issues={3}>x</FormSection></>);
    const [a, b] = container.querySelectorAll("details");
    expect(a.querySelector(".oc-form-section__count")!.getAttribute("aria-label")).toBe("1 warning");
    expect(b.hasAttribute("data-issue")).toBe(false);
    expect(b.querySelector(".oc-form-section__count")).toBeNull();
  });
});

describe("0.17.0 otp input", () => {
  it("fit and group add their classes and the group size", () => {
    const { container } = render(<OtpInput length={8} fit group={4} alphanumeric />);
    const input = container.querySelector("input")!;
    expect(input.className).toBe("oc-otp oc-otp--fit oc-otp--group");
    expect(input.style.getPropertyValue("--oc-otp-group")).toBe("4");
    expect(input.maxLength).toBe(8);
  });
});
