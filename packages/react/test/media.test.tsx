// File: packages/react/test/media.test.tsx
// Map: lightbox -> image zoom -> media thumb / card / row -> stack card -> flip card -> entity card
//      -> emoji picker -> chat composer -> terminal log -> browser frame
// Group C (media and content) wrappers: each renders the snippet markup and its small bits of behaviour.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Lightbox } from "../src/components/Lightbox";
import { Watermark } from "../src/components/Watermark";
import { LiveFrame } from "../src/components/LiveFrame";
import { ImageZoom } from "../src/components/ImageZoom";
import { MediaThumb } from "../src/components/MediaThumb";
import { MediaCard } from "../src/components/MediaCard";
import { MediaRow, MediaRowList } from "../src/components/MediaRow";
import { StackCard } from "../src/components/StackCard";
import { FlipCard } from "../src/components/FlipCard";
import { EntityCard } from "../src/components/EntityCard";
import { EmojiPicker } from "../src/components/EmojiPicker";
import { ChatComposer } from "../src/components/ChatComposer";
import { TerminalLog } from "../src/components/TerminalLog";
import { BrowserFrame } from "../src/components/BrowserFrame";

const photos = [{ alt: "Harbour" }, { alt: "Forest", caption: "Forest trail" }, { alt: "Desert" }];

describe("Lightbox", () => {
  it("renders thumbnails, slides with wrap-around links and counters", () => {
    const { container } = render(<Lightbox images={photos} title="Holiday" />);
    expect(container.querySelectorAll(".oc-lightbox-thumb")).toHaveLength(3);
    const slides = container.querySelectorAll(".oc-lightbox__slide");
    expect(slides).toHaveLength(3);
    const prev = slides[0].querySelector(".oc-lightbox__nav--prev")!.getAttribute("href")!;
    expect(prev).toBe(`#${slides[2].id}`);
    expect(slides[1].querySelector(".oc-lightbox__counter")).toHaveTextContent("2 / 3");
    expect(slides[1].querySelector(".oc-lightbox__caption")).toHaveTextContent("Forest trail");
  });

  it("opens the dialog from a thumbnail and marks a single image", () => {
    const show = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    render(<Lightbox images={photos} />);
    fireEvent.click(screen.getByRole("button", { name: "Open photo 2: Forest" }));
    expect(show).toHaveBeenCalled();
    show.mockRestore();
    const { container } = render(<Lightbox images={[photos[0]]} />);
    expect(container.querySelector("dialog")).toHaveClass("oc-lightbox oc-lightbox--single");
    expect(container.querySelector(".oc-lightbox__nav")).toBeNull();
  });
});

describe("ImageZoom", () => {
  it("writes the picked level to --oc-zoom", () => {
    const { container } = render(<ImageZoom alt="Map" />);
    const root = container.querySelector(".oc-image-zoom") as HTMLElement;
    expect(root.style.getPropertyValue("--oc-zoom")).toBe("1");
    fireEvent.click(screen.getByLabelText("200%"));
    expect(root.style.getPropertyValue("--oc-zoom")).toBe("2");
  });
});

describe("Media thumb, card and row", () => {
  it("MediaThumb renders a link with duration, badge and progress", () => {
    const { container } = render(<MediaThumb href="/v/1" duration="12:04" badge="LIVE" live progress={40} watched />);
    const a = container.querySelector("a.oc-media-thumb")!;
    expect(a).toHaveClass("is-watched");
    expect(a.querySelector(".oc-media-thumb__badge--live")).toHaveTextContent("LIVE");
    expect(a.querySelector("progress")!.getAttribute("value")).toBe("40");
  });

  it("MediaCard wires the menu button to its popover", () => {
    const { container } = render(<MediaCard title="Cabin" href="/v/2" avatar="NS" meta="North Studio" menu={<a className="oc-dropdown-item" href="#">Share</a>} />);
    const btn = container.querySelector(".oc-media-card__menu")!;
    const menu = container.querySelector(".oc-dropdown-menu")!;
    expect(btn.getAttribute("popovertarget")).toBe(menu.id);
    expect(screen.getByRole("link", { name: "Cabin" })).toHaveAttribute("href", "/v/2");
  });

  it("MediaRowList numbered renders an ol and MediaRow marks the current item", () => {
    const { container } = render(<MediaRowList numbered><MediaRow title="Part 2" href="#" current /></MediaRowList>);
    expect(container.querySelector("ol")).toHaveClass("oc-media-row-list oc-media-row-list--numbered");
    expect(container.querySelector(".oc-media-row")).toHaveAttribute("aria-current", "true");
  });
});

describe("StackCard and EntityCard", () => {
  it("StackCard renders the deck with a count", () => {
    const { container } = render(<StackCard title="Course" href="#" count="12 videos" panel />);
    expect(container.querySelector(".oc-stack-card")).toHaveClass("oc-stack-card--panel");
    expect(container.querySelector(".oc-stack-card__deck .oc-stack-card__count")).toHaveTextContent("12 videos");
  });

  it("EntityCard renders glyph and facts", () => {
    const { container } = render(<EntityCard title="Ankh" glyph="☥" facts={[["Code", "S34"]]} size="sm" />);
    expect(container.querySelector(".oc-entity-card")).toHaveClass("oc-entity-card--sm");
    expect(container.querySelector(".oc-entity-card__glyph")).toHaveTextContent("☥");
    expect(container.querySelector(".oc-entity-card__facts dd")).toHaveTextContent("S34");
  });
});

