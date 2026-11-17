// File: packages/react/test/v0170.test.tsx
// Map: language menu flags="auto" + languageFlag -> dropdown item description + icon tone -> sidebar meta wrap/collapsed -> form section invalid + count -> otp fit/group -> copy field display -> type picker action mode -> route steps status, badges, locked -> content blocks pinned, issues, drop from a drawer -> data table labels, view, pagination, bulk -> table auto layout + action labels -> color field contrast -> sidebar tooltips -> alert alarm -> countdown -> answer tiles -> save status -> locked empty state

import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { languageFlag } from "../src/components/Webicon";
import { LanguageMenu } from "../src/components/LanguageMenu";
import { DropdownItem } from "../src/components/Dropdown";
import { SidebarMeta } from "../src/components/SidebarMeta";
import { FormSection } from "../src/components/FormSection";
import { OtpInput } from "../src/components/OtpInput";
import { CopyField, groupCode } from "../src/components/CopyField";
import { BlockTypePicker } from "../src/blocks/BlockTypePicker";
import { BlockRouteSteps } from "../src/blocks/BlockRouteSteps";
import { BlockContentBlocks, pinnedKept } from "../src/blocks/BlockContentBlocks";
import { DataTable } from "../src/components/DataTable";
import { Table, TableActions } from "../src/components/Table";
import { TableActionIcon } from "../src/components/TableActions";
import { ColorField, contrastRatio, pickOnColor } from "../src/components/ColorField";
import { SidebarMenuButton } from "../src/components/Sidebar";
import { Alert } from "../src/components/Alert";
import { Countdown } from "../src/components/Countdown";
import { BlockStepView } from "../src/blocks/BlockStepView";
import { SaveStatus } from "../src/components/StatusDot";
import { EmptyState } from "../src/components/EmptyState";

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

describe("0.17.0 copy field display", () => {
  it("groupCode splits in groups", () => {
    expect(groupCode("K7QM2XPA", 4)).toBe("K7QM 2XPA");
    expect(groupCode("K7QM2", 4)).toBe("K7QM 2");
    expect(groupCode("K7QM2XPA")).toBe("K7QM2XPA");
  });
  it("display shows the grouped code with a caption and copies the raw value", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { container } = render(<CopyField display="lg" group={4} value="K7QM2XPA" label="Join code" caption="Type it in the app" />);
    const root = container.querySelector(".oc-copy-field")!;
    expect(root.className).toBe("oc-copy-field oc-copy-field--display oc-copy-field--lg");
    expect((root.querySelector("input") as HTMLInputElement).value).toBe("K7QM 2XPA");
    expect(root.querySelector(".oc-copy-field-caption")!.textContent).toBe("Type it in the app");
    await act(async () => { fireEvent.click(root.querySelector("button")!); });
    expect(writeText).toHaveBeenCalledWith("K7QM2XPA");
  });
});

