// File: packages/react/test/v0170-w2.test.tsx
// Map: paper -> footerbar -> tag list -> toc -> expandable table + show more -> demo panel -> product card -> badge source
//      -> icon list -> shot grid + browser frame mark -> tree icon/actions -> timeline compact -> table compact footer span
//      -> color select title -> alert dialog discard -> phone input dial

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Paper, PaperLift } from "../src/components/Paper";
import { Footerbar } from "../src/components/Footerbar";
import { TagList } from "../src/components/TagList";
import { Toc } from "../src/components/Toc";
import { ExpandableTable, ShowMore } from "../src/components/ExpandableTable";
import { DemoPanel } from "../src/components/DemoPanel";
import { ProductCard } from "../src/components/ProductCard";
import { BadgeSource } from "../src/components/BadgeSource";
import { IconList } from "../src/components/IconList";
import { ShotGrid } from "../src/components/ShotGrid";
import { BrowserFrame } from "../src/components/BrowserFrame";
import { Tree } from "../src/components/Tree";
import { Timeline } from "../src/components/Timeline";
import { TableCompact } from "../src/components/TableCompact";
import { ColorSelect } from "../src/components/ColorSelect";
import { AlertDialog } from "../src/components/AlertDialog";
import { PhoneInput } from "../src/components/PhoneInput";

describe("0.17.0 W2 paper", () => {
  it("classes follow the snippet order", () => {
    const { container } = render(<Paper sheet lined margin><p>Notes</p></Paper>);
    expect(container.firstElementChild!.className).toBe("oc-paper oc-paper--sheet oc-paper--lined oc-paper--margin");
  });
  it("tone, squares, edge in a lift, theme on a section", () => {
    const { container } = render(<><PaperLift><Paper sheet edge="torn" tone="kraft" squares /></PaperLift><Paper as="section" theme /></>);
    expect(container.querySelector(".oc-paper-lift > div")!.className).toBe("oc-paper oc-paper--kraft oc-paper--sheet oc-paper--grid oc-paper--torn");
    expect(container.querySelector("section")!.className).toBe("oc-paper-theme oc-paper");
  });
});

describe("0.17.0 W2 footerbar", () => {
  it("plain text and split with links", () => {
    const { container } = render(<><Footerbar>Version 1</Footerbar><Footerbar dark split tall links={[{ href: "/privacy", label: "Privacy" }]}>© 2026 Company 1</Footerbar></>);
    const [plain, split] = container.querySelectorAll("footer");
    expect(plain.className).toBe("oc-footerbar");
    expect(plain.textContent).toBe("Version 1");
    expect(split.className).toBe("oc-footerbar oc-footerbar--dark oc-footerbar--split oc-footerbar--tall");
    expect(split.querySelector(":scope > span")!.textContent).toBe("© 2026 Company 1");
    expect(split.querySelector("ul.oc-footerbar-links a")!.getAttribute("href")).toBe("/privacy");
  });
});

