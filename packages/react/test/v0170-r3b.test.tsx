// File: packages/react/test/v0170-r3b.test.tsx
// Map: 0.17.0 round 3 B: docs sidebar -> section block / header + version badge -> icon list extras -> shot lightbox
//      -> browser frame body -> checklist check variant

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sidebar, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../src/components/Sidebar";
import { SectionBlock, SectionHeader } from "../src/components/SectionBlock";
import { VersionBadge } from "../src/components/BadgeSource";
import { IconList } from "../src/components/IconList";
import { Shot, ShotGrid } from "../src/components/ShotGrid";
import { BrowserFrame } from "../src/components/BrowserFrame";
import { Checklist } from "../src/components/Checklist";

describe("Sidebar docs variant", () => {
  it("renders nav.oc-sidebar--docs with title, plain group labels, text links and a sub list", () => {
    const { container } = render(
      <Sidebar variant="docs" title="Docs" aria-label="Docs">
        <SidebarGroup label="Layout">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/flexbox" active>Flexbox</SidebarMenuButton>
              <SidebarMenu sub>
                <SidebarMenuItem><SidebarMenuButton href="/gap" current>Gap</SidebarMenuButton></SidebarMenuItem>
              </SidebarMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </Sidebar>,
    );
    const nav = container.firstElementChild!;
    expect(nav.tagName).toBe("NAV");
    expect(nav.className).toBe("oc-sidebar oc-sidebar--docs");
    expect(nav.querySelector("h2.oc-sidebar-title")?.textContent).toBe("Docs");
    expect(nav.querySelector(".oc-sidebar-content, .oc-sidebar-group")).toBeNull();
    expect(nav.children[1].outerHTML).toBe('<p class="oc-sidebar-group-label">Layout</p>');
    const parent = nav.querySelector('a[href="/flexbox"]')!;
    expect(parent.className).toBe("oc-sidebar-menu-button is-active");
    expect(parent.innerHTML).toBe("Flexbox");
    expect(parent.hasAttribute("data-tooltip")).toBe(false);
    expect(nav.querySelector("ul.oc-sidebar-menu-sub a")?.getAttribute("aria-current")).toBe("page");
  });

  it("keeps the app sidebar as before", () => {
    const { container } = render(
      <Sidebar>
        <SidebarGroup label="Platform"><SidebarMenu><li><SidebarMenuButton href="/">Home</SidebarMenuButton></li></SidebarMenu></SidebarGroup>
      </Sidebar>,
    );
    expect(container.querySelector("aside.oc-sidebar > .oc-sidebar-content > .oc-sidebar-group > div.oc-sidebar-group-label")).not.toBeNull();
    expect(container.querySelector("a .oc-sidebar-menu-label")?.textContent).toBe("Home");
    expect(container.querySelector("a")?.getAttribute("data-tooltip")).toBe("Home");
  });
});

describe("SectionBlock, SectionHeader and VersionBadge", () => {
  it("renders the section block parts", () => {
    const { container } = render(
      <SectionBlock title="Notifications" source="Settings" version="v1.2" description="Choose which e-mails you receive." footerTitle="Need more control?" footerDescription="Per-project settings.">
        <p>Body</p>
      </SectionBlock>,
    );
    const section = container.querySelector("section.oc-section")!;
    expect(section.querySelector(".oc-section-header > h2.oc-section-header__title")?.textContent).toBe("Notifications");
    expect(section.querySelector("span.oc-section-header__badge-source.oc-badge-source")?.textContent).toBe("Settings");
    expect(section.querySelector("span.oc-section-header__badge-version.oc-badge-version")?.textContent).toBe("v1.2");
    expect(section.querySelector("p.oc-section-header__desc")).not.toBeNull();
    expect(section.querySelector(".oc-section-content > p")?.textContent).toBe("Body");
    expect(section.querySelector(".oc-section-footer > h3.oc-section-footer__title")?.textContent).toBe("Need more control?");
  });

  it("leaves out empty parts and supports the docs look", () => {
    const { container } = render(<SectionBlock docs title="Title only" />);
    expect(container.innerHTML).toBe('<section class="oc-docs-section"><div class="oc-section-header"><h2 class="oc-section-header__title">Title only</h2></div></section>');
  });

  it("renders all header badges in order", () => {
    const { container } = render(<SectionHeader title="Justify" as="h3" source="CSS class" scss="_a.scss" file="a.html" version="v0.2.0" />);
    const classes = [...container.firstElementChild!.children].map((c) => c.className);
    expect(classes).toEqual([
      "oc-section-header__title",
      "oc-badge-source oc-section-header__badge-source",
      "oc-badge-source-scss oc-section-header__badge-scss",
      "oc-badge-source-file oc-section-header__badge-file",
      "oc-badge-version oc-section-header__badge-version",
    ]);
    expect(container.querySelector("h3")).not.toBeNull();
  });

  it("version badge kinds", () => {
    const { container } = render(<><VersionBadge>v0.17.0</VersionBadge><VersionBadge kind="mdi">MDI 7.4</VersionBadge></>);
    expect(container.innerHTML).toBe('<span class="oc-badge-version">v0.17.0</span><span class="oc-badge-version-mdi">MDI 7.4</span>');
  });
});

