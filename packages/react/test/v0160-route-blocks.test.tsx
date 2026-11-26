// File: packages/react/test/v0160-route-blocks.test.tsx
// Map: type picker (radios, filter, disabled) -> content blocks (move, remove, keyboard grip) -> route steps (numbers,
//      filter keeps the counter, select, menu) -> route progress (states, next, bar) -> step view (picture, question, countdown)

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlockTypePicker } from "../src/blocks/BlockTypePicker";
import { BlockContentBlocks } from "../src/blocks/BlockContentBlocks";
import { BlockRouteSteps } from "../src/blocks/BlockRouteSteps";
import { BlockRouteProgress } from "../src/blocks/BlockRouteProgress";
import { BlockStepView, StepViewCountdown } from "../src/blocks/BlockStepView";

describe("0.16.0 type picker", () => {
  const options = [
    { value: "text", label: "Text", hint: "Paragraphs", category: "content", preview: <b>Welcome</b> },
    { value: "image", label: "Image", category: "media" },
    { value: "question", label: "Question", category: "question", disabled: true },
  ];
  it("renders radio cards with a hidden preview; the first free option is picked", () => {
    const { container } = render(<BlockTypePicker options={options} categories={[{ value: "content", label: "Content" }, { value: "media", label: "Media" }]} />);
    const radios = container.querySelectorAll<HTMLInputElement>(".oc-block-type-picker-input");
    expect(radios).toHaveLength(3);
    expect(radios[0].checked).toBe(true);
    expect(radios[2].disabled).toBe(true);
    expect(container.querySelector(".oc-block-type-picker-preview")!.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll(".oc-block-type-picker-cats input")).toHaveLength(3);
  });
  it("picks on change and filters by category and search", () => {
    const onValueChange = vi.fn();
    const { container } = render(<BlockTypePicker options={options} categories={[{ value: "media", label: "Media" }]} onValueChange={onValueChange} />);
    fireEvent.click(container.querySelectorAll(".oc-block-type-picker-input")[1]);
    expect(onValueChange).toHaveBeenCalledWith("image");
    fireEvent.click(container.querySelector('.oc-block-type-picker-cats input[value="media"]')!);
    expect(container.querySelectorAll(".oc-block-type-picker-item")).toHaveLength(1);
    fireEvent.change(container.querySelector(".oc-block-type-picker-search")!, { target: { value: "zzz" } });
    expect(container.querySelector(".oc-block-type-picker-empty")).not.toBeNull();
  });
});

