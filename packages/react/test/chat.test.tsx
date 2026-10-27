// File: packages/react/test/chat.test.tsx
// Map: attachment -> message (+ list) -> message thread (send, Ctrl+Enter) -> prose -> chart line (paths equal the snippet)
// Chat and content wrappers: each renders the snippet markup (classes, roles, ids) and its small bits of behaviour.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Attachment, AttachmentImage, AttachmentList, AttachmentThumb, ChartLine, Message, MessageList, MessageThread, Prose, niceMax } from "../src";

const submit = (form: HTMLFormElement) => act(async () => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });

describe("Attachment", () => {
  it("derives the type and icon text from the file name", () => {
    const { container } = render(<Attachment name="Plan.xlsx" size="86 KB" href="#p" />);
    const chip = container.querySelector("a")!;
    expect(chip).toHaveClass("oc-attachment", "oc-attachment--sheet");
    expect(chip).toHaveAttribute("download");
    expect(container.querySelector(".oc-attachment__icon")).toHaveTextContent("XLS");
  });

  it("renders upload and error states with a remove button", () => {
    const onRemove = vi.fn();
    const { container, getByLabelText } = render(<Attachment name="Note.pdf" state="uploading" progress={65} removable onRemove={onRemove} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.tagName).toBe("DIV");
    expect(chip).toHaveClass("oc-attachment--pdf", "oc-attachment--uploading");
    expect(chip.style.getPropertyValue("--oc-attachment-progress")).toBe("65%");
    expect(container.querySelector('[role="status"]')).toHaveTextContent("Uploading… 65%");
    fireEvent.click(getByLabelText("Cancel upload of Note.pdf"));
    expect(onRemove).toHaveBeenCalled();
    const err = render(<Attachment name="IMG_2048.heic" size="Larger than 25 MB" state="error" removable />).container.firstChild;
    expect(err).toHaveClass("oc-attachment--image", "oc-attachment--error");
  });

  it("renders the list, image preview and thumbnail", () => {
    const { container } = render(<><AttachmentList stack /><AttachmentImage href="#s" alt="Sample" art={6} caption="s.jpg" /><AttachmentThumb alt="Shot" removeLabel="Remove shot.png" /></>);
    expect(container.querySelector("ul.oc-attachment-list")).toHaveClass("oc-attachment-list--stack");
    expect(container.querySelectorAll("ul li a.oc-attachment")).toHaveLength(4);
    expect(container.querySelector(".oc-attachment-image .oc-media-art--6")).toHaveAttribute("aria-label", "Sample");
    expect(container.querySelector(".oc-attachment-thumb .oc-attachment__remove")).toHaveAttribute("aria-label", "Remove shot.png");
  });
});

describe("Message", () => {
  it("renders an outgoing bubble with quote, read receipt and actions", () => {
    const onAction = vi.fn();
    const { container, getByLabelText } = render(
      <Message direction="out" continued avatar="TP" time="09:20" datetime="2026-10-14T09:20" status="read" statusIcon label="You, 09:20"
        quote={{ href: "#q", sender: "Lisa", text: "Which?" }} text="Calacatta." actions={[{ name: "reply", label: "Reply" }]} onAction={onAction} />,
    );
    const row = container.querySelector("article")!;
    expect(row).toHaveClass("oc-message", "oc-message--out", "oc-message--continued");
    expect(row).toHaveAttribute("aria-label", "You, 09:20");
    expect(container.querySelector(".oc-message__quote")).toHaveAttribute("href", "#q");
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-10-14T09:20");
    expect(container.querySelector(".oc-message__status--read svg")).not.toBeNull();
    fireEvent.click(getByLabelText("Reply"));
    expect(onAction).toHaveBeenCalledWith("reply");
  });

  it("MessageList renders the demo with dividers and groups thumbnails", () => {
    const { container } = render(<MessageList />);
    expect(container.firstChild).toHaveAttribute("role", "log");
    expect(container.querySelectorAll("article.oc-message")).toHaveLength(3);
    expect(container.querySelector(".oc-message-divider--system")).toHaveAttribute("role", "note");
    const thumbs = render(<Message avatar="SC" attachments={[{ kind: "thumb", alt: "A", art: 4 }, { kind: "thumb", alt: "B" }]} />).container;
    expect(thumbs.querySelectorAll(".oc-message__attachments > .oc-attachment-list > span.oc-attachment-thumb")).toHaveLength(2);
  });
});

