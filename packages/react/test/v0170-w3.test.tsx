// File: packages/react/test/v0170-w3.test.tsx
// Map: tabs (variant, buttons mode, icons + counts) -> card footer -> accordion flush + group -> version banner href/short -> theme toggle text
//      -> navmenu site -> stat card button -> dropdown own trigger -> live frame src + children -> barcode input error/no preview
//      -> name card renamable -> lazy image placeholder/thumb -> price card group label -> tint card title link

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "../src/components/Tabs";
import { Card, CardFooter } from "../src/components/Card";
import { Accordion, AccordionItem } from "../src/components/Accordion";
import { VersionBanner } from "../src/components/VersionBanner";
import { ThemeToggle } from "../src/components/HeaderSettings";
import { Navmenu } from "../src/components/Navmenu";
import { StatCard } from "../src/components/StatCard";
import { Dropdown, DropdownItem } from "../src/components/Dropdown";
import { LiveFrame } from "../src/components/LiveFrame";
import { BarcodeInput } from "../src/components/BarcodeInput";
import { NameCard } from "../src/components/NameCard";
import { LazyImage } from "../src/components/LazyImage";
import { PriceCard } from "../src/components/PriceCard";
import { TintCard } from "../src/components/TintCard";

const tabs = [
  { value: "all", label: "All", content: "All relations", icon: "mdi:account-group-outline", count: 11 },
  { value: "customers", label: "Customers", content: "Customer 1", count: 5, countTone: "success" as const },
  { value: "ral", label: "RAL palette", content: "RAL", disabled: true },
];

describe("tabs", () => {
  it("variant on the tab list, radio mode by default", () => {
    const { container } = render(<Tabs name="t1" variant="pill" tabs={[{ value: "a", label: "A", content: "1" }, { value: "b", label: "B", content: "2" }]} />);
    expect(container.querySelector(".oc-tabset > .oc-tab-list.oc-tab-list--pill")).not.toBeNull();
    expect(container.querySelectorAll("input[type=radio][name=t1]")).toHaveLength(2);
    const v = render(<Tabs variant="vertical" tabs={[{ value: "a", label: "A", content: "1" }]} />);
    expect(v.container.querySelector(".oc-tab-list--vertical")).not.toBeNull();
  });

  it("buttons mode: role=tab, aria-selected, .is-active panel, disabled, counts", () => {
    const onChange = vi.fn();
    const { container } = render(<Tabs mode="buttons" name="rel" listLabel="Relation type" tabs={tabs} onChange={onChange} />);
    expect(container.querySelector(".oc-tabset")).toBeNull();
    const list = container.querySelector(".oc-tab-list")!;
    expect(list.className).toContain("oc-data-table-tabs");
    expect(list.getAttribute("aria-label")).toBe("Relation type");
    const buttons = container.querySelectorAll<HTMLButtonElement>("button[role=tab]");
    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute("aria-selected")).toBe("true");
    expect(buttons[0].getAttribute("aria-controls")).toBe("rel-1");
    expect(buttons[0].querySelector("[data-webicon], svg, iconify-icon")).not.toBeNull();
    expect(buttons[1].querySelector(".oc-data-table-tab-count.oc-data-table-tab-count--success")!.textContent).toBe("5");
    expect(buttons[2].disabled).toBe(true);
    expect(container.querySelector("#rel-1")!.className).toBe("oc-tab-panel is-active");
    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalledWith("customers");
    expect(buttons[1].getAttribute("aria-selected")).toBe("true");
    expect(container.querySelector("#rel-2")!.className).toContain("is-active");
    expect(container.querySelector("#rel-1")!.className).not.toContain("is-active");
  });
});

describe("card footer", () => {
  it("divider and end", () => {
    const { container } = render(<Card><CardFooter divider end>x</CardFooter></Card>);
    expect(container.querySelector(".oc-card-footer")!.className).toBe("oc-card-footer oc-card-footer--divider oc-card-footer--end");
    const plain = render(<CardFooter />);
    expect(plain.container.firstElementChild!.className).toBe("oc-card-footer");
  });
});

describe("accordion", () => {
  it("flush and a group name for all items; items stay ungrouped without it", () => {
    const { container } = render(
      <Accordion flush name="faq"><AccordionItem title="A">1</AccordionItem><AccordionItem title="B" name="own">2</AccordionItem></Accordion>,
    );
    expect(container.querySelector(".oc-accordion")!.className).toBe("oc-accordion oc-accordion--flush");
    const items = container.querySelectorAll("details");
    expect(items[0].getAttribute("name")).toBe("faq");
    expect(items[1].getAttribute("name")).toBe("own");
    const multi = render(<Accordion><AccordionItem title="A">1</AccordionItem><AccordionItem title="B">2</AccordionItem></Accordion>);
    for (const d of multi.container.querySelectorAll("details")) expect(d.hasAttribute("name")).toBe(false);
  });
});

describe("version banner", () => {
  it("own href for the action and no short text when empty", () => {
    const { container } = render(<VersionBanner version="v0.6.0" href="/changelog" actionLabel="What's new" short="" tone="success" />);
    expect(container.querySelector("a.oc-version-banner-action")!.getAttribute("href")).toBe("/changelog");
    expect(container.querySelector(".oc-version-banner-short")).toBeNull();
    const def = render(<VersionBanner version="v0.6.0" />);
    expect(def.container.querySelector(".oc-version-banner-short")!.textContent).toBe("New version");
  });
});

