// File: packages/react/test/v0170-desk.test.tsx
// Map: BackLink fallbackHref/fallbackLabel (history.back() within the site, else the fallback) -> Badge icon + title ->
//      Button iconStart/iconEnd + as (ButtonLink icons too) -> RadioGroup error -> FormSection dense + defaultOpen ->
//      LauncherCard disabledFooter

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { BackLink, canGoBack } from "../src/components/BackLink";
import { Badge } from "../src/components/Badge";
import { Button, ButtonLink } from "../src/components/Button";
import { Radio, RadioGroup } from "../src/components/Radio";
import { FormSection } from "../src/components/FormSection";
import { LauncherCard } from "../src/components/LauncherCard";
import { registerWebicons } from "../src/components/Webicon";

registerWebicons({
  prefix: "mdi",
  width: 24,
  height: 24,
  icons: { check: { body: '<path d="M9 16l-4-4l1.4-1.4L9 13.2l7.6-7.6L18 7z"/>' }, plus: { body: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>' } },
});

/** Pretend the tab has `length` history entries and the given referrer. */
function history(length: number, referrer = "") {
  Object.defineProperty(window.history, "length", { configurable: true, get: () => length });
  Object.defineProperty(document, "referrer", { configurable: true, get: () => referrer });
}
// jsdom cannot navigate: stop every link click that reaches the document (after the component had its turn).
const noNavigation = (e: Event) => e.preventDefault();
beforeEach(() => document.addEventListener("click", noNavigation));
afterEach(() => {
  document.removeEventListener("click", noNavigation);
  delete (window.history as unknown as Record<string, unknown>).length;
  delete (document as unknown as Record<string, unknown>).referrer;
  vi.restoreAllMocks();
});

describe("0.17.0 back link with a fallback", () => {
  it("without fallbackHref it stays a plain link", () => {
    history(3, `${location.origin}/products`);
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<BackLink href="/products">Back to Products</BackLink>);
    const a = screen.getByRole("link", { name: "Back to Products" });
    expect(a.getAttribute("href")).toBe("/products");
    fireEvent.click(a);
    expect(back).not.toHaveBeenCalled();
  });

  it("goes back in the history when the visitor came from this site", () => {
    history(1, `${location.origin}/products?page=2`);
    expect(canGoBack()).toBe(true);
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<BackLink fallbackHref="/products" fallbackLabel="Back to Products">Back</BackLink>);
    const a = screen.getByRole("link", { name: "Back" });
    expect(a.getAttribute("href")).toBe("/products");
    fireEvent.click(a);
    expect(back).toHaveBeenCalledTimes(1);
    // A ctrl-click opens the fallback in a new tab.
    fireEvent.click(a, { ctrlKey: true });
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("follows the fallback with its label when there is nothing to go back to", () => {
    history(1, "https://elsewhere.example/page");
    expect(canGoBack()).toBe(false);
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<BackLink fallbackHref="/products" fallbackLabel="Back to Products">Back</BackLink>);
    const a = screen.getByRole("link", { name: "Back to Products" });
    fireEvent.click(a);
    expect(back).not.toHaveBeenCalled();
  });

  it("history.length > 1 also counts", () => {
    history(2);
    expect(canGoBack()).toBe(true);
  });
});

describe("0.17.0 badge icon and title", () => {
  it("draws a webicon before the text and keeps the title as tooltip", () => {
    const { container } = render(<Badge variant="success" icon="mdi:check" title="Paid on 1 March">Paid</Badge>);
    const badge = container.querySelector(".oc-badge")!;
    expect(badge.className).toBe("oc-badge oc-badge--success");
    expect(badge.getAttribute("title")).toBe("Paid on 1 March");
    expect(badge.getAttribute("role")).toBeNull();
    expect(badge.firstElementChild?.getAttribute("data-webicon")).toBe("mdi:check");
    expect(badge.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
    expect(badge.textContent).toBe("Paid");
  });

  it("an icon-only badge gets its name from the title", () => {
    render(<Badge icon="mdi:check" title="Verified" />);
    expect(screen.getByRole("img", { name: "Verified" }).className).toBe("oc-badge");
  });

  it("an icon node is used as it is", () => {
    const { container } = render(<Badge icon={<i className="x" />}>New</Badge>);
    expect(container.querySelector(".oc-badge > i.x")).not.toBeNull();
  });
});

describe("0.17.0 button icons and as", () => {
  it("boolean icon still makes the square icon button", () => {
    const { container } = render(<Button icon aria-label="Add">+</Button>);
    expect(container.innerHTML).toBe('<button class="oc-btn oc-btn--icon" aria-label="Add">+</button>');
  });

  it("iconStart and iconEnd put webicons around the label", () => {
    const { container } = render(<Button iconStart="mdi:plus" iconEnd="mdi:check" variant="outline">New customer</Button>);
    const btn = container.querySelector("button")!;
    expect(btn.className).toBe("oc-btn oc-btn--outline");
    expect([...btn.childNodes].map((n) => (n as Element).getAttribute?.("data-webicon") ?? n.textContent)).toEqual(["mdi:plus", "New customer", "mdi:check"]);
  });

  it("ButtonLink takes the icons too", () => {
    const { container } = render(<ButtonLink href="/next" iconEnd="mdi:check">Next step</ButtonLink>);
    const a = container.querySelector("a.oc-btn")!;
    expect(a.lastElementChild?.getAttribute("data-webicon")).toBe("mdi:check");
  });

  it("as renders another element with the button classes", () => {
    const { container } = render(<Button as="a" href="/customers" variant="secondary" size="sm">Customers</Button>);
    const a = container.querySelector("a")!;
    expect(a.className).toBe("oc-btn oc-btn--secondary oc-btn--sm");
    expect(a.getAttribute("href")).toBe("/customers");
    expect(a.hasAttribute("disabled")).toBe(false);
  });

  it("as with a component passes its props through; disabled becomes aria-disabled", () => {
    const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(function RouterLink({ to, ...rest }, ref) {
      return <a ref={ref} href={to} data-router="" {...rest} />;
    });
    const { container } = render(<Button as={RouterLink} to="/orders" disabled iconStart="mdi:plus">Orders</Button>);
    const a = container.querySelector("a[data-router]")!;
    expect(a.getAttribute("href")).toBe("/orders");
    expect(a.className).toBe("oc-btn");
    expect(a.getAttribute("aria-disabled")).toBe("true");
    expect(a.firstElementChild?.getAttribute("data-webicon")).toBe("mdi:plus");
  });

  it("a plain button still disables natively while loading", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute("aria-busy")).toBe("true");
  });
});

