// File: packages/react/test/marketing.test.tsx
// Map: components (timeline, marquee, product mark, project card, link arrow, stack list, fact list, next teaser, price card)
//      -> blocks (faq, about timeline, contact grid, hero orbit, profile header, portfolio grid)
// Group D (marketing) wrappers: they must render the same classes as the HTML snippets.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  BlockAboutTimeline, BlockContactGrid, BlockFaq, BlockHeroOrbit, BlockPortfolioGrid, BlockProfileHeader,
  FactList, LinkArrow, LinkRow, Marquee, NextTeaser, PriceCard, ProductMark, ProjectCard, StackList, Timeline,
} from "../src";

describe("marketing components", () => {
  it("Timeline renders items, <time> and the current modifier", () => {
    const { container } = render(<Timeline size="lg" accent items={[{ date: "2012", dateTime: "2012", title: "Start" }, { date: "Today", text: "Now", current: true }]} />);
    const ol = container.querySelector("ol")!;
    expect(ol).toHaveClass("oc-timeline", "oc-timeline--lg", "oc-timeline--accent");
    expect(container.querySelector("time.oc-timeline__date")).toHaveAttribute("datetime", "2012");
    expect(container.querySelectorAll(".oc-timeline__item")[1]).toHaveClass("oc-timeline__item--current");
  });

  it("Marquee renders every item twice, the copy aria-hidden", () => {
    const { container } = render(<Marquee items={["A", "B"]} reverse speed="slow" aria-label="Tech" />);
    expect(container.firstChild).toHaveClass("oc-marquee", "oc-marquee--reverse", "oc-marquee--slow");
    expect(container.querySelectorAll(".oc-marquee__item")).toHaveLength(4);
    expect(container.querySelectorAll('.oc-marquee__item[aria-hidden="true"]')).toHaveLength(2);
  });

  it("ProductMark maps size, accent and style flags", () => {
    const { container } = render(<ProductMark size="xl" accent="green" soft>◆</ProductMark>);
    expect(container.firstChild).toHaveClass("oc-product-mark", "oc-product-mark--xl", "oc-product-mark--soft", "oc-accent--green");
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("ProjectCard renders the frame, placeholder and body", () => {
    render(<ProjectCard href="/p" name="Northwind" type="Website" meta="Retail" flat />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("oc-project-card", "oc-project-card--flat");
    expect(link.querySelector(".oc-project-card__bar i")).not.toBeNull();
    expect(link.querySelector("span.oc-project-card__shot")).not.toBeNull();
    expect(link.querySelector(".oc-project-card__more")).toHaveTextContent("View project");
  });

  it("LinkArrow maps direction, tone and size", () => {
    render(<LinkArrow href="/" direction="back" tone="muted" size="sm">Back</LinkArrow>);
    expect(screen.getByRole("link")).toHaveClass("oc-link-arrow", "oc-link-arrow--back", "oc-link-arrow--muted", "oc-link-arrow--sm");
  });

  it("StackList renders strings and icon items", () => {
    const { container } = render(<StackList neutral items={["PHP", { label: "Web", icon: "▦" }]} />);
    expect(container.firstChild).toHaveClass("oc-stack-list", "oc-stack-list--neutral");
    expect(container.querySelectorAll(".oc-stack-list__item")).toHaveLength(2);
    expect(container.querySelector(".oc-stack-list__icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("FactList renders dt/dd rows with modifiers", () => {
    const { container } = render(<FactList stacked accent items={[{ label: "Platform", value: "Web" }]} />);
    expect(container.firstChild).toHaveClass("oc-fact-list", "oc-fact-list--stacked", "oc-fact-list--accent");
    expect(container.querySelector("dt")).toHaveTextContent("Platform");
  });

  it("NextTeaser renders label, name and tagline", () => {
    render(<NextTeaser href="/n" name="Acme Design" tagline="Design system" prev />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("oc-next-teaser", "oc-next-teaser--prev");
    expect(link.querySelector(".oc-next-teaser__label")).toHaveTextContent("Next product");
  });

  it("PriceCard renders a radio toggle with one shared name and both prices", () => {
    const { container } = render(
      <PriceCard name="Pro" discount="Save 20%" monthly={{ amount: "€12" }} yearly={{ amount: "€115", was: "€144" }} defaultPeriod="yearly"
        features={[{ label: "A" }, { label: "B", excluded: true }]} featured />,
    );
    const radios = container.querySelectorAll<HTMLInputElement>('.oc-price-card__toggle input[type="radio"]');
    expect(radios).toHaveLength(2);
    expect(radios[0].name).toBe(radios[1].name);
    expect(radios[1].checked).toBe(true);
    expect(container.querySelector(".oc-price-card__price--yearly s")).toHaveTextContent("€144");
    expect(container.querySelector(".oc-price-card__feature--excluded")).toHaveTextContent("B");
    expect(container.firstChild).toHaveClass("oc-price-card--featured");
  });
});

describe("marketing blocks", () => {
  it("BlockFaq groups the details with one name and opens the first", () => {
    const { container } = render(<BlockFaq title="FAQ" split items={[{ question: "Q1", answer: "A1" }, { question: "Q2", answer: "A2" }]} />);
    const details = container.querySelectorAll("details.oc-accordion-item");
    expect(container.firstChild).toHaveClass("oc-block-faq", "oc-block-faq--split");
    expect(details[0].getAttribute("name")).toBeTruthy();
    expect(details[0].getAttribute("name")).toBe(details[1].getAttribute("name"));
    expect(details[0]).toHaveAttribute("open");
    expect(details[1]).not.toHaveAttribute("open");
  });

  it("BlockAboutTimeline renders the media, title and timeline", () => {
    const { container } = render(<BlockAboutTimeline title="About" reverse timeline={[{ date: "2012", text: "Start" }]}><p>Story</p></BlockAboutTimeline>);
    expect(container.firstChild).toHaveClass("oc-block-about", "oc-block-about--reverse");
    expect(container.querySelector(".oc-block-about-media")).not.toBeNull();
    expect(container.querySelector(".oc-block-about-copy .oc-timeline")).not.toBeNull();
  });

  it("BlockContactGrid renders link lines and address cards", () => {
    const { container } = render(
      <BlockContactGrid title="Contact" cards={[{ title: "Mail", icon: "✉", accent: "blue", lines: [{ text: "a@b.c", href: "mailto:a@b.c" }] }, { title: "Office", address: true, lines: [{ text: "Street 1" }] }]} />,
    );
    expect(container.querySelector("a.oc-block-contact-line")).toHaveAttribute("href", "mailto:a@b.c");
    expect(container.querySelector("address.oc-block-contact-card")).not.toBeNull();
    expect(container.querySelector(".oc-product-mark")).toHaveClass("oc-accent--blue");
  });

  it("BlockHeroOrbit spreads the marks over the ring", () => {
    const { container } = render(<BlockHeroOrbit title="Hero" code="x" />);
    const marks = container.querySelectorAll<HTMLElement>(".oc-block-orbit-mark");
    expect(marks).toHaveLength(6);
    expect(marks[1].style.getPropertyValue("--oc-orbit-angle")).toBe("60deg");
    expect(container.querySelector(".oc-code-window.oc-block-orbit-center")).not.toBeNull();
  });

  it("BlockProfileHeader marks the current tab", () => {
    render(<BlockProfileHeader name="Acme" avatar="AS" tabs={[{ label: "Home", href: "#h", current: true }, { label: "About", href: "#a" }]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("oc-block-profile-name");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });

  it("BlockPortfolioGrid renders project cards with their accent", () => {
    const { container } = render(<BlockPortfolioGrid title="Work" two projects={[{ href: "#1", name: "One", accent: "violet" }]} />);
    expect(container.firstChild).toHaveClass("oc-block-portfolio", "oc-section-pad", "oc-block-portfolio--two");
    expect(container.querySelector(".oc-block-portfolio-grid .oc-project-card")).toHaveClass("oc-accent--violet");
  });
});

describe("LinkRow", () => {
  it("renders the links with rel=noopener on external ones, tone and size", () => {
    render(<LinkRow tone="muted" size="sm" links={[{ href: "/docs", label: "Docs" }, { href: "https://github.com/acme/app", label: "Source" }]} />);
    expect(screen.getByRole("list")).toHaveClass("oc-link-row", "oc-link-row--muted", "oc-link-row--sm");
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("rel");
    expect(screen.getByRole("link", { name: "Source" })).toHaveAttribute("rel", "noopener");
  });
});
