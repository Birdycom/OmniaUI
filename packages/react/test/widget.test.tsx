// File: packages/react/test/widget.test.tsx
// Map: status dot + status row -> glass -> title bar -> progress meter (levels, marker) -> alert/button inline -> prose compact
// Widget and desktop-app wrappers (0.12.3): they must render the same classes as the HTML snippets.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert, Button, Glass, GlassPanel, Progress, Prose, Status, StatusDot, Titlebar, TitlebarBody, TitlebarButton, TitlebarWindow, progressLevel } from "../src";

describe("widget components", () => {
  it("StatusDot is decoration without a label and an image with one", () => {
    const { container } = render(<><StatusDot tone="working" size="sm" /><StatusDot tone="error" label="Failed" /></>);
    const [plain, labelled] = container.querySelectorAll(".oc-status-dot");
    expect(plain).toHaveClass("oc-status-dot--working", "oc-status-dot--sm");
    expect(plain).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "Failed" })).toBe(labelled);
  });

  it("Status renders dot, text and meta", () => {
    const { container } = render(<Status tone="done" meta="12 min">Done</Status>);
    expect(container.firstChild).toHaveClass("oc-status");
    expect(container.querySelector(".oc-status-dot--done")).not.toBeNull();
    expect(container.querySelector(".oc-status__text")).toHaveTextContent("Done");
    expect(container.querySelector(".oc-status__meta")).toHaveTextContent("12 min");
  });

  it("Glass and GlassPanel map their flags", () => {
    const { container } = render(<Glass as="section" flat strong><GlassPanel strong>x</GlassPanel></Glass>);
    expect(container.querySelector("section")).toHaveClass("oc-glass", "oc-glass--flat", "oc-glass--strong");
    expect(container.querySelector(".oc-glass-panel")).toHaveClass("oc-glass-panel--strong");
  });

  it("Titlebar renders title, subtitle and labelled buttons inside a window", () => {
    const { container } = render(
      <TitlebarWindow>
        <Titlebar title="App" subtitle="Usage" bordered size="sm"><TitlebarButton label="Close" close>x</TitlebarButton></Titlebar>
        <TitlebarBody>body</TitlebarBody>
      </TitlebarWindow>,
    );
    expect(container.firstChild).toHaveClass("oc-titlebar-window");
    expect(container.querySelector("header")).toHaveClass("oc-titlebar", "oc-titlebar--bordered", "oc-titlebar--sm");
    expect(container.querySelector(".oc-titlebar__subtitle")).toHaveTextContent("Usage");
    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("oc-titlebar__btn", "oc-titlebar__btn--close");
    expect(container.querySelector(".oc-titlebar-body")).toHaveTextContent("body");
  });

  it("Progress levels, marker, size and glow", () => {
    expect(progressLevel(69, true)).toBe("default");
    expect(progressLevel(70, true)).toBe("warning");
    expect(progressLevel(90, true)).toBe("danger");
    expect(progressLevel(60, [50, 80])).toBe("warning");
    const { container } = render(<Progress value={38} max={50} size="sm" glow levels marker={10} aria-label="Week" />);
    expect(container.firstChild).toHaveClass("oc-progress", "oc-progress--sm", "oc-progress--glow");
    expect(container.querySelector(".oc-progress-bar")).toHaveClass("oc-progress-bar--warning");
    expect(container.querySelector(".oc-progress-marker")).toHaveStyle({ left: "20%" });
    const fixed = render(<Progress value={95} levels variant="success" />).container;
    expect(fixed.querySelector(".oc-progress-bar")).toHaveClass("oc-progress-bar--success");
  });

  it("Alert inline, Button inline and Prose compact add their modifier", () => {
    const { container } = render(<><Alert variant="danger" inline>Wrong</Alert><Button variant="link" inline>Reset</Button><Prose size="compact"><p>x</p></Prose></>);
    expect(container.querySelector(".oc-alert")).toHaveClass("oc-alert--danger", "oc-alert--inline");
    expect(screen.getByRole("button", { name: "Reset" })).toHaveClass("oc-btn--link", "oc-btn--inline");
    expect(container.querySelector("article")).toHaveClass("oc-prose", "oc-prose--compact");
  });
});