describe("0.17.0 W2 tag list", () => {
  it("items, neutral and lg", () => {
    const { container } = render(<TagList neutral size="lg" aria-label="Brands" items={["Brand 1", "Brand 2"]} />);
    expect(container.querySelector("ul")!.className).toBe("oc-tag-list oc-tag-list--neutral oc-tag-list--lg");
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});

describe("0.17.0 W2 toc", () => {
  it("title, sub items and current link", () => {
    const { container } = render(<Toc spy={false} title="On this page" items={[{ href: "#a", label: "A" }, { href: "#b", label: "B", sub: true, current: true }]} />);
    const nav = container.querySelector("nav.oc-toc")!;
    expect(nav.getAttribute("aria-label")).toBe("On this page");
    expect(nav.querySelector(".oc-toc-title")!.textContent).toBe("On this page");
    expect(nav.querySelector("li.oc-toc-item--sub a.oc-toc-link")!.getAttribute("aria-current")).toBe("true");
  });
  it("groups give a label above each list (the spy starts without errors)", () => {
    const { container } = render(<><h2 id="doc-a">A</h2><Toc groups={[{ label: "Articles", items: [{ href: "#doc-a", label: "1" }] }, { label: "Annexes", items: [{ href: "#doc-b", label: "2" }] }]} /></>);
    expect([...container.querySelectorAll(".oc-toc-group-label")].map((p) => p.textContent)).toEqual(["Articles", "Annexes"]);
    expect(container.querySelectorAll("ul.oc-toc-list")).toHaveLength(2);
  });
});

describe("0.17.0 W2 expandable table", () => {
  it("dims the last visible row and hides the rest", () => {
    const rows = [1, 2, 3, 4].map((n) => ({ name: `Row ${n}` }));
    const { container } = render(<ExpandableTable visible={2} columns={[{ key: "name", label: "Name" }]} rows={rows} />);
    const trs = container.querySelectorAll("tbody tr");
    expect([...trs].map((tr) => tr.className)).toEqual(["", "oc-expandable-table__row-dimmed", "oc-expandable-table__row-more", "oc-expandable-table__row-more"]);
    expect(container.querySelector("table")!.className).toBe("oc-table-ref");
    expect(container.querySelector("label")!.className).toBe("oc-btn oc-btn--secondary oc-expandable-table__trigger");
    expect(container.querySelector(".oc-expandable-table__wrap")!.className).toBe("oc-expandable-table__wrap oc-expandable-table__wrap--full");
    expect(container.querySelector("input.oc-expandable-table__toggle")).not.toBeNull();
  });
  it("show more: extra text behind a toggle button", () => {
    const { container } = render(<ShowMore extra="Extra"><p>Short</p></ShowMore>);
    expect(container.querySelector(".oc-showmore > .oc-showmore__extra")!.textContent).toBe("Extra");
    expect(container.querySelector("label")!.className).toBe("oc-btn oc-btn--outline oc-btn--toggle");
    expect(container.querySelector(".oc-btn-toggle__on")!.textContent).toBe("Show less");
  });
});

describe("0.17.0 W2 demo panel", () => {
  it("tabs: two radios in one group, preview and code", () => {
    const { container } = render(<DemoPanel name="v1" code={"<button>Save</button>"}><button>Save</button></DemoPanel>);
    expect(container.firstElementChild!.className).toBe("oc-demo oc-demo--tabs");
    const radios = container.querySelectorAll<HTMLInputElement>(".oc-demo__tab input[type=radio]");
    expect(radios).toHaveLength(2);
    expect(radios[0].name).toBe("v1");
    expect(radios[0].checked).toBe(true);
    expect(container.querySelector(".oc-demo__code pre.oc-code-window__body code")!.textContent).toBe("<button>Save</button>");
  });
  it("stacked without tabs", () => {
    const { container } = render(<DemoPanel tabs={false} title="Buttons" tall>x</DemoPanel>);
    expect(container.firstElementChild!.className).toBe("oc-demo");
    expect(container.querySelector(".oc-demo__tablist")).toBeNull();
    expect(container.querySelector(".oc-demo__preview")!.className).toBe("oc-demo__preview oc-demo__preview--tall");
  });
});

describe("0.17.0 W2 product card", () => {
  it("link card with badge, fly-in and its own offset", () => {
    const { container } = render(<ProductCard href="#p2" name="Product 2" badge="New" tagline="Quotes in minutes" more="Read more" accent="green" fly flyX="-40px">From quote to invoice.</ProductCard>);
    const a = container.querySelector("a")!;
    expect(a.className).toContain("oc-product-card oc-reveal--fly oc-accent--green");
    expect(a.style.getPropertyValue("--oc-fly-x")).toBe("-40px");
    expect(a.querySelector("h3.oc-product-card__name .oc-product-card__badge.oc-pill.oc-pill--accent")!.textContent).toBe("New");
    expect(a.querySelector(".oc-product-card__summary")!.textContent).toBe("From quote to invoice.");
    // Without IntersectionObserver (jsdom) fly.js shows the card at once.
    expect(a.classList.contains("is-visible")).toBe(true);
  });
  it("without href an article, no fly class", () => {
    const { container } = render(<ProductCard name="Product 1" />);
    expect(container.querySelector("article")!.className).toBe("oc-product-card");
  });
});

describe("0.17.0 W2 badge source", () => {
  it("source, file and scss", () => {
    const { container } = render(<><BadgeSource>Component</BadgeSource><BadgeSource kind="file">snippets/badge.html</BadgeSource><BadgeSource kind="scss">_badges.scss</BadgeSource></>);
    expect([...container.querySelectorAll("span")].map((s) => s.className)).toEqual(["oc-badge-source", "oc-badge-source-file", "oc-badge-source-scss"]);
  });
});

describe("0.17.0 W2 icon list", () => {
  it("rows, points with tiles and the accent list", () => {
    const { container } = render(<>
      <IconList items={[{ icon: <svg data-x="" />, text: "Reports" }]} />
      <IconList variant="points" accent="violet" items={[{ icon: <svg />, title: "Own server", text: "Data stays." }]} />
      <IconList variant="accent" items={[{ text: "Drag a shift" }]} />
    </>);
    const [rows, points, accent] = container.querySelectorAll("ul");
    expect(rows.className).toBe("oc-icon-list");
    expect(rows.querySelector("li > svg")).not.toBeNull();
    expect(points.className).toBe("oc-icon-list oc-icon-list--points");
    expect(points.querySelector(".oc-icon-tile")!.className).toBe("oc-icon-tile oc-icon-tile--sm oc-accent--violet");
    expect(points.querySelector(".oc-icon-list__title")!.textContent).toBe("Own server");
    expect(accent.className).toBe("oc-list--accent");
  });
});

describe("0.17.0 W2 shot grid", () => {
  it("figures with a link and a caption; min width as a variable", () => {
    const { container } = render(<ShotGrid min="14rem" items={[{ src: "/a.jpg", alt: "A", caption: "Dashboard" }, { src: "/b.jpg", alt: "B", href: false }]} />);
    const grid = container.querySelector(".oc-shot-grid") as HTMLElement;
    expect(grid.style.getPropertyValue("--oc-shot-min")).toBe("14rem");
    const [first, second] = grid.querySelectorAll("figure.oc-shot");
    expect(first.querySelector("a")!.getAttribute("href")).toBe("/a.jpg");
    expect(first.querySelector("figcaption")!.textContent).toBe("Dashboard");
    expect(second.querySelector("a")).toBeNull();
  });
  it("browser frame glow and mark", () => {
    const { container } = render(<BrowserFrame glow mark={<span>M</span>} src="/a.jpg" />);
    expect(container.querySelector("figure")!.className).toBe("oc-browser-frame oc-browser-frame--glow");
    expect(container.querySelector("figure > .oc-browser-frame__mark")).not.toBeNull();
  });
});

describe("0.17.0 W2 tree", () => {
  it("action list renders icon buttons; a click calls the handler", () => {
    const rename = vi.fn();
    const { container } = render(<Tree items={[{ label: "Quote v2.pdf", icon: <svg />, actions: [{ label: "Rename Quote v2.pdf", text: "Rename", onClick: rename }] }]} />);
    const btn = container.querySelector(".oc-tree-actions button.oc-table-actions-icon")!;
    expect(btn.getAttribute("aria-label")).toBe("Rename Quote v2.pdf");
    fireEvent.click(btn);
    expect(rename).toHaveBeenCalledOnce();
    expect(container.querySelector(".oc-tree-icon svg")).not.toBeNull();
  });
  it("an array of nodes stays nodes", () => {
    const { container } = render(<Tree items={[{ label: "A", actions: [<button key="1" className="own">x</button>] }]} />);
    expect(container.querySelector(".oc-tree-actions button.own")).not.toBeNull();
  });
});

describe("0.17.0 W2 timeline compact", () => {
  it("strong + span rows", () => {
    const { container } = render(<Timeline compact items={[{ date: "2012", text: "Company founded" }]} />);
    expect(container.querySelector("li")!.outerHTML).toBe("<li><strong>2012</strong><span>Company founded</span></li>");
  });
});

describe("0.17.0 W2 table compact footer span", () => {
  it("first footer cell spans two columns", () => {
    const columns = [{ key: "item", label: "Item" }, { key: "qty", label: "Qty", numeric: true }, { key: "price", label: "Price", numeric: true }];
    const { container } = render(<TableCompact columns={columns} rows={[]} footer={{ item: "Total", price: "€ 1,325.00" }} footerSpan={2} />);
    const tds = container.querySelectorAll("tfoot td");
    expect(tds).toHaveLength(2);
    expect(tds[0].getAttribute("colspan")).toBe("2");
    expect(tds[1].hasAttribute("data-numeric")).toBe(true);
  });
});

describe("0.17.0 W2 color select", () => {
  it("disabled option with a title", () => {
    const { container } = render(<ColorSelect options={[{ value: "p", label: "Purple", color: "var(--color-purple-50)", disabled: true, title: "Purple, in use" }]} />);
    expect(container.querySelector("label")!.getAttribute("title")).toBe("Purple, in use");
    expect(container.querySelector("input")!.disabled).toBe(true);
  });
});

describe("0.17.0 W2 alert dialog discard", () => {
  it("third button at the start of the footer", () => {
    const onDiscard = vi.fn();
    const { container } = render(<AlertDialog defaultOpen title="Save?" discardLabel="Don't save" onDiscard={onDiscard} footer={<button className="oc-btn">Save</button>} />);
    const footer = container.querySelector(".oc-modal-footer")!;
    const first = footer.firstElementChild!;
    expect(first.className).toBe("oc-btn oc-btn--ghost oc-alert-dialog-discard");
    fireEvent.click(first);
    expect(onDiscard).toHaveBeenCalledOnce();
  });
});

describe("0.17.0 W2 phone input dial", () => {
  it("controlled dial code, onDialChange and a form name", () => {
    const onDial = vi.fn();
    const { container } = render(<PhoneInput dial="+31" onDialChange={onDial} dialName="phone_dial" />);
    const select = container.querySelector("select")!;
    expect(select.value).toBe("+31");
    expect(select.getAttribute("name")).toBe("phone_dial");
    fireEvent.change(select, { target: { value: "+49" } });
    expect(onDial).toHaveBeenCalledWith("+49");
  });
});
