// File: packages/react/test/shop.test.tsx
// Map: Rating -> RatingInput -> Price (format) -> Quantity (steps, limits) -> Gallery -> Stock -> SpecList -> Ribbon -> GlassBar -> LazyImage

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "../src/components/Gallery";
import { Price } from "../src/components/Price";
import { Quantity } from "../src/components/Quantity";
import { Rating, RatingInput } from "../src/components/Rating";
import { Ribbon } from "../src/components/Ribbon";
import { GlassBar } from "../src/components/GlassBar";
import { LazyImage } from "../src/components/LazyImage";
import { SpecList } from "../src/components/SpecList";
import { Stock } from "../src/components/Stock";

describe("shop components", () => {
  it("rating shows the score as a custom property and a label", () => {
    render(<Rating value={4.5} size="sm" />);
    const stars = screen.getByRole("img", { name: "4.5 out of 5" });
    expect(stars).toHaveClass("oc-rating", "oc-rating--sm");
    expect(stars.style.getPropertyValue("--oc-rating")).toBe("4.5");
  });

  it("rating input reports the picked star", () => {
    const onChange = vi.fn();
    const { container } = render(<RatingInput legend="Your rating" defaultValue={2} onChange={onChange} />);
    expect(container.querySelectorAll(".oc-rating-input input[type=radio]")).toHaveLength(5);
    expect((screen.getByLabelText("2 stars") as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByLabelText("4 stars"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("price formats numbers with the locale and shows old price and discount", () => {
    const { container } = render(<Price amount={119} old={149} discount="-20%" note="incl. VAT" sale />);
    expect(container.querySelector(".oc-price")).toHaveClass("oc-price--sale");
    expect(container.querySelector(".oc-price__amount")?.textContent).toMatch(/119,00/);
    expect(container.querySelector(".oc-price__old")?.textContent).toMatch(/149,00/);
    expect(container.querySelector(".oc-badge")?.textContent).toBe("-20%");
  });

  it("quantity steps within min and max and disables the buttons at the limits", () => {
    const onChange = vi.fn();
    render(<Quantity defaultValue={1} min={1} max={3} onChange={onChange} />);
    const minus = screen.getByRole("button", { name: "Decrease quantity" });
    const plus = screen.getByRole("button", { name: "Increase quantity" });
    expect(minus).toBeDisabled();
    fireEvent.click(plus);
    fireEvent.click(plus);
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(plus).toBeDisabled();
    expect((screen.getByLabelText("Quantity") as HTMLInputElement).value).toBe("3");
  });

  it("gallery renders one slide and one thumbnail radio per image (max 8)", () => {
    const images = Array.from({ length: 10 }, (_, i) => ({ src: `/p${i}.svg`, alt: `Photo ${i + 1}` }));
    const { container } = render(<Gallery images={images} badge="New" side />);
    expect(container.querySelector(".oc-gallery")).toHaveClass("oc-gallery--side");
    expect(container.querySelectorAll(".oc-gallery__slide")).toHaveLength(8);
    const radios = container.querySelectorAll<HTMLInputElement>(".oc-gallery__thumb input[type=radio]");
    expect(radios).toHaveLength(8);
    expect(radios[0].checked).toBe(true);
    expect(new Set([...radios].map((r) => r.name)).size).toBe(1);
  });

  it("stock picks the default text and level", () => {
    const { container } = render(<><Stock /><Stock level="low" note="3 left" /><Stock level="out" badge /></>);
    const items = container.querySelectorAll(".oc-stock");
    expect(items[0].textContent).toBe("In stock");
    expect(items[0].hasAttribute("data-level")).toBe(false);
    expect(items[1].getAttribute("data-level")).toBe("low");
    expect(items[1].querySelector(".oc-stock__note")?.textContent).toBe(" · 3 left");
    expect(items[2]).toHaveClass("oc-stock--badge");
  });

  it("spec list renders groups and rows", () => {
    const { container } = render(<SpecList groups={[{ title: "Dimensions", rows: [{ label: "Height", value: "52 cm" }, { label: "Lamp", value: "E27", note: "max. 40 W" }] }]} />);
    expect(container.querySelector(".oc-spec-group__title")?.textContent).toBe("Dimensions");
    expect(container.querySelectorAll(".oc-spec-row")).toHaveLength(2);
    expect(container.querySelector(".oc-spec-row small")?.textContent).toBe("max. 40 W");
  });

  it("ribbon puts corner, tone and size on the band", () => {
    const { rerender } = render(<Ribbon>New</Ribbon>);
    expect(screen.getByText("New").className).toBe("oc-ribbon");
    rerender(<Ribbon corner="bottom-start" tone="success" size="lg">Paid</Ribbon>);
    expect(screen.getByText("Paid")).toHaveClass("oc-ribbon", "oc-ribbon--bottom-start", "oc-ribbon--success", "oc-ribbon--lg");
  });

  it("glass bar marks the current link and names icon-only items", () => {
    const { rerender } = render(<GlassBar items={[{ label: "Home", href: "#h", current: true }, { label: "Library", href: "#l" }]} />);
    expect(screen.getByRole("navigation", { name: "Main" })).toHaveClass("oc-glass-bar");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    rerender(<GlassBar icons label="Tools" items={[{ label: "Draw", current: true }, { label: "Text" }]} />);
    expect(screen.getByRole("navigation", { name: "Tools" })).toHaveClass("oc-glass-bar--icons");
    expect(screen.getByRole("button", { name: "Draw" })).toHaveAttribute("aria-pressed", "true");
  });

  it("lazy image keeps its box and fades in once loaded", () => {
    const { container } = render(<LazyImage src="/a.jpg" alt="A" ratio="1" preview="/a-24.webp" caption="Photo" />);
    const fig = container.querySelector("figure")!;
    const img = screen.getByRole("img", { name: "A" });
    expect(fig).toHaveClass("oc-lazy");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(fig.style.getPropertyValue("--oc-lazy-ratio")).toBe("1");
    expect(fig.style.getPropertyValue("--oc-lazy-preview")).toBe("url(/a-24.webp)");
    fireEvent.load(img);
    expect(fig).toHaveClass("is-loaded");
  });
});