describe("MessageThread", () => {
  it("renders header, menu, composer and overlay", () => {
    const { container } = render(<MessageThread id="t" busy />);
    const thread = container.querySelector("section")!;
    expect(thread).toHaveClass("oc-message-thread");
    expect(thread).toHaveAttribute("aria-labelledby", "t-title");
    expect(thread).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector(".oc-message-thread__icon-btn")).toHaveAttribute("popovertarget", "t-menu");
    expect(container.querySelector("#t-menu")).toHaveAttribute("popover");
    expect(container.querySelector(".oc-message-thread__scroll")).toHaveAttribute("aria-live", "polite");
    expect(container.querySelector("textarea")).toHaveAttribute("name", "message");
    expect(container.querySelector(".oc-message-thread__busy")).toHaveAttribute("role", "status");
  });

  it("sends with the callback and appends an outgoing bubble", async () => {
    const onSend = vi.fn();
    const { container } = render(<MessageThread id="t" onSend={onSend} />);
    const field = container.querySelector("textarea")!;
    field.value = "Fine by me";
    await submit(container.querySelector("form")!);
    expect(onSend).toHaveBeenCalledWith("Fine by me");
    const last = Array.from(container.querySelectorAll("article")).pop()!;
    expect(last).toHaveClass("oc-message--out");
    expect(last.querySelector(".oc-message__avatar")).toHaveTextContent("TP");
    expect(last.querySelector(".oc-message__status")).toHaveTextContent("Sent");
    expect(field.value).toBe("");
  });

  it("shows a note instead of the composer", () => {
    const { container } = render(<MessageThread note="Closed" menu={null} status={null} busyTitle={null} />);
    expect(container.querySelector(".oc-message-thread__note")).toHaveTextContent("Closed");
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector(".oc-message-thread__busy")).toBeNull();
  });
});

describe("Prose and ChartLine", () => {
  it("Prose renders the demo article and size modifiers", () => {
    const { container } = render(<Prose size="lg" />);
    expect(container.firstChild).toHaveClass("oc-prose", "oc-prose--lg");
    expect(container.querySelector(".oc-prose-lead")).not.toBeNull();
    expect(render(<Prose as="div" full><p>Own</p></Prose>).container.innerHTML).toBe('<div class="oc-prose oc-prose--full"><p>Own</p></div>');
  });

  it("ChartLine computes the same paths, dots and axis as the snippet", () => {
    const snippet = readFileSync(resolve(__dirname, "../../ui/snippets/chart-line.html"), "utf8");
    const expected = [...snippet.matchAll(/class="oc-chart-line__path" d="([^"]+)"/g)].map((m) => m[1]);
    const { container } = render(<ChartLine />);
    expect(Array.from(container.querySelectorAll(".oc-chart-line__path")).map((p) => p.getAttribute("d"))).toEqual(expected);
    expect(container.firstChild).toHaveClass("oc-chart-line", "oc-chart-line--dots");
    expect(Array.from(container.querySelectorAll(".oc-chart-line__y li")).map((li) => li.textContent)).toEqual(["320", "240", "160", "80", "0"]);
    const col = container.querySelector(".oc-chart-line__col")!;
    expect(col).toHaveAttribute("aria-label", "January: Desktop 186, Mobile 80");
    expect((col.querySelector(".oc-chart-line__dot") as HTMLElement).style.getPropertyValue("--y")).toBe("58.13%");
    expect(niceMax(305)).toBe(320);
    expect(render(<ChartLine variant="area" dots={false} />).container.firstChild).toHaveClass("oc-chart-line--area");
  });
});