describe("0.17.0 radio group error", () => {
  it("shows the message and links every radio to it", () => {
    const { container } = render(
      <RadioGroup name="plan" legend="Plan" error="Choose a plan" options={[{ value: "a", label: "Basic" }, { value: "b", label: "Team" }]} />,
    );
    const err = container.querySelector("p.oc-field-error")!;
    expect(err.id).toBe("plan-error");
    expect(err.getAttribute("role")).toBe("alert");
    expect(err.textContent).toBe("Choose a plan");
    const radios = container.querySelectorAll("input.oc-radio");
    expect(radios).toHaveLength(2);
    radios.forEach((r) => {
      expect(r.getAttribute("aria-invalid")).toBe("true");
      expect(r.getAttribute("aria-describedby")).toBe("plan-error");
    });
  });

  it("works with Radio children, and without error nothing changes", () => {
    const { container, rerender } = render(<RadioGroup name="size" error="Pick one"><Radio value="s">S</Radio></RadioGroup>);
    expect(container.querySelector("input")!.getAttribute("aria-describedby")).toBe("size-error");
    rerender(<RadioGroup name="size"><Radio value="s">S</Radio></RadioGroup>);
    expect(container.querySelector(".oc-field-error")).toBeNull();
    expect(container.querySelector("input")!.hasAttribute("aria-invalid")).toBe(false);
  });
});

describe("0.17.0 form section dense and defaultOpen", () => {
  it("dense adds the modifier, defaultOpen opens it once", () => {
    const { container } = render(<FormSection title="Address" dense defaultOpen><input /></FormSection>);
    const details = container.querySelector("details")!;
    expect(details.className).toBe("oc-form-section oc-form-section--dense");
    expect(details.open).toBe(true);
  });

  it("without the props it stays closed and plain", () => {
    const { container } = render(<FormSection title="Address"><input /></FormSection>);
    const details = container.querySelector("details")!;
    expect(details.className).toBe("oc-form-section");
    expect(details.open).toBe(false);
  });
});

describe("0.17.0 launcher card disabledFooter", () => {
  it("shows the disabled footer only while disabled", () => {
    const { container, rerender } = render(<LauncherCard title="Invoices" footer="12 open" disabledFooter="Ask your admin for access" disabled />);
    expect(container.querySelector(".oc-launcher-footer")!.textContent).toBe("Ask your admin for access");
    expect(container.querySelector(".oc-launcher")!.getAttribute("aria-disabled")).toBe("true");
    rerender(<LauncherCard title="Invoices" href="/invoices" footer="12 open" disabledFooter="Ask your admin for access" />);
    expect(container.querySelector(".oc-launcher-footer")!.textContent).toBe("12 open");
  });
});
