// File: packages/react/test/content-admin.test.tsx
// Map: doc viewer -> cookie consent -> busy overlay -> dark sidebar
// Content and admin wrappers: each renders the snippet markup (classes, invoker commands, ids) and its small bits of behaviour.
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BusyOverlay, CookieConsent, DocViewer, Sidebar } from "../src";

describe("DocViewer", () => {
  it("renders the demo cards with dialogs wired by command / commandfor", () => {
    const { container } = render(<DocViewer idPrefix="dv" className="mt-2" />);
    expect(container.querySelector(".oc-doc-viewer-grid")).toHaveClass("mt-2");
    const expand = container.querySelector(".oc-doc-viewer__expand")!;
    expect(expand).toHaveAttribute("command", "show-modal");
    expect(expand).toHaveAttribute("commandfor", "dv-1");
    expect(container.querySelector(".oc-doc-viewer--video .oc-doc-viewer__open")).toHaveAttribute("commandfor", "dv-2");
    const dialog = container.querySelector("dialog#dv-1")!;
    expect(dialog).toHaveClass("oc-doc-viewer-dialog");
    expect(dialog).toHaveAttribute("closedby", "any");
    expect(dialog).toHaveAttribute("aria-labelledby", "dv-1-title");
    expect(dialog.querySelector("a[download]")).toHaveAttribute("href", "#brochure.pdf");
    expect(container.querySelector("dialog#dv-2")).toHaveClass("oc-doc-viewer-dialog--video");
  });

  it("renders real files and plain cards without a dialog", () => {
    const { container } = render(<DocViewer items={[{ label: "Plan", src: "/p.pdf" }, { label: "Photo", src: "/a.jpg", type: "image", fullscreen: false }]} />);
    expect(container.querySelector("iframe")).toHaveAttribute("src", "/p.pdf#toolbar=0&view=FitH");
    expect(container.querySelector(".oc-doc-viewer--image img")).toHaveAttribute("alt", "Photo");
    expect(container.querySelectorAll("dialog")).toHaveLength(1);
  });
});

describe("CookieConsent", () => {
  afterEach(() => localStorage.clear());

  it("renders the popover with categories and stores the choice", () => {
    const onConsent = vi.fn();
    const { container, getByText } = render(<CookieConsent bar onConsent={onConsent} />);
    const box = container.querySelector("aside")!;
    expect(box).toHaveClass("oc-cookie-consent", "oc-cookie-consent--bar");
    expect(box).toHaveAttribute("popover", "manual");
    expect(container.querySelector("[data-oc-consent-open]")).toHaveTextContent("Cookie settings");
    expect(container.querySelector('input[name="necessary"]')).toBeChecked();
    expect(container.querySelector('input[name="necessary"]')).toBeDisabled();
    fireEvent.click(getByText("Accept all"));
    expect(onConsent).toHaveBeenCalledWith(expect.objectContaining({ necessary: true, statistics: true, marketing: true }));
    expect(JSON.parse(localStorage.getItem("oc-consent")!).statistics).toBe(true);
  });

  it("reports a stored choice on load and marks manual mode", () => {
    localStorage.setItem("oc-consent", JSON.stringify({ necessary: true, statistics: false, date: "x" }));
    const onConsent = vi.fn();
    const { container } = render(<CookieConsent manual openLabel={null} onConsent={onConsent} />);
    expect(onConsent).toHaveBeenCalledWith(expect.objectContaining({ statistics: false }));
    expect(container.querySelector("aside")).toHaveAttribute("data-oc-consent-manual");
    expect(container.querySelector("[data-oc-consent-open]")).toBeNull();
  });
});

describe("BusyOverlay", () => {
  it("renders a modal dialog that Esc cannot close, with spinner or progress", () => {
    const { container, rerender } = render(<BusyOverlay id="busy" open title="Uploading" />);
    const dialog = container.querySelector("dialog")!;
    expect(dialog).toHaveClass("oc-busy-overlay");
    expect(dialog).toHaveAttribute("closedby", "none");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("aria-labelledby", "busy-title");
    expect(container.querySelector(".oc-spinner")).toHaveAttribute("role", "status");
    rerender(<BusyOverlay id="busy" open progress={40} />);
    expect(container.querySelector(".oc-progress-bar")).toHaveStyle({ width: "40%" });
  });
});

describe("Sidebar", () => {
  it("adds the dark modifier", () => {
    const { container } = render(<Sidebar dark>Items</Sidebar>);
    expect(container.firstChild).toHaveClass("oc-sidebar", "oc-sidebar--dark");
  });
});
