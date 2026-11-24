// File: packages/react/test/v0180-qp.test.tsx
// Map: Barcode QR -> Progress striped + SplitBar -> SeverityCard compact + calm -> SortableList (keyboard, arrows) -> Sheet floating / rounded
//      -> OtpInput block / lg / tiles -> StatList -> SaveStatus queued / online / compact -> ModeBadge staging / offline + EnvFrame
//      -> Toast action (button, closes) -> CopyField block -> Tabs reveal on click -> Combobox icon-only data-typing
import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Barcode, encodeQr } from "../src/components/Barcode";
import { Progress, SplitBar, splitPercents } from "../src/components/Progress";
import { SeverityCard } from "../src/components/SeverityCard";
import { SortableList, moveItem } from "../src/components/SortableList";
import { Sheet } from "../src/components/Sheet";
import { OtpInput } from "../src/components/OtpInput";
import { StatList } from "../src/components/StatList";
import { SaveStatus, saveStatusText } from "../src/components/StatusDot";
import { EnvFrame, ModeBadge } from "../src/components/ModeBadge";
import { Toast, ToastProvider, useToast } from "../src/components/Toast";
import { CopyField } from "../src/components/CopyField";
import { Tabs } from "../src/components/Tabs";
import { Combobox } from "../src/components/Combobox";

describe("Barcode format QR (0.18.0)", () => {
  it("draws a square QR SVG with the --qr class and the text as caption", () => {
    const { container } = render(<Barcode format="QR" level="H" value="https://company1.example/order/1001" />);
    const fig = container.querySelector("figure.oc-barcode")!;
    expect(fig.classList.contains("oc-barcode--qr")).toBe(true);
    const svg = fig.querySelector("svg.oc-barcode__qr")!;
    const [, , w, h] = svg.getAttribute("viewBox")!.split(" ");
    expect(w).toBe(h);
    expect(fig.querySelector(".oc-barcode__digits")!.textContent).toBe("https://company1.example/order/1001");
    expect(encodeQr("HELLO").version).toBe(1);
  });
  it("bare and no caption; a barcode stays a barcode", () => {
    const { container } = render(<><Barcode format="QR" variant="bare" digits={false} value="CUSTOMER-1" /><Barcode value="5400000000010" /></>);
    const [qr, ean] = container.querySelectorAll("figure");
    expect(qr.className).toContain("oc-barcode--bare");
    expect(qr.querySelector(".oc-barcode__digits")).toBeNull();
    expect(ean.classList.contains("oc-barcode--qr")).toBe(false);
  });
});

describe("Progress striped track and split bar (0.18.0)", () => {
  it("track striped adds the modifier to a normal bar", () => {
    const { container } = render(<Progress value={3} max={8} track="striped" aria-label="Stops" />);
    const bar = container.querySelector(".oc-progress")!;
    expect(bar.className).toContain("oc-progress--striped");
    expect(bar.getAttribute("role")).toBe("progressbar");
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("38%");
  });
  it("segments make a split bar with role img, widths of the sum or of max, and tones", () => {
    const segments = [{ value: 12, tone: "success" as const, label: "Right" }, { value: 4, tone: "danger" as const, label: "Wrong" }, { value: 4, label: "Open" }];
    const { container } = render(<SplitBar legend segments={segments} />);
    const bar = container.querySelector(".oc-progress--split")!;
    expect(bar.getAttribute("role")).toBe("img");
    expect(bar.getAttribute("aria-label")).toBe("Right 12, Wrong 4, Open 4");
    const parts = bar.querySelectorAll<HTMLElement>(".oc-progress-segment");
    expect([...parts].map((p) => p.style.inlineSize)).toEqual(["60%", "20%", "20%"]);
    expect(parts[0].className).toContain("oc-progress-segment--success");
    expect(parts[2].className).toBe("oc-progress-segment");
    expect(container.querySelectorAll(".oc-progress-legend li")).toHaveLength(3);
    expect(splitPercents([{ value: 9 }, { value: 3 }], 20)).toEqual([45, 15]);
  });
});

describe("SeverityCard compact + calm (0.18.0)", () => {
  it("compact renders a row (div, no details) with the text, tags and actions", () => {
    const { container } = render(
      <SeverityCard compact level="calm" title="All teams on route" tags={["Team 1"]} actions={<button type="button">Dismiss</button>}>Last check 1 minute ago.</SeverityCard>,
    );
    const row = container.querySelector(".oc-severity-card")!;
    expect(row.tagName).toBe("DIV");
    expect(row.className).toContain("oc-severity-card--compact");
    expect(row.className).toContain("oc-severity-card--calm");
    expect(container.querySelector("summary")).toBeNull();
    expect(container.querySelector(".oc-severity-card-text")!.textContent).toBe("Last check 1 minute ago.");
    expect(container.querySelector(".oc-severity-card-level")!.textContent).toBe("Calm");
    expect(container.querySelector(".oc-severity-card-actions button")).not.toBeNull();
  });
  it("without compact it stays a details card", () => {
    const { container } = render(<SeverityCard level="high" title="Password in a leak"><p>Change it.</p></SeverityCard>);
    expect(container.querySelector("details.oc-severity-card")).not.toBeNull();
  });
});