describe("IconList extras", () => {
  it("renders pills, tagline and note around the list", () => {
    const { container } = render(<IconList variant="accent" pills={["Web app", "Since 2020"]} tagline="Plan every shift" note="Resets every hour." items={[{ text: "A" }]} />);
    expect(container.innerHTML).toBe(
      '<div class="oc-badge-row"><span class="oc-pill">Web app</span><span class="oc-pill">Since 2020</span></div><p class="oc-tagline--accent">Plan every shift</p><ul class="oc-list--accent"><li>A</li></ul><p class="oc-note">Resets every hour.</p>',
    );
  });

  it("renders only the list without extras", () => {
    const { container } = render(<IconList variant="accent" items={[{ text: "A" }]} />);
    expect(container.innerHTML).toBe('<ul class="oc-list--accent"><li>A</li></ul>');
  });
});

describe("Shot lightbox", () => {
  it("is a button that opens a single-image lightbox next to the figure", () => {
    const { container } = render(<ShotGrid lightbox items={[{ src: "/a.jpg", alt: "Dashboard", caption: "Dashboard of the day" }]} />);
    const button = container.querySelector("figure.oc-shot > button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Open the screenshot: Dashboard");
    expect(container.querySelector("figure.oc-shot a")).toBeNull();
    const dialog = container.querySelector(".oc-shot-grid > dialog.oc-lightbox.oc-lightbox--single") as HTMLDialogElement;
    expect(dialog.getAttribute("aria-label")).toBe("Dashboard");
    expect(dialog.querySelector(".oc-lightbox__title")?.textContent).toBe("Dashboard of the day");
    expect(container.querySelector(".oc-lightbox-thumbs")).toBeNull();
    fireEvent.click(button);
    expect(dialog.hasAttribute("open")).toBe(true);
  });

  it("keeps the link by default", () => {
    const { container } = render(<Shot src="/a.jpg" alt="A" />);
    expect(container.querySelector("figure.oc-shot > a")?.getAttribute("href")).toBe("/a.jpg");
    expect(container.querySelector("dialog")).toBeNull();
  });
});

describe("BrowserFrame body", () => {
  it("renders div.oc-browser-frame with a __body", () => {
    const { container } = render(<BrowserFrame body className="oc-accent--blue" bodyStyle={{ background: "red" }} />);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(root.className).toBe("oc-browser-frame oc-accent--blue");
    expect(root.innerHTML).toBe('<div class="oc-browser-frame__bar"><i></i><i></i><i></i></div><div class="oc-browser-frame__body" style="background: red;"></div>');
  });

  it("uses the image itself as the body", () => {
    const { container } = render(<BrowserFrame body glow src="/s.png" alt="Shot" />);
    expect(container.querySelector("div.oc-browser-frame.oc-browser-frame--glow > img.oc-browser-frame__body")?.getAttribute("alt")).toBe("Shot");
  });
});

describe("Checklist check variant", () => {
  it("renders ul.oc-check-list", () => {
    const { container } = render(<Checklist variant="check" items={["No JavaScript needed", "Light and dark mode"]} />);
    expect(container.innerHTML).toBe('<ul class="oc-check-list"><li>No JavaScript needed</li><li>Light and dark mode</li></ul>');
  });
});
