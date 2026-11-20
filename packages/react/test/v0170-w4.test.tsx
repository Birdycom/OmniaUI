// File: packages/react/test/v0170-w4.test.tsx
// Map: 0.17.0 W4 blocks: auth pages + sidebars -> site header / footer + topbar -> route blocks -> marketing blocks -> hero orbit + auth split

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlockLogin01 } from "../src/blocks/BlockLogin01";
import { BlockLogin02 } from "../src/blocks/BlockLogin02";
import { BlockLogin03 } from "../src/blocks/BlockLogin03";
import { BlockSignup01 } from "../src/blocks/BlockSignup01";
import { BlockSignup02 } from "../src/blocks/BlockSignup02";
import { BlockOtp01 } from "../src/blocks/BlockOtp01";
import { BlockOtp02 } from "../src/blocks/BlockOtp02";
import { BlockForgotPassword } from "../src/blocks/BlockForgotPassword";
import { BlockResetPassword } from "../src/blocks/BlockResetPassword";
import { BlockSidebar01 } from "../src/blocks/BlockSidebar01";
import { BlockSidebar02 } from "../src/blocks/BlockSidebar02";
import { BlockSidebar03 } from "../src/blocks/BlockSidebar03";
import { BlockSidebar04 } from "../src/blocks/BlockSidebar04";
import { BlockSidebar05 } from "../src/blocks/BlockSidebar05";
import { BlockSiteHeader } from "../src/blocks/BlockSiteHeader";
import { BlockSiteFooter } from "../src/blocks/BlockSiteFooter";
import { Topbar } from "../src/components/Topbar";
import { BlockRouteProgress } from "../src/blocks/BlockRouteProgress";
import { BlockStepView } from "../src/blocks/BlockStepView";
import { BlockRouteSteps } from "../src/blocks/BlockRouteSteps";
import { BlockTypePicker } from "../src/blocks/BlockTypePicker";
import { BlockShowcase } from "../src/blocks/BlockShowcase";
import { BlockHeroCode } from "../src/blocks/BlockHeroCode";
import { BlockProductGrid } from "../src/blocks/BlockProductGrid";
import { BlockAboutTimeline } from "../src/blocks/BlockAboutTimeline";
import { BlockPortfolioGrid } from "../src/blocks/BlockPortfolioGrid";
import { BlockContactGrid } from "../src/blocks/BlockContactGrid";
import { LinkArrow } from "../src/components/LinkArrow";
import { BlockHeroOrbit } from "../src/blocks/BlockHeroOrbit";
import { BlockAuthSplit } from "../src/blocks/BlockAuthSplit";

