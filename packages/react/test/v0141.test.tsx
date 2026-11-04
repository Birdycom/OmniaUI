// File: packages/react/test/v0141.test.tsx
// Map: TintCard (link, tone, webicon art, arrow, meta) -> TintCard as article (lg, own icon node, no arrow)

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DefinitionList } from "../src/components/DefinitionList";
import { DocLayout } from "../src/components/DocLayout";
import { StepList } from "../src/components/StepList";
import { TintCard } from "../src/components/TintCard";

describe("0.14.1 components", () => {
  it("tint card is a link with a tone, a corner webicon, an arrow chip and a meta line", () => {
    const { container } = render(
      <TintCard href="/delivery" title="Delivery" icon="mdi-light:truck" tone="destructive" meta="12 modules">Routes on the phone</TintCard>,
    );
    const card = container.querySelector("a.oc-tint-card")!;
    expect(card).toHaveClass("oc-tint-card--destructive");
    expect(card).toHaveAttribute("href", "/delivery");
    expect(card.querySelector("iconify-icon.oc-tint-card__art")).toHaveAttribute("icon", "mdi-light:truck");
    expect(card.querySelector("h3.oc-tint-card__title")).toHaveTextContent("Delivery");
    expect(card.querySelector(".oc-tint-card__go iconify-icon")).toBeTruthy();
    expect(card.querySelector(".oc-tint-card__text")).toHaveTextContent("Routes on the phone");
    expect(card.querySelector(".oc-tint-card__meta")).toHaveTextContent("12 modules");
  });

  it("tint card without href is an article; lg, own icon node, no arrow, primary adds no tone class", () => {
    const { container } = render(<TintCard title="Reports" tone="primary" size="lg" headingLevel={2} noArrow icon={<svg data-x="1" />} />);
    const card = container.querySelector("article.oc-tint-card")!;
    expect(card.className).toBe("oc-tint-card oc-tint-card--lg");
    expect(card.querySelector("span.oc-tint-card__art svg")).toBeTruthy();
    expect(card.querySelector("h2.oc-tint-card__title")).toBeTruthy();
    expect(card.querySelector(".oc-tint-card__go")).toBeNull();
    expect(card.querySelector(".oc-tint-card__text")).toBeNull();
  });

  it("tint card fill adds the Pro shape class", () => {
    const { container } = render(<TintCard href="/a" title="A" fill size="lg" />);
    expect(container.querySelector("a")!.className).toBe("oc-tint-card oc-tint-card--lg oc-tint-card--fill");
  });

  it("doc layout puts the side column next to the text, on the right with end", () => {
    const { container } = render(<DocLayout end aside={<nav className="oc-toc" />}><p>Text</p></DocLayout>);
    const root = container.querySelector(".oc-doc-layout")!;
    expect(root).toHaveClass("oc-doc-layout--end");
    expect(root.querySelector("aside.oc-doc-layout__aside .oc-toc")).toBeTruthy();
    expect(root.querySelector(".oc-doc-layout__main")).toHaveTextContent("Text");
  });

  it("definition list as a glossary", () => {
    const { container } = render(<DefinitionList glossary items={[{ term: "Service", detail: "The software." }]} />);
    expect(container.querySelector("dl")).toHaveClass("oc-dl", "oc-dl--glossary");
  });

  it("step list renders one li per item, small", () => {
    const { container } = render(<StepList size="sm" items={["Sign in", <>Open <strong>Settings</strong></>]} />);
    const ol = container.querySelector("ol")!;
    expect(ol.className).toBe("oc-step-list oc-step-list--sm");
    expect(ol.querySelectorAll("li")).toHaveLength(2);
  });
});
