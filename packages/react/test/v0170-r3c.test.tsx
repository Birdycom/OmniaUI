// File: packages/react/test/v0170-r3c.test.tsx
// Map: 0.17.0 round 3C: headingLevel on the hero / header / auth blocks (default h1, 2 renders an h2 with the same class)
//      -> BlockAppShell breadcrumb icons

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlockHero } from "../src/blocks/BlockHero";
import { BlockHeroSplit } from "../src/blocks/BlockHeroSplit";
import { BlockHeroCode } from "../src/blocks/BlockHeroCode";
import { BlockModuleHeader } from "../src/blocks/BlockModuleHeader";
import { BlockAuthSplit } from "../src/blocks/BlockAuthSplit";
import { BlockLogin01 } from "../src/blocks/BlockLogin01";
import { BlockSignup02 } from "../src/blocks/BlockSignup02";
import { BlockOtp01 } from "../src/blocks/BlockOtp01";
import { BlockForgotPassword } from "../src/blocks/BlockForgotPassword";
import { BlockResetPassword } from "../src/blocks/BlockResetPassword";
import { BlockAppShell } from "../src/blocks/BlockAppShell";

describe("headingLevel", () => {
  it("hero and hero split: h1 by default, h2 with headingLevel 2", () => {
    const one = render(<BlockHero title="Title 1" />).container;
    expect(one.querySelector(".oc-block-hero > h1")?.textContent).toBe("Title 1");
    const two = render(<BlockHero title="Title 2" headingLevel={2} />).container;
    expect(two.querySelector("h1")).toBeNull();
    expect(two.querySelector(".oc-block-hero > h2")?.textContent).toBe("Title 2");
    const split = render(<BlockHeroSplit title="Split" headingLevel={2} />).container;
    expect(split.querySelector(".oc-block-hero-split h2")?.textContent).toBe("Split");
    expect(render(<BlockHeroSplit title="Split" />).container.querySelector(".oc-block-hero-split h1")).not.toBeNull();
  });

  it("hero code, module header and auth split keep their title class", () => {
    expect(render(<BlockHeroCode title="Code" code="" />).container.querySelector("h1.oc-display")).not.toBeNull();
    expect(render(<BlockHeroCode title="Code" code="" headingLevel={2} />).container.querySelector("h2.oc-display")?.textContent).toBe("Code");
    expect(render(<BlockModuleHeader title="Contacts" />).container.querySelector("h1.oc-block-modulehead-title")).not.toBeNull();
    expect(render(<BlockModuleHeader title="Contacts" headingLevel={2} />).container.querySelector("h2.oc-block-modulehead-title")?.textContent).toBe("Contacts");
    expect(render(<BlockAuthSplit />).container.querySelector("h1.oc-block-authsplit-title")).not.toBeNull();
    expect(render(<BlockAuthSplit headingLevel={2} />).container.querySelector("h2.oc-block-authsplit-title")?.textContent).toBe("Welcome back");
  });

  it("auth page blocks pass headingLevel to the card title", () => {
    expect(render(<BlockLogin01 />).container.querySelector("h1.oc-block-authcard-title")?.textContent).toBe("Login to your account");
    for (const el of [
      <BlockLogin01 headingLevel={2} key="l" />,
      <BlockSignup02 headingLevel={2} key="s" />,
      <BlockOtp01 headingLevel={2} key="o" />,
      <BlockForgotPassword headingLevel={2} key="f" />,
      <BlockResetPassword headingLevel={2} key="r" />,
    ]) {
      const c = render(el).container;
      expect(c.querySelector("h1")).toBeNull();
      expect(c.querySelector("h2.oc-block-authcard-title")).not.toBeNull();
    }
  });
});

describe("BlockAppShell breadcrumbs", () => {
  it("draws the icon before the label, as the snippet", () => {
    const c = render(
      <BlockAppShell sidebar={<aside />} breadcrumbs={[{ label: "Home", href: "/", icon: <svg data-testid="home" /> }, { label: "Contacts", icon: <svg data-testid="cur" /> }]} />,
    ).container;
    const items = c.querySelectorAll(".oc-block-shell-breadcrumbs .oc-breadcrumb-item");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("a > svg[data-testid=home]")).not.toBeNull();
    expect(items[0].textContent).toBe("Home");
    expect(items[1].getAttribute("aria-current")).toBe("page");
    expect(items[1].firstElementChild?.getAttribute("data-testid")).toBe("cur");
  });

  it("stays without icons when none are given", () => {
    const c = render(<BlockAppShell sidebar={<aside />} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contacts" }]} />).container;
    expect(c.querySelector(".oc-block-shell-breadcrumbs svg")).toBeNull();
  });
});