describe("FlipCard", () => {
  it("toggles through the checkbox and reports the change", () => {
    const onChange = vi.fn();
    const { container } = render(<FlipCard front="Q" back="A" onFlippedChange={onChange} />);
    fireEvent.click(container.querySelector(".oc-flip-card__toggle")!);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("hover mode is focusable and manual mode uses .is-flipped", () => {
    const { container, rerender } = render(<FlipCard front="Q" back="A" trigger="hover" />);
    expect(container.firstElementChild).toHaveClass("oc-flip-card--hover");
    expect(container.firstElementChild).toHaveAttribute("tabindex", "0");
    rerender(<FlipCard front="Q" back="A" trigger="manual" flipped />);
    expect(container.firstElementChild).toHaveClass("is-flipped");
  });
});

describe("EmojiPicker and ChatComposer", () => {
  it("EmojiPicker calls onSelect with the emoji", () => {
    const onSelect = vi.fn();
    render(<EmojiPicker groups={[{ label: "Hands", emojis: ["👍"] }]} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "👍" }));
    expect(onSelect).toHaveBeenCalledWith("👍");
    expect(screen.getByRole("button", { name: "Insert emoji" }).getAttribute("popovertarget")).toBeTruthy();
  });

  it("ChatComposer sends trimmed text and clears the field", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);
    const field = screen.getByLabelText("Message") as HTMLTextAreaElement;
    fireEvent.change(field, { target: { value: "  hello  " } });
    fireEvent.submit(field.form!);
    expect(onSend).toHaveBeenCalledWith("hello");
    expect(field.value).toBe("");
  });
});

describe("TerminalLog and BrowserFrame", () => {
  it("TerminalLog renders levels, times and a prompt", () => {
    const { container } = render(<TerminalLog title="scan" status="Live" prompt lines={[{ level: "warn", message: "Header missing", time: "09:41" }, { level: "success", message: "Done" }]} />);
    expect(container.querySelector(".oc-terminal-log__body")).toHaveAttribute("role", "log");
    expect(container.querySelector(".oc-terminal-log__line--warn .oc-terminal-log__time")).toHaveTextContent("09:41");
    expect(container.querySelector(".oc-terminal-log__line--success .oc-terminal-log__level")).toHaveTextContent("ok");
    expect(container.querySelector(".oc-terminal-log__prompt")).toBeInTheDocument();
  });

  it("BrowserFrame renders the address and live children", () => {
    const { container } = render(<BrowserFrame url="example.com" dark tilt><p>Live</p></BrowserFrame>);
    expect(container.querySelector("figure")).toHaveClass("oc-browser-frame oc-browser-frame--dark oc-browser-frame--tilt");
    expect(container.querySelector(".oc-browser-frame__address")).toHaveTextContent("example.com");
    expect(container.querySelector(".oc-browser-frame__view")).toHaveTextContent("Live");
  });
});

describe("Watermark", () => {
  it("renders a click-through, aria-hidden layer with the text once, or tiled", () => {
    const { container, rerender } = render(<div className="relative"><Watermark text="Draft" variant="straight" tone="destructive" /></div>);
    const layer = container.querySelector(".oc-watermark")!;
    expect(layer).toHaveClass("oc-watermark--straight", "oc-watermark--destructive");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer.querySelectorAll(":scope > span")).toHaveLength(1);
    expect(layer).toHaveTextContent("Draft");
    rerender(<div className="relative"><Watermark variant="tile" repeat={6} /></div>);
    const tiled = container.querySelector(".oc-watermark")!;
    expect(tiled).toHaveClass("oc-watermark--tile");
    expect(tiled.querySelectorAll(":scope > span")).toHaveLength(6);
    expect(tiled.querySelector("span")).toHaveTextContent("Concept");
  });
});

describe("Watermark with a logo", () => {
  it("puts an <img> logo straight in the layer, gray with mono, and tiles it", () => {
    const { container } = render(<div className="relative"><Watermark text={<img src="/logo.svg" alt="" />} variant="tile" repeat={3} mono /></div>);
    const layer = container.querySelector(".oc-watermark")!;
    expect(layer).toHaveClass("oc-watermark--mono", "oc-watermark--tile");
    expect(layer.querySelectorAll(":scope > img")).toHaveLength(3);
    expect(layer.querySelector(":scope > span")).toBeNull();
  });
});

describe("LiveFrame", () => {
  it("sets the virtual size, renders the iframe and the browser-frame and static classes", () => {
    const { container, rerender } = render(<LiveFrame src="/demo" title="Demo" width={1680} height={1400} static inBrowserFrame />);
    const frame = container.querySelector(".oc-live-frame") as HTMLElement;
    expect(frame).toHaveClass("oc-browser-frame__view", "oc-live-frame--static");
    expect(frame.style.getPropertyValue("--oc-live-w")).toBe("1680");
    expect(frame.style.getPropertyValue("--oc-live-h")).toBe("1400");
    const iframe = frame.querySelector("iframe")!;
    expect(iframe).toHaveAttribute("src", "/demo");
    expect(iframe).toHaveAttribute("title", "Demo");
    expect(iframe).toHaveAttribute("tabindex", "-1");
    rerender(<LiveFrame><img src="/shot.png" alt="Shot" /></LiveFrame>);
    const plain = container.querySelector(".oc-live-frame") as HTMLElement;
    expect(plain.style.getPropertyValue("--oc-live-w")).toBe("1280");
    expect(plain.querySelector("iframe")).toBeNull();
    expect(plain.querySelector("img")).toHaveAttribute("alt", "Shot");
  });
});