describe("theme toggle", () => {
  it("text: icon and the theme name, no tooltip", () => {
    const { container } = render(<ThemeToggle value="light" text ghost={false} />);
    const b = container.querySelector("button")!;
    expect(b.className).toBe("oc-btn oc-btn--outline");
    expect(b.hasAttribute("data-tooltip")).toBe(false);
    expect(b.textContent).toContain("Dark theme");
    const icon = render(<ThemeToggle value="dark" />);
    expect(icon.container.querySelector("button")!.className).toBe("oc-btn oc-btn--icon oc-tooltip oc-tooltip--bottom oc-btn--ghost");
  });
});

describe("navmenu", () => {
  it("site variant", () => {
    const { container } = render(<Navmenu variant="site"><li /></Navmenu>);
    expect(container.querySelector("ul")!.className).toBe("oc-navmenu oc-navmenu--site");
  });
});

describe("stat card", () => {
  it("button without onClick", () => {
    const { container } = render(<StatCard button value="3" label="Open" tone="warning" stripe popoverTarget="m1" />);
    const b = container.querySelector("button.oc-stat-card")!;
    expect(b.getAttribute("type")).toBe("button");
    expect(b.className).toBe("oc-stat-card oc-stat-card--warning oc-stat-card--stripe");
    expect(b.getAttribute("popovertarget")).toBe("m1");
  });
});

describe("dropdown", () => {
  it("renderTrigger: your own trigger with popoverTarget", () => {
    const { container } = render(
      <Dropdown id="bc-more" renderTrigger={({ props }) => <button type="button" className="oc-breadcrumb-ellipsis" aria-label="Show 3 more levels" {...props}>…</button>}>
        <DropdownItem href="/relations">Relations</DropdownItem>
      </Dropdown>,
    );
    expect(container.querySelector(".oc-btn")).toBeNull();
    expect(container.querySelector("button.oc-breadcrumb-ellipsis")!.getAttribute("popovertarget")).toBe("bc-more");
    expect(container.querySelector("#bc-more.oc-dropdown-menu")).not.toBeNull();
  });
});

describe("live frame", () => {
  it("src and children together", () => {
    const { container } = render(<LiveFrame src="/samples/company-1.html" title="Preview" static><span className="oc-watermark">Concept</span></LiveFrame>);
    const frame = container.querySelector(".oc-live-frame")!;
    expect(frame.querySelector("iframe")).not.toBeNull();
    expect(frame.lastElementChild!.className).toBe("oc-watermark");
  });
});

describe("barcode input", () => {
  it("error text in the preview and no preview", () => {
    const { container } = render(<BarcodeInput defaultValue="54123" error errorText="Use 8 or 13 digits" aria-label="Barcode" />);
    expect(container.querySelector(".oc-barcode-preview")!.className).toContain("oc-barcode-preview--empty");
    expect(container.querySelector(".oc-barcode-preview-code")!.textContent).toBe("Use 8 or 13 digits");
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
    const bare = render(<BarcodeInput hidePreview aria-label="Barcode" />);
    expect(bare.container.querySelector("figure")).toBeNull();
    const ok = render(<BarcodeInput defaultValue="5412345678908" errorText="Use 8 or 13 digits" aria-label="Barcode" />);
    expect(ok.container.querySelector(".oc-barcode-preview-code")!.textContent).toBe("5412345678908");
  });
});

describe("name card", () => {
  it("renamable shows the pencil without onRename", () => {
    const { container } = render(<NameCard name="Kitchen" renamable />);
    expect(container.querySelector("[data-oc-rename]")).not.toBeNull();
    const none = render(<NameCard name="Kitchen" />);
    expect(none.container.querySelector("[data-oc-rename]")).toBeNull();
  });
});

describe("lazy image", () => {
  it("placeholder without src, thumb", () => {
    const { container } = render(<LazyImage alt="Loading" preview="/img/tiny.jpg" />);
    const fig = container.querySelector("figure.oc-lazy")!;
    expect(fig.querySelector("img")).toBeNull();
    expect(fig.getAttribute("role")).toBe("img");
    expect(fig.getAttribute("aria-label")).toBe("Loading");
    const thumb = render(<LazyImage thumb src="/img/p1.svg" alt="" width={40} height={40} />);
    expect(thumb.container.querySelector("figure")!.className).toBe("oc-lazy oc-lazy--thumb");
    expect(thumb.container.querySelector("img")).not.toBeNull();
  });
});

describe("price card", () => {
  it("group name and group label", () => {
    const { container } = render(<PriceCard name="Starter" group="oc-price-starter" groupLabel="Billing period, Starter" monthly={{ amount: "€5" }} yearly={{ amount: "€50" }} />);
    expect(container.querySelector(".oc-price-card__toggle")!.getAttribute("aria-label")).toBe("Billing period, Starter");
    expect(container.querySelectorAll("input[name=oc-price-starter]")).toHaveLength(2);
    const def = render(<PriceCard name="Plan" monthly={{ amount: "€5" }} yearly={{ amount: "€50" }} />);
    expect(def.container.querySelector(".oc-price-card__toggle")!.getAttribute("aria-label")).toBe("Billing period");
  });
});

describe("tint card", () => {
  it("titleHref: a title link while the card is an article", () => {
    const { container } = render(<TintCard title="Backup" titleHref="#backup" tone="info">Text</TintCard>);
    expect(container.querySelector("article.oc-tint-card")).not.toBeNull();
    const a = container.querySelector(".oc-tint-card__title > a.oc-tint-card__link")!;
    expect(a.getAttribute("href")).toBe("#backup");
    expect(a.textContent).toBe("Backup");
  });
});