// --- part a ---
describe("0.17.0 auth page blocks", () => {
  it("login-01: plain page with the snippet defaults", () => {
    const { container } = render(<BlockLogin01 className="x" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-block-authpage oc-block-authpage--plain x");
    expect(root.querySelector("form.oc-block-authcard")).not.toBeNull();
    expect(root.querySelector(".oc-block-authcard-logo")).not.toBeNull();
    expect(root.querySelector(".oc-block-authcard-title")!.textContent).toBe("Login to your account");
    expect(root.querySelector(".oc-input-reveal input[name=password]")).not.toBeNull();
    expect(root.querySelector(".oc-block-authcard-row")).toBeNull();
    expect(root.querySelector(".oc-block-authcard-submit")!.textContent).toBe("Login");
    expect(root.querySelector(".oc-block-authcard-foot")!.textContent).toContain("Sign up");
  });

  it("login-01: onSubmit gets the values; title prop wins", () => {
    const onSubmit = vi.fn();
    const { container } = render(<BlockLogin01 title="Sign in to Company 1" onSubmit={onSubmit} />);
    expect(container.querySelector(".oc-block-authcard-title")!.textContent).toBe("Sign in to Company 1");
    fireEvent.change(container.querySelector("input[name=email]")!, { target: { value: "info@company1.example" } });
    fireEvent.change(container.querySelector("input[name=password]")!, { target: { value: "secret" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(onSubmit).toHaveBeenCalledWith({ email: "info@company1.example", password: "secret", remember: false });
  });

  it("login-02: split with quote panel, remember me and forgot link", () => {
    const { container } = render(<BlockLogin02 />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-block-authduo");
    expect(root.querySelector(".oc-block-authduo-panel--image .oc-block-authduo-quote footer")!.textContent).toBe("Customer 1, operations lead");
    expect(root.querySelector("form")!.className).toBe("oc-block-authcard oc-block-authcard--flat");
    expect(root.querySelector(".oc-block-authcard-logo")).toBeNull();
    expect(root.querySelector(".oc-block-authcard-row input[name=remember]")).not.toBeNull();
    expect(root.querySelector(".oc-block-authcard-row a")!.textContent).toBe("Forgot password?");
  });

  it("login-02: reverse + social + photo panel keep the default quote (login-04 / otp-02 demo)", () => {
    const { container } = render(
      <BlockLogin02 reverse social={["Apple", "Google", "Meta"]} dividerLabel="Or continue with e-mail" panel={{ tone: "photo", photo: "/img/a.webp" }} />,
    );
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-block-authduo oc-block-authduo--reverse");
    const aside = root.querySelector("aside")! as HTMLElement;
    expect(aside.className).toBe("oc-block-authduo-panel oc-block-authduo-panel--photo");
    expect(aside.style.getPropertyValue("--oc-authduo-photo")).toBe("url('/img/a.webp')");
    expect(aside.querySelector(".oc-block-authduo-quote")).not.toBeNull();
    expect(root.querySelectorAll(".oc-block-authsocial button")).toHaveLength(3);
    expect(root.querySelector(".oc-separator-text")!.textContent).toBe("Or continue with e-mail");
  });

  it("login-03: muted page, social buttons, divider and legal line", () => {
    const onSocial = vi.fn();
    const { container } = render(<BlockLogin03 onSocial={onSocial} />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-block-authpage");
    const social = root.querySelector(".oc-block-authsocial")!;
    expect(social.nextElementSibling!.className).toBe("oc-separator-text");
    fireEvent.click(social.querySelectorAll("button")[1]);
    expect(onSocial).toHaveBeenCalledWith(1);
    expect(root.querySelector(".oc-block-authcard-legal")!.textContent).toContain("Privacy Policy");
  });

  it("minimal magic-link layout (login-05 demo)", () => {
    const { container } = render(
      <BlockLogin01 layout="minimal" password={false} submitLabel="Email me a sign-in link" social={["Continue with Apple"]} socialPosition="bottom" dividerLabel="Or" footer={null} />,
    );
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-block-authmin");
    expect(root.querySelector("form")!.className).toContain("oc-block-authcard--flat");
    expect(root.querySelector("input[name=password]")).toBeNull();
    expect(root.querySelector(".oc-block-authcard-fields")!.nextElementSibling!.className).toBe("oc-separator-text");
    expect(root.querySelector(".oc-block-authcard-foot")).toBeNull();
  });

  it("signup-01: name, e-mail, password, confirmation and hint; submit values", () => {
    const onSubmit = vi.fn();
    const { container } = render(<BlockSignup01 onSubmit={onSubmit} />);
    expect(container.querySelectorAll(".oc-field")).toHaveLength(4);
    expect(container.querySelector(".oc-block-authcard-hint")!.textContent).toBe("Must be at least 8 characters long.");
    fireEvent.change(container.querySelector("input[name=name]")!, { target: { value: "Contact 1" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(onSubmit).toHaveBeenCalledWith({ name: "Contact 1", email: "", password: "", confirm: "", terms: false });
  });

  it("signup-02: reversed split with a terms checkbox; nameLabel=false drops the name (signup-03 demo)", () => {
    const { container } = render(<BlockSignup02 />);
    expect(container.firstElementChild!.className).toBe("oc-block-authduo oc-block-authduo--reverse");
    expect(container.querySelector("input[name=terms]")).not.toBeNull();
    expect(container.querySelectorAll(".oc-field")).toHaveLength(3);
    const { container: c3 } = render(<BlockSignup01 muted nameLabel={false} confirmLabel={false} hint={null} social={["Apple", "Google"]} dividerLabel="Or continue with" />);
    expect(c3.querySelector("input[name=name]")).toBeNull();
    expect(c3.querySelectorAll(".oc-field")).toHaveLength(2);
    expect(c3.firstElementChild!.className).toBe("oc-block-authpage");
  });

  it("otp-01 / otp-02: code input with length, description and muted panel", () => {
    const onComplete = vi.fn();
    const { container } = render(<BlockOtp01 length={4} onComplete={onComplete} />);
    const input = container.querySelector("input.oc-otp")! as HTMLInputElement;
    expect(input.maxLength).toBe(4);
    expect(container.querySelector(".oc-field-description")!.textContent).toContain("name@company1.example");
    fireEvent.change(input, { target: { value: "1234" } });
    expect(onComplete).toHaveBeenCalledWith("1234");
    const { container: c2 } = render(<BlockOtp02 />);
    expect(c2.querySelector(".oc-block-authduo-panel--muted")).not.toBeNull();
    expect(c2.querySelector(".oc-block-authcard-title")!.textContent).toBe("Verify your login");
  });

  it("forgot and reset password", () => {
    const onSubmit = vi.fn();
    const { container } = render(<BlockForgotPassword onSubmit={onSubmit} />);
    expect(container.querySelector(".oc-block-authcard-submit")!.textContent).toBe("Send reset link");
    fireEvent.change(container.querySelector("input[name=email]")!, { target: { value: "info@company1.example" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(onSubmit).toHaveBeenCalledWith({ email: "info@company1.example" });
    const { container: r } = render(<BlockResetPassword />);
    expect(r.querySelectorAll(".oc-input-reveal")).toHaveLength(2);
    expect(r.querySelector(".oc-block-authcard-hint")!.textContent).toContain("8 characters");
    expect(r.querySelector(".oc-block-authcard-foot a")!.textContent).toBe("Back to sign in");
  });

  it("without onSubmit the form posts natively to action", () => {
    const { container } = render(<BlockForgotPassword action="/forgot" />);
    const form = container.querySelector("form")!;
    expect(form.getAttribute("action")).toBe("/forgot");
    expect(form.getAttribute("method")).toBe("post");
  });
});

describe("0.17.0 sidebar blocks", () => {
  it("sidebar-01: brand, labelled groups, badge, current page and user footer", () => {
    const { container } = render(<BlockSidebar01 />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-block-sb");
    expect(root.querySelector(".oc-sidebar-header strong")!.textContent).toBe("Documentation");
    expect(root.querySelectorAll(".oc-sidebar-group")).toHaveLength(2);
    expect(root.querySelector(".oc-sidebar-group-label")!.textContent).toBe("Getting started");
    expect(root.querySelector("[aria-current=page] .oc-sidebar-menu-label")!.textContent).toBe("Introduction");
    expect(root.querySelector(".oc-sidebar-menu-badge")!.textContent).toBe("24");
    expect(root.querySelector(".oc-sidebar-footer .oc-user-name")!.textContent).toBe("User 1");
    expect(root.querySelectorAll(".oc-block-sb-ph")).toHaveLength(4);
    expect(root.querySelector(".oc-breadcrumb-item[aria-current=page]")!.textContent).toBe("Overview");
  });

  it("sidebar-01: own groups, user initials, breadcrumbs and main content", () => {
    const { container } = render(
      <BlockSidebar01
        brand={{ title: "Company 1", sub: "Admin" }}
        groups={[{ label: "Sales", items: [{ label: "Quotes", href: "/quotes", current: true }] }]}
        user={{ name: "Customer One" }}
        breadcrumbs={[{ label: "Sales", href: "/" }, { label: "Quotes" }]}
      >
        <p id="body">Body</p>
      </BlockSidebar01>,
    );
    expect(container.querySelector(".oc-sidebar-menu-button[href='/quotes']")!.getAttribute("aria-current")).toBe("page");
    expect(container.querySelector(".oc-avatar")!.textContent).toBe("CO");
    expect(container.querySelector(".oc-block-sb-body #body")).not.toBeNull();
    expect(container.querySelector(".oc-block-sb-ph")).toBeNull();
  });

  it("sidebar-02: groups fold with details; open defaults to true", () => {
    const { container } = render(<BlockSidebar02 />);
    const groups = container.querySelectorAll("details.oc-block-sb-group");
    expect(groups).toHaveLength(3);
    expect((groups[0] as HTMLDetailsElement).open).toBe(true);
    expect((groups[2] as HTMLDetailsElement).open).toBe(false);
    expect(groups[2].querySelector("summary")!.textContent).toBe("Reference");
    expect(container.querySelector(".oc-sidebar-footer")).toBeNull();
  });

  it("sidebar-03: visible submenus; sidebar-05: collapsible submenus", () => {
    const { container } = render(<BlockSidebar03 />);
    expect(container.querySelectorAll(".oc-sidebar-menu-sub")).toHaveLength(2);
    expect(container.querySelector("details")).toBeNull();
    const { container: c5 } = render(<BlockSidebar05 />);
    const items = c5.querySelectorAll("details.oc-sidebar-collapsible");
    expect(items).toHaveLength(3);
    expect((items[0] as HTMLDetailsElement).open).toBe(true);
    expect(items[0].querySelector("summary.oc-sidebar-menu-button .oc-sidebar-menu-label")!.textContent).toBe("Dashboard");
    expect(items[1].querySelectorAll(".oc-sidebar-menu-sub li")).toHaveLength(2);
  });

  it("sidebar-04: floating panel", () => {
    const { container } = render(<BlockSidebar04 />);
    expect(container.firstElementChild!.className).toBe("oc-block-sb oc-block-sb--floating");
    expect(container.querySelector("aside")!.className).toBe("oc-sidebar oc-sidebar--floating");
  });
});

// --- part b ---
const links = [{ label: "Product", href: "#product", current: true }, { label: "Pricing", href: "#pricing" }];

describe("0.17.0 site header block", () => {
  it("without the new props the markup is unchanged", () => {
    const { container } = render(<BlockSiteHeader brand="Company 1" links={links} />);
    const header = container.querySelector("header")!;
    expect(header.className).toBe("oc-site-header");
    expect(header.querySelector(".oc-site-header__brand")!.textContent).toBe("Company 1");
    expect(header.querySelector(".oc-site-header__toggle")!.textContent).toBe("☰");
    expect(header.querySelector(".oc-site-header__nav")!.getAttribute("aria-label")).toBe("Main");
    expect(header.querySelector(".oc-site-header__actions")).toBeNull();
    expect(header.querySelector(".oc-site-header__progress")).toBeNull();
  });

  it("actions, progress, variant and a brand mark", () => {
    const { container } = render(
      <BlockSiteHeader
        brandHref="#"
        brandMark={{ name: "Company", accent: "1", tagline: "Software & IT", "aria-label": "Company 1, home" }}
        links={links}
        variant="center"
        progress
        menuIcon={<span className="m">M</span>}
        actions={<a className="oc-btn oc-btn--sm" href="#">Start free</a>}
      />,
    );
    const header = container.querySelector("header")!;
    expect(header.className).toBe("oc-site-header oc-site-header--center");
    const mark = header.querySelector("a.oc-brand-mark")!;
    expect(mark.getAttribute("href")).toBe("#");
    expect(mark.getAttribute("aria-label")).toBe("Company 1, home");
    expect(mark.querySelector(".oc-brand-mark__accent")!.textContent).toBe("1");
    expect(mark.querySelector(".oc-brand-mark__tagline")!.textContent).toBe("Software & IT");
    expect(header.querySelector(".oc-site-header__brand")).toBeNull();
    expect(header.querySelector(".oc-site-header__toggle .m")).not.toBeNull();
    expect(header.querySelector(".oc-site-header__inner > .oc-site-header__actions a")!.textContent).toBe("Start free");
    expect(header.lastElementChild!.className).toBe("oc-site-header__progress");
    expect(header.lastElementChild!.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("0.17.0 site footer block", () => {
  it("without the new props the markup is unchanged", () => {
    const { container } = render(<BlockSiteFooter brand="Company 1" columns={[{ title: "Company", links: [{ label: "About", href: "#" }] }]} copyright="© 2026 Company 1" credit="Built with OmniaCSS" />);
    const footer = container.querySelector("footer")!;
    expect(footer.className).toBe("oc-site-footer");
    expect(footer.querySelectorAll(".oc-site-footer__bottom > span")).toHaveLength(2);
    expect(footer.querySelector(".oc-site-footer__social, .oc-site-footer__legal, .oc-site-footer__signup")).toBeNull();
  });

  it("brand mark, social, more lists, legal and build", () => {
    const { container } = render(
      <BlockSiteFooter
        brandMark={{ name: "Company", accent: "1", "aria-label": "Company 1, home" }}
        about="Business apps from one team."
        social={[{ label: "LinkedIn", href: "#", icon: <span className="i" /> }]}
        columns={[{ title: "Projects", links: [{ label: "Customer 1", href: "#" }], more: [{ title: "Tools", links: [{ label: "Tool 1", href: "#" }] }] }]}
        copyright="© 2026 Company 1"
        legal={[{ label: "Terms", href: "#" }, { label: "Privacy", href: "#" }]}
        build="build 2026.11.02"
      />,
    );
    const footer = container.querySelector("footer")!;
    expect(footer.querySelector(".oc-site-footer__about > a.oc-brand-mark.oc-brand-mark--sm")).not.toBeNull();
    const social = footer.querySelector(".oc-site-footer__about > ul.oc-site-footer__social")!;
    expect(social.getAttribute("aria-label")).toBe("Social media");
    expect(social.querySelector("a")!.getAttribute("aria-label")).toBe("LinkedIn");
    expect(footer.querySelector("h2.oc-site-footer__title.oc-site-footer__subtitle")!.textContent).toBe("Tools");
    const legal = footer.querySelector(".oc-site-footer__bottom > ul.oc-site-footer__legal")!;
    expect(legal.querySelectorAll("a")).toHaveLength(2);
    expect(legal.lastElementChild!.className).toBe("oc-site-footer__build");
    expect(footer.querySelectorAll(".oc-site-footer__bottom > span")).toHaveLength(1);
  });

  it("center variant: about, row, social and one bottom line", () => {
    const { container } = render(
      <BlockSiteFooter
        variant="center"
        brand="Company 1"
        row={[{ label: "Product", href: "#" }, { label: "Blog", href: "#" }]}
        social={[{ label: "GitHub", href: "#", icon: <span /> }]}
        copyright="© 2026 Company 1. All rights reserved."
      />,
    );
    const footer = container.querySelector("footer")!;
    expect(footer.className).toBe("oc-site-footer oc-site-footer--center");
    expect(footer.querySelector(".oc-site-footer__grid")).toBeNull();
    const kids = [...footer.querySelector(".oc-container")!.children].map((e) => e.className);
    expect(kids).toEqual(["oc-site-footer__about", "oc-site-footer__row", "oc-site-footer__social", "oc-site-footer__bottom"]);
    expect(footer.querySelectorAll(".oc-site-footer__bottom > span")).toHaveLength(1);
  });

  it("dark with a newsletter: labelled e-mail field, social under it", () => {
    const { container } = render(
      <BlockSiteFooter variant="dark" brand="Company 1" columns={[]} newsletter={{ placeholder: "info@company1.example" }} social={[{ label: "LinkedIn", href: "#", icon: <span /> }]} />,
    );
    const footer = container.querySelector("footer")!;
    expect(footer.className).toBe("oc-site-footer oc-site-footer--dark");
    const form = footer.querySelector("form.oc-site-footer__signup")!;
    const input = form.querySelector("input.oc-input")!;
    expect(input.getAttribute("type")).toBe("email");
    expect(form.querySelector("label.oc-visually-hidden")!.getAttribute("for")).toBe(input.id);
    expect(form.querySelector("button")!.textContent).toBe("Subscribe");
    expect(footer.querySelector(".oc-site-footer__about > div > .oc-site-footer__social")).not.toBeNull();
  });
});

describe("0.17.0 topbar", () => {
  it("brand with logo, checkbox menu, navmenu links, actions", () => {
    const { container } = render(<Topbar brand="Company 1" logo={<span className="lg" />} links={links} actions={<a className="oc-btn oc-btn--sm" href="#">Get started</a>} />);
    const header = container.querySelector("header")!;
    expect(header.className).toBe("oc-topbar oc-topbar--collapsible");
    expect(header.querySelector(".oc-topbar-brand > .oc-topbar-logo .lg")).not.toBeNull();
    const toggle = header.querySelector("input.oc-topbar-toggle")!;
    expect(header.querySelector("label.oc-topbar-burger")!.getAttribute("for")).toBe(toggle.id);
    const a = header.querySelectorAll(".oc-topbar-nav ul.oc-navmenu.oc-navmenu--site a.oc-navmenu-link");
    expect(a).toHaveLength(2);
    expect(a[0].getAttribute("aria-current")).toBe("page");
    expect(header.querySelector(".oc-topbar-actions a")!.textContent).toBe("Get started");
  });

  it("modifiers, strip above, icon link, not collapsible", () => {
    const { container } = render(
      <Topbar brand="Company 1" variant="floating" center plain strip={<span>info@company1.example</span>} links={[{ label: "GitHub", href: "#", icon: <svg className="oc-navmenu-icon" /> }]} />,
    );
    expect(container.firstElementChild!.className).toBe("oc-topbar-strip");
    expect(container.querySelector("header")!.className).toBe("oc-topbar oc-topbar--collapsible oc-topbar--floating oc-topbar--center oc-topbar--plain");
    expect(container.querySelector(".oc-navmenu-link")!.getAttribute("aria-label")).toBe("GitHub");
    const plain = render(<Topbar brand="Company 1" collapsible={false} variant="brand" className="oc-accent--violet" />);
    expect(plain.container.querySelector("header")!.className).toBe("oc-topbar oc-topbar--brand oc-accent--violet");
    expect(plain.container.querySelector(".oc-topbar-toggle")).toBeNull();
  });
});

// --- part c ---
describe("0.17.0 W4 route blocks (React)", () => {
  it("route progress: finish open as in the docs demo", () => {
    const { container } = render(
      <BlockRouteProgress title="Route 1" meta="Team 1 · started at 10:05" score={80} done={5} total={6} listLabel="Route steps"
        next={{ tone: "finish", icon: "mdi:flag-checkered", title: "The finish is open", meta: "350 m" }}
        steps={[{ name: "Old gate", state: "done" }, { name: "Market square", state: "wrong" }, { name: "Finish", state: "current", marker: "mdi:flag-checkered", markerLabel: "Finish" }]} />,
    );
    expect(container.querySelector(".oc-block-route-progress-next--finish")).not.toBeNull();
    expect(container.querySelector(".oc-block-route-progress-bar-label")!.textContent).toBe("5 of 6 steps done83%");
    expect(container.querySelector(".oc-block-route-progress-list")!.getAttribute("aria-label")).toBe("Route steps");
    expect(container.querySelectorAll(".oc-block-route-progress-item--done")).toHaveLength(2);
    expect(container.querySelector('[aria-current="step"]')).not.toBeNull();
  });

  it("step view: no picture shows the number on a flat surface", () => {
    const { container } = render(<BlockStepView title="Town hall" number={3} place="Market street 1" question={{ text: "Which year?", options: ["1890", "1910"], name: "answer" }} />);
    expect(container.querySelector(".oc-block-step-view-picture--empty")!.getAttribute("data-number")).toBe("3");
    expect(container.querySelectorAll('input[name="answer"]')).toHaveLength(2);
  });

  it("route steps locked: lock line, disabled grips", () => {
    const { container } = render(<BlockRouteSteps title="Steps of Route 1" locked lockedLabel="Order locked during the live round" search={false} steps={[{ id: "l1", name: "Old gate" }]} onMove={() => {}} />);
    expect(container.querySelector(".oc-block-route-steps--locked")).not.toBeNull();
    expect(container.querySelector(".oc-block-route-steps-lock")!.textContent).toBe("Order locked during the live round");
    expect(container.querySelector(".oc-sortable-row-grip")!.hasAttribute("disabled")).toBe(true);
  });

  it("type picker action mode: a click picks, the unavailable card does nothing", () => {
    const onPick = vi.fn();
    const { container } = render(<BlockTypePicker mode="action" search={false} onPick={onPick}
      options={[{ value: "text", label: "Text" }, { value: "question", label: "Question", disabledReason: "This step already has a question" }]} />);
    const cards = container.querySelectorAll<HTMLButtonElement>("button.oc-block-type-picker-item");
    fireEvent.click(cards[1]);
    expect(onPick).not.toHaveBeenCalled();
    fireEvent.click(cards[0]);
    expect(onPick).toHaveBeenCalledWith("text", expect.objectContaining({ value: "text" }));
    expect(cards[1].getAttribute("aria-describedby")).toBe(container.querySelector(".oc-block-type-picker-reason")!.id);
  });
});

// --- part d ---
describe("0.17.0 W4 marketing blocks", () => {
  it("showcase: pill sits at the start like the snippet, cardMin sets the grid width", () => {
    const { container } = render(
      <BlockShowcase eyebrow="Work" title="Websites" cardMin="20rem" projects={[{ href: "/p1", accent: "green", pill: "Website with CMS", name: "Project 1", image: "/s.png", imageAlt: "Shot" }]} />,
    );
    expect(container.querySelector(".oc-card-grid")!.getAttribute("style")).toContain("--oc-card-min: 20rem");
    expect(container.querySelector(".oc-pill")!.className).toBe("oc-pill oc-pill--accent justify-self-start");
    expect(container.querySelector("img")!.getAttribute("alt")).toBe("Shot");
  });

  it("hero-code: codeDark adds the dark window, tiles=[] hides the tiles", () => {
    const { container } = render(<BlockHeroCode title="T" code="x" codeTitle="a.php" codeDark tiles={[]} />);
    expect(container.querySelector(".oc-code-window")!.className).toBe("oc-code-window oc-code-window--dark");
    expect(container.querySelectorAll(".oc-icon-tile").length).toBe(0);
    const plain = render(<BlockHeroCode title="T" code="x" />);
    expect(plain.container.querySelector(".oc-code-window")!.className).toBe("oc-code-window");
    expect(plain.container.querySelectorAll(".oc-icon-tile--float").length).toBe(3);
  });

  it("product-grid: icon as glyph or webicon name", () => {
    const { container } = render(
      <BlockProductGrid title="P" products={[{ href: "#", icon: "◆", name: "Product 1" }, { href: "#", icon: "mdi:package-variant", name: "Product 2" }, { href: "#", name: "Product 3" }]} />,
    );
    const tiles = container.querySelectorAll(".oc-icon-tile");
    expect(tiles.length).toBe(2);
    expect(tiles[0].textContent).toBe("◆");
    expect(tiles[1].querySelector("svg, iconify-icon")).not.toBeNull();
  });

  it("about-timeline: accent and timelineAccent", () => {
    const { container } = render(
      <BlockAboutTimeline reverse accent="green" timelineAccent title="Small team" badge="40" timeline={[{ date: "2016", title: "First client" }]} />,
    );
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-block-about oc-block-about--reverse oc-accent--green");
    expect(container.querySelector("ol")!.className).toBe("oc-timeline oc-timeline--accent");
    const plain = render(<BlockAboutTimeline title="T" timeline={[{ date: "1" }]} />);
    expect(plain.container.firstElementChild!.className).toBe("oc-block-about");
    expect(plain.container.querySelector("ol")!.className).toBe("oc-timeline");
  });

  it("portfolio-grid: text link + linkHref renders a LinkArrow with its tone; a node link stays as is", () => {
    const { container } = render(<BlockPortfolioGrid two title="Case studies" link="All cases" linkHref="#cases" linkTone="muted" projects={[{ href: "#c1", name: "Customer 4", accent: "cyan" }]} />);
    const link = container.querySelector(".oc-block-portfolio-head > a")!;
    expect(link.className).toBe("oc-link-arrow oc-link-arrow--muted");
    expect(link.getAttribute("href")).toBe("#cases");
    expect(container.querySelector(".oc-eyebrow")).toBeNull();
    expect(container.querySelector(".oc-block-portfolio-lead")).toBeNull();
    const node = render(<BlockPortfolioGrid title="T" link={<LinkArrow href="/w" tone="accent">All</LinkArrow>} linkHref="/ignored" projects={[]} />);
    const a = node.container.querySelector(".oc-block-portfolio-head > a")!;
    expect(a.getAttribute("href")).toBe("/w");
    expect(a.className).toBe("oc-link-arrow oc-link-arrow--accent");
  });

  it("contact-grid: cards optional, webicon names in the mark", () => {
    const { container } = render(
      <BlockContactGrid plain title="Reach the right team" cards={[{ title: "Office", address: true, icon: "mdi:map-marker-outline", accent: "orange", lines: [{ text: "Company 1" }] }]} />,
    );
    expect(container.firstElementChild!.className).toBe("oc-block-contact oc-block-contact--plain");
    expect(container.querySelector(".oc-product-mark svg, .oc-product-mark iconify-icon")).not.toBeNull();
    expect(container.querySelector("address .oc-block-contact-title")!.tagName).toBe("SPAN");
    const empty = render(<BlockContactGrid title="Only a title" />);
    expect(empty.container.querySelectorAll(".oc-block-contact-card").length).toBe(0);
  });
});

// --- part e ---
describe("BlockHeroOrbit 0.17.0 options", () => {
  it("keeps the default markup without the new props", () => {
    const { container } = render(<BlockHeroOrbit title="Hero" />);
    expect(container.querySelector("h1.oc-display")).not.toBeNull();
    expect(container.querySelector(".oc-split--lead")).toBeNull();
    const marks = container.querySelectorAll<HTMLElement>(".oc-block-orbit-mark");
    expect(marks).toHaveLength(6);
    expect(marks[1].style.getPropertyValue("--oc-orbit-angle")).toBe("60deg");
    expect(marks[0].firstElementChild?.className).toBe("oc-product-mark oc-product-mark--sm oc-accent--green");
    expect(container.querySelector(".oc-code-window.oc-block-orbit-center")).not.toBeNull();
  });

  it("renders the floating variant with a wider copy column", () => {
    const { container } = render(<BlockHeroOrbit title="Fits" splitLead float />);
    expect(container.querySelector(".oc-container.oc-split.oc-split--lead")).not.toBeNull();
    expect(container.querySelector(".oc-block-orbit-visual.oc-block-orbit-visual--float")).not.toBeNull();
    expect(container.querySelector<HTMLElement>(".oc-block-orbit-mark")!.getAttribute("style")).toBeNull();
  });

  it("renders soft marks from a start angle, an h2 and a big center mark", () => {
    const { container } = render(
      <BlockHeroOrbit
        title="Every module"
        headingLevel={2}
        duration="30s"
        softMarks
        markSize="md"
        startAngle={45}
        marks={[
          { glyph: "A", accent: "green" },
          { glyph: "B", accent: "orange" },
          { glyph: "C", accent: "cyan" },
          { glyph: "D", accent: "violet", angle: 300 },
        ]}
        centerMark={{ glyph: "E", accent: "blue" }}
      />,
    );
    expect(container.querySelector("h1")).toBeNull();
    expect(container.querySelector("h2.oc-display.oc-display--md")?.textContent).toBe("Every module");
    const marks = container.querySelectorAll<HTMLElement>(".oc-block-orbit-mark");
    expect(marks[0].style.getPropertyValue("--oc-orbit-angle")).toBe("45deg");
    expect(marks[1].style.getPropertyValue("--oc-orbit-angle")).toBe("135deg");
    expect(marks[3].style.getPropertyValue("--oc-orbit-angle")).toBe("300deg");
    expect(marks[0].firstElementChild?.className).toBe("oc-product-mark oc-product-mark--soft oc-accent--green");
    const center = container.querySelector<HTMLElement>(".oc-block-orbit-center")!;
    expect(center.className).toBe("oc-block-orbit-center oc-product-mark oc-product-mark--xl oc-accent--blue");
    expect(center.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".oc-code-window")).toBeNull();
  });
});

describe("BlockAuthSplit 0.17.0 options", () => {
  it("shows a photo brand panel and passes form attributes", () => {
    const { container } = render(<BlockAuthSplit photo="/img/team.webp" formProps={{ action: "/login", method: "post", "aria-label": "Sign in" }} />);
    const aside = container.querySelector<HTMLElement>("aside")!;
    expect(aside.className).toBe("oc-block-authsplit-brand oc-block-authsplit-brand--photo");
    expect(aside.style.getPropertyValue("--oc-authsplit-photo")).toContain("/img/team.webp");
    const form = container.querySelector("form")!;
    expect(form.className).toBe("oc-block-authsplit-card");
    expect(form.getAttribute("action")).toBe("/login");
    expect(form.getAttribute("aria-label")).toBe("Sign in");
  });

  it("keeps the plain brand panel by default", () => {
    const { container } = render(<BlockAuthSplit />);
    expect(container.querySelector("aside")!.className).toBe("oc-block-authsplit-brand");
    expect(container.querySelector("aside")!.getAttribute("style")).toBeNull();
  });
});