describe("0.16.0 content blocks", () => {
  const items = [
    { id: "a", type: "Text", icon: "mdi:text", content: <textarea />, open: true },
    { id: "b", type: "Image", peek: "photo.jpg", content: <p>drop</p> },
    { id: "c", type: "Note", content: <p>note</p>, locked: true },
  ];
  it("renders cards with grip, type, peek and tools; first up and last down are disabled", () => {
    const { container } = render(<BlockContentBlocks title="Step 1" items={items} />);
    const li = container.querySelectorAll(".oc-block-content-blocks-item");
    expect(li).toHaveLength(3);
    expect(li[0].querySelector("details")!.hasAttribute("open")).toBe(true);
    expect(li[1].querySelector(".oc-block-content-blocks-peek")!.textContent).toBe("photo.jpg");
    expect(li[0].querySelector<HTMLButtonElement>('[aria-label="Move Text up"]')!.disabled).toBe(true);
    expect(li[2].querySelector<HTMLButtonElement>('[aria-label="Move Note down"]')!.disabled).toBe(true);
    expect(li[2].querySelector('[data-action="remove"]')).toBeNull();
  });
  it("moves with the buttons and the keyboard grip, removes with the trash button", () => {
    const onMove = vi.fn();
    const onRemove = vi.fn();
    const { container } = render(<BlockContentBlocks title="Step 1" items={items} onMove={onMove} onRemove={onRemove} />);
    fireEvent.click(container.querySelector('[aria-label="Move Image down"]')!);
    expect(onMove).toHaveBeenLastCalledWith("b", 2);
    const grip = container.querySelector<HTMLButtonElement>('[aria-label="Move Image"]')!;
    fireEvent.click(grip);
    expect(grip.getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(grip, { key: "ArrowUp" });
    expect(onMove).toHaveBeenLastCalledWith("b", 0);
    expect(container.querySelector(".oc-block-content-blocks-status")!.textContent).toContain("position 1 of 3");
    fireEvent.click(container.querySelector('[aria-label="Remove Text"]')!);
    expect(onRemove).toHaveBeenCalledWith("a");
  });
});

describe("0.16.0 route steps", () => {
  const steps = [
    { id: "s1", name: "Welcome", numbered: false, icon: "mdi:play-circle-outline", kind: "intro" },
    { id: "s2", name: "Old gate", meta: ["Question", "20 points"], kind: "step", status: "Ready", statusTone: "success" as const },
    { id: "s3", name: "Town hall", kind: "step", status: "No question", statusTone: "warning" as const },
  ];
  it("numbered steps get the --num thumb, others an icon; status badge and aria-current", () => {
    const { container } = render(<BlockRouteSteps title="Steps" steps={steps} selected="s2" />);
    expect(container.querySelectorAll(".oc-block-route-steps-thumb--num")).toHaveLength(2);
    // 0.18.0: mdi:play-circle-outline is a built-in webicon, so it is inline SVG now
    expect(container.querySelector('.oc-block-route-steps-thumb svg[data-webicon="mdi:play-circle-outline"]')).not.toBeNull();
    expect(container.querySelector(".oc-badge--warning")!.textContent).toBe("No question");
    expect(container.querySelector('[aria-current="true"] .oc-block-route-steps-name')!.textContent).toBe("Old gate");
    expect(container.querySelector(".oc-block-route-steps-menu")).toBeNull();
  });
  it("filters by kind with .is-filtered rows (so the counter keeps the real numbers), selects and moves from the menu", () => {
    const onSelect = vi.fn();
    const onMove = vi.fn();
    const { container } = render(<BlockRouteSteps title="Steps" steps={steps} kinds={[{ value: "intro finish", label: "Start and finish" }]} onSelect={onSelect} onMove={onMove} />);
    fireEvent.click(container.querySelector('.oc-block-route-steps-kinds input[value="intro finish"]')!);
    const rows = container.querySelectorAll<HTMLLIElement>(".oc-block-route-steps-item");
    expect([...rows].map((r) => r.classList.contains("is-filtered"))).toEqual([false, true, true]);
    expect([...rows].some((r) => r.hidden)).toBe(false);
    fireEvent.click(rows[1].querySelector(".oc-block-route-steps-main")!);
    expect(onSelect).toHaveBeenCalledWith("s2");
    const menu = rows[1].querySelector(".oc-dropdown-menu")!;
    expect(menu.hasAttribute("popover")).toBe(true);
    fireEvent.click(menu.querySelectorAll(".oc-dropdown-item")[1]);
    expect(onMove).toHaveBeenCalledWith("s2", 2);
  });
});

describe("0.16.0 route progress", () => {
  it("renders the bar, the next step and each state", () => {
    const onNext = vi.fn();
    const { container } = render(
      <BlockRouteProgress title="Route 1" score={40} done={3} total={6} next={{ title: "Walk to step 3", meta: "240 m", onClick: onNext, tone: "finish" }}
        steps={[{ name: "Old gate", state: "done", value: "+20" }, { name: "Market square", state: "wrong" }, { name: "Town hall", state: "current" }, { name: "Finish", state: "locked", marker: "mdi:flag-checkered", markerLabel: "Finish" }]} />,
    );
    expect(container.querySelector<HTMLElement>(".oc-progress-bar")!.style.width).toBe("50%");
    expect(container.querySelector(".oc-progress")!.getAttribute("aria-valuemax")).toBe("6");
    expect(container.querySelector(".oc-block-route-progress-next--finish")).not.toBeNull();
    fireEvent.click(container.querySelector(".oc-block-route-progress-next")!);
    expect(onNext).toHaveBeenCalled();
    const items = container.querySelectorAll(".oc-block-route-progress-item");
    expect(items[1].className).toContain("--wrong");
    expect(items[1].className).toContain("--done");
    expect(items[2].querySelector("button")!.getAttribute("aria-current")).toBe("step");
    expect(items[3].querySelector("svg[data-webicon=\"mdi:flag-checkered\"]")!.getAttribute("aria-label")).toBe("Finish");
    expect(items[0].querySelector(".oc-block-route-progress-marker")!.textContent).toBe("1");
  });
});

describe("0.16.0 step view", () => {
  it("empty picture shows the number; question radios and countdown bar", () => {
    const onSend = vi.fn();
    const { container } = render(
      <BlockStepView title="Town hall" number={3} place="Market street 1" task="Find the year" blocks={<StepViewCountdown label="Time left" time="0:56" left={62} tone="low" />}
        question={{ text: "Which year?", options: ["1890", "1910"], onSend }}>
        <p>Text</p>
      </BlockStepView>,
    );
    const pic = container.querySelector(".oc-block-step-view-picture")!;
    expect(pic.className).toContain("--empty");
    expect(pic.getAttribute("data-number")).toBe("3");
    expect(container.querySelectorAll(".oc-block-step-view-answers .oc-radio")).toHaveLength(2);
    const cd = container.querySelector<HTMLElement>(".oc-block-step-view-countdown")!;
    expect(cd.className).toContain("--low");
    expect(cd.style.getPropertyValue("--oc-step-view-left")).toBe("62%");
    fireEvent.click(container.querySelector(".oc-block-step-view-send")!);
    expect(onSend).toHaveBeenCalled();
  });
});