describe("0.17.0 type picker action mode", () => {
  const options = [
    { value: "text", label: "Text" },
    { value: "photo", label: "Photo", disabledReason: "One photo per step" },
    { value: "quiz", label: "Question" },
  ];
  it("cards are buttons; a click picks, a card with a reason does not", () => {
    const onPick = vi.fn();
    const { container } = render(<BlockTypePicker mode="action" options={options} onPick={onPick} draggable search={false} />);
    expect(container.querySelector(".oc-block-type-picker")!.className).toContain("oc-block-type-picker--action");
    expect(container.querySelector("input[type=radio]")).toBeNull();
    const [text, photo] = container.querySelectorAll<HTMLButtonElement>("button.oc-block-type-picker-item");
    fireEvent.click(text);
    fireEvent.click(photo);
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick.mock.calls[0][0]).toBe("text");
    expect(photo.getAttribute("aria-disabled")).toBe("true");
    expect(photo.hasAttribute("disabled")).toBe(false);
    expect(document.getElementById(photo.getAttribute("aria-describedby")!)!.textContent).toBe("One photo per step");
    expect(text.getAttribute("draggable")).toBe("true");
    expect(photo.hasAttribute("draggable")).toBe(false);
  });
  it("arrow keys move the focus only", () => {
    const onPick = vi.fn();
    const { container } = render(<BlockTypePicker mode="action" options={options} onPick={onPick} search={false} />);
    const items = container.querySelectorAll<HTMLButtonElement>("button.oc-block-type-picker-item");
    items[0].focus();
    fireEvent.keyDown(items[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(items[1], { key: "End" });
    expect(document.activeElement).toBe(items[2]);
    fireEvent.keyDown(items[2], { key: "ArrowRight" });
    expect(document.activeElement).toBe(items[0]);
    expect(onPick).not.toHaveBeenCalled();
  });
});

describe("0.17.0 route steps", () => {
  const steps = [
    { id: "a", name: "Gate", status: "2 problems", statusTone: "destructive" as const, statusTooltip: "No location. No photo.", badges: [<span key="c" className="oc-badge">Counts</span>, <span key="t" className="oc-badge">Team</span>] },
    { id: "b", name: "Clock", status: "Ready", statusTone: "success" as const },
  ];
  it("status with tooltip, red tone and badges", () => {
    const { container } = render(<BlockRouteSteps title="Steps" steps={steps} search={false} onMove={() => {}} />);
    const tip = container.querySelector(".oc-block-route-steps-status.oc-tooltip")!;
    expect(tip.getAttribute("data-tooltip")).toBe("No location. No photo.");
    expect(tip.getAttribute("tabindex")).toBe("0");
    expect(tip.querySelector(".oc-badge--destructive")!.textContent).toBe("2 problems");
    expect(container.querySelectorAll(".oc-block-route-steps-badges .oc-badge")).toHaveLength(2);
  });
  it("locked: grips disabled, no move items, a lock line", () => {
    const { container } = render(<BlockRouteSteps title="Steps" steps={steps} search={false} locked onMove={() => {}} onRemove={() => {}} />);
    expect(container.querySelector(".oc-block-route-steps")!.className).toContain("oc-block-route-steps--locked");
    expect(container.querySelector(".oc-block-route-steps-lock")!.textContent).toBe("Order locked");
    expect([...container.querySelectorAll<HTMLButtonElement>(".oc-sortable-row-grip")].every((g) => g.disabled)).toBe(true);
    expect(container.textContent).not.toContain("Move up");
    expect(container.textContent).toContain("Delete");
  });
});

describe("0.17.0 content blocks", () => {
  const items = [
    { id: "intro", type: "Intro", content: "x", pinned: true },
    { id: "text", type: "Text", content: "x", issue: "error" as const, issues: 2 },
    { id: "photo", type: "Photo", content: "x" },
    { id: "end", type: "Finish", content: "x", pinned: true },
  ];
  it("pinnedKept: leading and trailing pinned items keep their place", () => {
    const ids = (a: string[]) => a.map((id) => ({ id }));
    expect(pinnedKept(items, ids(["intro", "photo", "text", "end"]))).toBe(true);
    expect(pinnedKept(items, ids(["photo", "intro", "text", "end"]))).toBe(false);
    expect(pinnedKept(items, ids(["intro", "text", "photo", "new", "end"]))).toBe(true);
    expect(pinnedKept(items, ids(["intro", "text", "photo", "end", "new"]))).toBe(false);
  });
  it("pinned: a pin, no move buttons; neighbours cannot pass it; issue count in the head", () => {
    const onMove = vi.fn();
    const { container } = render(<BlockContentBlocks title="Step 1" items={items} onMove={onMove} />);
    const rows = container.querySelectorAll(".oc-block-content-blocks-item");
    expect(rows[0].querySelector(".oc-block-content-blocks-pin")!.getAttribute("aria-label")).toBe("Intro stays in its place");
    expect(rows[0].querySelector("[aria-label^=\"Move Intro\"]")).toBeNull();
    const up = rows[1].querySelector<HTMLButtonElement>("[aria-label=\"Move Text up\"]")!;
    expect(up.disabled).toBe(true);
    const down = rows[2].querySelector<HTMLButtonElement>("[aria-label=\"Move Photo down\"]")!;
    expect(down.disabled).toBe(true);
    fireEvent.click(rows[1].querySelector<HTMLButtonElement>("[aria-label=\"Move Text down\"]")!);
    expect(onMove).toHaveBeenCalledWith("text", 2);
    expect(rows[1].getAttribute("data-issue")).toBe("error");
    expect(rows[1].querySelector(".oc-block-content-blocks-count")!.getAttribute("aria-label")).toBe("2 errors");
  });
  it("a block dragged in from a drawer is dropped at the line", () => {
    const onDropNew = vi.fn();
    const { container } = render(<BlockContentBlocks title="Step 1" items={items} acceptDrop="application/x-block" onDropNew={onDropNew} />);
    const row = container.querySelectorAll<HTMLElement>(".oc-block-content-blocks-item")[2];
    row.getBoundingClientRect = () => ({ top: 0, height: 40, bottom: 40, left: 0, right: 100, width: 100, x: 0, y: 0, toJSON: () => ({}) });
    const dataTransfer = { types: ["application/x-block"], getData: () => "quiz", dropEffect: "copy" };
    fireEvent.dragOver(row, { dataTransfer, clientY: 5 });
    expect(row.className).toContain("is-drop-before");
    fireEvent.drop(row, { dataTransfer });
    expect(onDropNew).toHaveBeenCalledWith("quiz", 2);
  });
});

describe("0.17.0 data table", () => {
  const columns = [{ key: "name", header: "Naam" }];
  const rows = Array.from({ length: 12 }, (_, i) => ({ key: String(i), cells: { name: `Game ${i + 1}` } }));
  it("labels translate the texts, also the ones the script writes", () => {
    const { container, getByText } = render(
      <DataTable title="Spellen" columns={columns} rows={rows} pageSize={10}
        labels={{ exportCsv: "CSV exporteren", search: "{name} zoeken", rowsPerPage: "Rijen per pagina", summary: "{from} tot {to} van {total}", nextPage: "Volgende pagina", actions: "Acties" }} />,
    );
    expect(getByText("CSV exporteren")).toBeTruthy();
    expect(container.querySelector(".oc-data-table-search")!.getAttribute("aria-label")).toBe("Spellen zoeken");
    expect(getByText("1 tot 10 van 12")).toBeTruthy();
    expect(container.querySelector("[aria-label=\"Volgende pagina\"]")).toBeTruthy();
    expect(JSON.parse(container.querySelector(".oc-data-table")!.getAttribute("data-oc-labels")!)).toEqual({ summary: "{from} tot {to} van {total}", nextPage: "Volgende pagina" });
  });
  it("view, pagination, filters and bulk can be switched off", () => {
    const { container } = render(<DataTable title="Report" columns={columns} rows={rows} view={false} pagination={false} filters={false} />);
    const root = container.querySelector(".oc-data-table")!;
    expect(root.hasAttribute("data-oc-no-grid")).toBe(true);
    expect(root.getAttribute("data-page-size")).toBe("0");
    expect(container.querySelector(".oc-data-table-view")).toBeNull();
    expect(container.querySelector(".oc-data-table-pager")).toBeNull();
    expect(container.querySelector(".oc-data-table-bulk")).toBeNull();
    expect(container.querySelector("[data-oc-bulk]")).toBeNull();
    expect(container.querySelectorAll("tbody tr:not([hidden])")).toHaveLength(12);
  });
});

describe("0.17.0 table", () => {
  it("layout auto, compact actions and an icon action with its label", () => {
    const { container } = render(<Table layout="auto"><tbody><tr><TableActions compact><TableActionIcon label="Edit" showLabel>i</TableActionIcon></TableActions></tr></tbody></Table>);
    expect(container.querySelector("table")!.className).toBe("oc-table oc-table--auto");
    expect(container.querySelector("td")!.className).toBe("oc-table-actions oc-table-actions--compact");
    const btn = container.querySelector(".oc-table-actions-icon")!;
    expect(btn.getAttribute("title")).toBe("Edit");
    expect(btn.querySelector(".oc-table-action-label")!.textContent).toBe("Edit");
  });
});

describe("0.17.0 color field contrast", () => {
  it("contrastRatio and pickOnColor", () => {
    expect(contrastRatio("#ffffff", "#000000")!.toFixed(0)).toBe("21");
    expect(contrastRatio("#777", "#777")).toBe(1);
    expect(pickOnColor("#ffeb3b")).toBe("#0b1020");
    expect(pickOnColor("#003366")).toBe("#ffffff");
  });
  it("shows the text line and one line per background, with a word for the result", async () => {
    const { container } = render(<ColorField defaultValue="#ffeb3b" contrastAgainst={[{ name: "the light page", color: "#ffffff" }, { name: "the dark page", color: "#0b1020" }]} />);
    await act(async () => {});
    const items = [...container.querySelectorAll(".oc-color-field-check")];
    expect(items.map((li) => li.getAttribute("data-ok"))).toEqual(["true", "false", "true"]);
    expect(items[1].textContent).toContain("On the light page");
    expect(items[1].textContent).toContain("Too low");
    expect(items[0].querySelector<HTMLElement>(".oc-color-field-sample")!.style.color).toBe("rgb(11, 16, 32)");
  });
});

describe("0.17.0 sidebar tooltips", () => {
  it("a text label becomes the tooltip; tooltip={false} turns it off", () => {
    const { container } = render(<><SidebarMenuButton href="/c">Customers</SidebarMenuButton><SidebarMenuButton href="/x" tooltip={false}>Plain</SidebarMenuButton></>);
    const [a, b] = container.querySelectorAll("a");
    expect(a.className).toBe("oc-sidebar-menu-button oc-tooltip oc-tooltip--right");
    expect(a.getAttribute("data-tooltip")).toBe("Customers");
    expect(b.className).toBe("oc-sidebar-menu-button");
  });
});

describe("0.17.0 alert alarm", () => {
  it("a new alarm is role alert in the danger tone, with icon, body and actions", () => {
    const { container } = render(<Alert alarm="new" title="Team 3 needs help" icon="mdi:lifebuoy" actions={<button type="button">Seen</button>}>Near the old gate</Alert>);
    const el = container.querySelector(".oc-alert")!;
    expect(el.className).toBe("oc-alert oc-alert--danger oc-alert--alarm");
    expect(el.getAttribute("role")).toBe("alert");
    expect(el.getAttribute("data-state")).toBe("new");
    expect(el.querySelector(".oc-alert-body .oc-alert-title")!.textContent).toBe("Team 3 needs help");
    expect(el.querySelector(".oc-alert-actions button")!.textContent).toBe("Seen");
  });
  it("a plain alert keeps its old markup", () => {
    const { container } = render(<Alert title="Saved">Done</Alert>);
    expect(container.querySelector(".oc-alert-body")).toBeNull();
    expect(container.querySelector(".oc-alert")!.getAttribute("role")).toBe("status");
  });
});

describe("0.17.0 countdown", () => {
  it("ticks, turns low, ends once", async () => {
    vi.useFakeTimers();
    const onEnd = vi.fn();
    const { container } = render(<Countdown seconds={3} total={10} low={5} variant="pill" bar onEnd={onEnd} />);
    const el = container.querySelector(".oc-countdown")!;
    expect(el.className).toBe("oc-countdown oc-countdown--pill oc-countdown--bar");
    expect(el.getAttribute("role")).toBe("timer");
    expect(el.querySelector(".oc-countdown-time")!.textContent).toBe("0:03");
    expect(el.getAttribute("data-state")).toBe("low");
    await act(async () => { vi.advanceTimersByTime(3500); });
    expect(el.querySelector(".oc-countdown-time")!.textContent).toBe("0:00");
    expect(el.getAttribute("data-state")).toBe("done");
    await act(async () => { vi.advanceTimersByTime(2000); });
    expect(onEnd).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe("0.17.0 answer tiles", () => {
  it("result marks the right and the wrong answer, locks the radios and shows the feedback", () => {
    const { container } = render(<BlockStepView title="Old gate" question={{ text: "Year?", options: ["1890", "1910", "1930"], result: { picked: 2, correct: 1 }, feedback: <p className="fb">Not quite</p> }} />);
    const cards = [...container.querySelectorAll(".oc-radio-item--card")];
    expect(cards.map((c) => c.getAttribute("data-result"))).toEqual([null, "correct", "wrong"]);
    expect(cards.every((c) => (c.querySelector("input") as HTMLInputElement).disabled)).toBe(true);
    expect((cards[2].querySelector("input") as HTMLInputElement).checked).toBe(true);
    expect(cards[1].textContent).toContain("Correct");
    expect(container.querySelector(".fb")!.textContent).toBe("Not quite");
    expect(container.querySelector(".oc-block-step-view-send")).toBeNull();
  });
});

describe("0.17.0 save status", () => {
  it("maps the state to a dot and words, polite live region, own labels", () => {
    const { container } = render(<><SaveStatus state="saving" /><SaveStatus state="error" labels={{ error: "Niet bewaard" }} /></>);
    const [a, b] = container.querySelectorAll(".oc-status");
    expect(a.getAttribute("aria-live")).toBe("polite");
    expect(a.querySelector(".oc-status-dot")!.className).toContain("oc-status-dot--working");
    expect(a.textContent).toBe("Saving…");
    expect(b.querySelector(".oc-status-dot")!.className).toContain("oc-status-dot--error");
    expect(b.textContent).toBe("Niet bewaard");
  });
});

describe("0.17.0 locked state", () => {
  it("locked adds the modifier, a lock icon and the meta pill", () => {
    const { container } = render(<EmptyState locked title="Walk into the zone" description="Step 3 opens near the old gate." meta="120 m to go" />);
    const el = container.querySelector(".oc-empty")!;
    expect(el.className).toBe("oc-empty oc-empty--locked");
    expect(el.querySelector(".oc-empty-icon svg")!.getAttribute("data-webicon")).toBe("mdi:lock-outline");
    expect(el.querySelector(".oc-empty-meta")!.textContent).toBe("120 m to go");
  });
});
