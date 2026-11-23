// File: packages/react/test/v0170-bc.test.tsx
// Map: 0.17.0 BC: HeroMedia (video / image, scrim, align, reduced-motion source) -> AspectRatio flush -> DefinitionList numbered

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroMedia } from "../src/components/HeroMedia";
import { AspectRatio } from "../src/components/AspectRatio";
import { DefinitionList } from "../src/components/DefinitionList";

describe("0.17.0 HeroMedia", () => {
  it("video: poster, muted loop, aria-hidden, source only without reduced motion, scrim start by default", () => {
    const { container } = render(<HeroMedia src="/media/loop.webm" poster="/media/loop.webp"><h1>Title</h1></HeroMedia>);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("SECTION");
    expect(root.className).toBe("oc-hero-media oc-hero-media--scrim-start");
    const video = root.querySelector("video.oc-hero-media__media") as HTMLVideoElement;
    expect(video.getAttribute("poster")).toBe("/media/loop.webp");
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(video.getAttribute("aria-hidden")).toBe("true");
    const source = video.querySelector("source")!;
    expect(source.getAttribute("src")).toBe("/media/loop.webm");
    expect(source.getAttribute("type")).toBe("video/webm");
    expect(source.getAttribute("media")).toBe("(prefers-reduced-motion: no-preference)");
    expect(root.querySelector(".oc-hero-media__content h1")!.textContent).toBe("Title");
  });

  it("image: alt, no video; scrim full / end / none and align", () => {
    const img = render(<HeroMedia src="/img/hero.webp" alt="Office of Company 1" scrim="full" align="center" className="x" />).container.firstElementChild!;
    expect(img.className).toBe("oc-hero-media oc-hero-media--scrim oc-hero-media--center x");
    expect(img.querySelector("video")).toBeNull();
    expect(img.querySelector("img.oc-hero-media__media")!.getAttribute("alt")).toBe("Office of Company 1");

    const end = render(<HeroMedia src="/img/hero.jpg" scrim="end" align="end" />).container.firstElementChild!;
    expect(end.className).toBe("oc-hero-media oc-hero-media--scrim-end oc-hero-media--end");
    expect(end.querySelector("img")!.getAttribute("alt")).toBe("");

    const none = render(<HeroMedia src="/img/hero.jpg" scrim="none" />).container.firstElementChild!;
    expect(none.className).toBe("oc-hero-media");
  });

  it("type and mediaType win over the extension", () => {
    const { container } = render(<HeroMedia src="/stream?id=1" type="video" mediaType="video/mp4" />);
    expect(container.querySelector("source")!.getAttribute("type")).toBe("video/mp4");
    const img = render(<HeroMedia src="/media/loop.mp4" type="image" />).container;
    expect(img.querySelector("video")).toBeNull();
  });
});

describe("0.17.0 AspectRatio flush and DefinitionList numbered", () => {
  it("AspectRatio flush", () => {
    const { container } = render(<AspectRatio ratio="wide" flush><img src="/img/a.webp" alt="" /></AspectRatio>);
    expect(container.firstElementChild!.className).toBe("oc-aspect oc-aspect--wide oc-aspect--flush");
    expect(render(<AspectRatio />).container.firstElementChild!.className).toBe("oc-aspect");
  });

  it("DefinitionList numbered (with glossary)", () => {
    const items = [{ term: "Plan", detail: "We listen first." }, { term: "Build", detail: "Short iterations." }];
    const { container } = render(<DefinitionList items={items} numbered glossary />);
    expect(container.querySelector("dl")!.className).toBe("oc-dl oc-dl--glossary oc-dl--numbered");
    expect(render(<DefinitionList items={items} />).container.querySelector("dl")!.className).toBe("oc-dl");
  });
});