describe("SortableList (0.18.0)", () => {
  const STOPS = [{ id: "a", label: "Town hall" }, { id: "b", label: "Old harbour" }, { id: "c", label: "Windmill" }];
  function Route({ onOrder }: { onOrder?: (ids: string[]) => void }) {
    const [items, setItems] = useState(STOPS);
    return <SortableList ordered arrows items={items} onReorder={(next) => { setItems(next); onOrder?.(next.map((s) => s.id)); }} aria-label="Route" />;
  }
  it("renders an ol with grips, data-id and arrow buttons", () => {
    const { container } = render(<Route />);
    const list = container.querySelector("ol.oc-sortable-list")!;
    expect(list.getAttribute("aria-label")).toBe("Route");
    expect([...list.querySelectorAll("li")].map((li) => li.getAttribute("data-id"))).toEqual(["a", "b", "c"]);
    expect(list.querySelector(".oc-sortable-row-grip")!.getAttribute("aria-label")).toBe("Move Town hall");
    expect(list.querySelector('[data-oc-move="up"]')!.hasAttribute("disabled")).toBe(true);
  });
  it("keyboard: Space picks up, ArrowDown moves, onReorder gets the new array", () => {
    const onOrder = vi.fn();
    const { container } = render(<Route onOrder={onOrder} />);
    const grip = container.querySelector<HTMLButtonElement>('[data-id="a"] .oc-sortable-row-grip')!;
    grip.focus();
    act(() => { fireEvent.keyDown(grip, { key: " " }); });
    expect(grip.getAttribute("aria-pressed")).toBe("true");
    act(() => { fireEvent.keyDown(grip, { key: "ArrowDown" }); });
    expect(onOrder).toHaveBeenLastCalledWith(["b", "a", "c"]);
    expect([...container.querySelectorAll("li")].map((li) => li.getAttribute("data-id"))).toEqual(["b", "a", "c"]);
  });
  it("arrow buttons move one step", () => {
    const onOrder = vi.fn();
    const { container } = render(<Route onOrder={onOrder} />);
    act(() => { (container.querySelector('[data-id="c"] [data-oc-move="up"]') as HTMLButtonElement).click(); });
    expect(onOrder).toHaveBeenLastCalledWith(["a", "c", "b"]);
    expect(moveItem([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
  });
});

describe("Sheet floating / rounded (0.18.0)", () => {
  it("adds oc-sheet--floating and oc-sheet--rounded", () => {
    const { container } = render(<><Sheet floating title="Team 1">x</Sheet><Sheet side="bottom" rounded title="Share">y</Sheet></>);
    const [a, b] = container.querySelectorAll("dialog");
    expect(a.className).toContain("oc-sheet--floating");
    expect(a.className).not.toContain("oc-sheet--inset");
    expect(b.className).toContain("oc-sheet--bottom");
    expect(b.className).toContain("oc-sheet--rounded");
  });
});

describe("OtpInput block / lg / tiles (0.18.0)", () => {
  it("adds the modifiers and keeps one real input", () => {
    const { container } = render(<OtpInput length={6} alphanumeric block size="lg" tiles />);
    const input = container.querySelector("input.oc-otp")!;
    expect(input.className).toContain("oc-otp--block");
    expect(input.className).toContain("oc-otp--lg");
    expect(input.className).toContain("oc-otp--tiles");
    expect(container.querySelectorAll("input")).toHaveLength(1);
  });
});

describe("StatList (0.18.0)", () => {
  it("rows with sublabel and a total row", () => {
    const { container } = render(<StatList items={[{ label: "Questions", sublabel: "12 of 15 right", value: 120 }, { label: "Hints used", value: -10 }]} total={{ label: "Total", value: 110 }} />);
    const dl = container.querySelector("dl.oc-dl.oc-dl--stat")!;
    expect(dl.querySelectorAll(".oc-dl-row")).toHaveLength(3);
    expect(dl.querySelector(".oc-dl-sub")!.textContent).toBe("12 of 15 right");
    expect(dl.querySelector(".oc-dl-row--total .oc-dl-detail")!.textContent).toBe("110");
  });
});

describe("SaveStatus sync states (0.18.0)", () => {
  it("queued with a count, online, and a compact dot with the text for screen readers", () => {
    const { container } = render(<><SaveStatus state="queued" count={3} /><SaveStatus state="online" /><SaveStatus state="queued" count={1} compact /></>);
    const [queued, online, compact] = container.querySelectorAll("p.oc-status");
    expect(queued.textContent).toBe("3 changes waiting to sync");
    expect(queued.querySelector(".oc-status-dot--waiting")).not.toBeNull();
    expect(online.querySelector(".oc-status-dot--done")).not.toBeNull();
    expect(compact.className).toContain("oc-status--compact");
    expect(compact.getAttribute("role")).toBe("status");
    expect(compact.getAttribute("title")).toBe("1 change waiting to sync");
    expect(compact.querySelector(".oc-status__count")!.textContent).toBe("1");
    expect(saveStatusText("queued", { queued: "{count} in de wachtrij" }, 4)).toBe("4 in de wachtrij");
  });
});

describe("ModeBadge staging / offline + EnvFrame (0.18.0)", () => {
  it("staging and offline words; the frame is aria-hidden with its mode", () => {
    const { container } = render(<><ModeBadge mode="staging" /><ModeBadge mode="offline" labels={{ offline: "Offline" }} /><EnvFrame mode="live" /></>);
    const [staging, offline] = container.querySelectorAll(".oc-mode-badge");
    expect(staging.textContent).toBe("Staging");
    expect(staging.getAttribute("data-mode")).toBe("staging");
    expect(offline.textContent).toBe("Offline");
    const frame = container.querySelector(".oc-env-frame")!;
    expect(frame.getAttribute("data-mode")).toBe("live");
    expect(frame.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Toast action (0.18.0)", () => {
  it("a button in the toast runs the action and dismisses", () => {
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(<Toast variant="success" title="Round published" action={{ label: "Undo", onClick }} onDismiss={onDismiss} />);
    const btn = container.querySelector<HTMLButtonElement>("button.oc-toast-action")!;
    expect(btn.textContent).toBe("Undo");
    expect(btn.type).toBe("button");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
  it("useToast passes the action through and the toast closes after the click", () => {
    const undo = vi.fn();
    function Publish() {
      const { toast } = useToast();
      return <button type="button" onClick={() => toast({ title: "Round published", action: { label: "Undo", onClick: undo } })}>Publish</button>;
    }
    const { getByText, container } = render(<ToastProvider><Publish /></ToastProvider>);
    fireEvent.click(getByText("Publish"));
    fireEvent.click(container.querySelector(".oc-toast-action")!);
    expect(undo).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".oc-toast")).toBeNull();
  });
});

describe("CopyField block (0.18.0)", () => {
  it("adds oc-copy-field--block", () => {
    const { container } = render(<CopyField block value="K7QM2XPA" ariaLabel="Join code" />);
    expect(container.querySelector(".oc-copy-field")!.className).toContain("oc-copy-field--block");
  });
});

describe("Tabs: the chosen tab scrolls into view (0.18.0)", () => {
  it("mode buttons: a click on a tab outside the visible part scrolls the list", () => {
    const { container } = render(
      <Tabs name="t" mode="buttons" tabs={[{ value: "a", label: "A", content: "a" }, { value: "b", label: "B", content: "b" }]} />,
    );
    const list = container.querySelector<HTMLElement>(".oc-tab-list")!;
    const b = list.querySelectorAll<HTMLElement>('[role="tab"]')[1];
    Object.defineProperty(list, "scrollWidth", { value: 400 });
    Object.defineProperty(list, "clientWidth", { value: 100 });
    Object.defineProperty(b, "offsetLeft", { value: 200 });
    Object.defineProperty(b, "offsetWidth", { value: 60 });
    const scrollTo = vi.fn();
    list.scrollTo = scrollTo as unknown as typeof list.scrollTo;
    fireEvent.click(b);
    expect(scrollTo).toHaveBeenCalled();
    expect(b.getAttribute("aria-selected")).toBe("true");
  });
});

describe("Combobox icon-only shows the query while typing (0.18.0)", () => {
  it("data-typing while a query is typed", () => {
    const { container } = render(
      <Combobox size="header" iconOnly triggerAriaLabel="Language" portal={false} options={[{ value: "nl", label: "Nederlands" }, { value: "en", label: "English" }]} />,
    );
    const root = container.querySelector(".oc-combobox")!;
    expect(root.className).toContain("oc-combobox--icon-only");
    expect(root.hasAttribute("data-typing")).toBe(false);
    fireEvent.change(container.querySelector("input")!, { target: { value: "Ned" } });
    expect(root.hasAttribute("data-typing")).toBe(true);
  });
  it("focus and click select the invisible chosen label, so typing replaces it", () => {
    const { container } = render(
      <Combobox size="header" iconOnly triggerAriaLabel="Language" portal={false} defaultValue="nl" options={[{ value: "nl", label: "Nederlands" }, { value: "en", label: "English" }]} />,
    );
    const input = container.querySelector("input")!;
    expect(input.value).toBe("Nederlands");
    fireEvent.focus(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 10]);
    input.setSelectionRange(3, 3);
    fireEvent.click(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 10]);
  });
});
