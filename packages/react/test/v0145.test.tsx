// File: packages/react/test/v0145.test.tsx
// Map: DropdownItem closes its popover menu after a click -> keepOpen / check item / preventDefault keep it open

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown, DropdownItem } from "../src/components/Dropdown";

function setup(item: JSX.Element) {
  const { container } = render(<Dropdown trigger="Export">{item}</Dropdown>);
  const menu = container.querySelector<HTMLElement>(".oc-dropdown-menu")!;
  const hide = vi.fn();
  menu.hidePopover = hide;
  fireEvent.click(container.querySelector(".oc-dropdown-item")!);
  return hide;
}

describe("0.14.5 DropdownItem closes the menu", () => {
  it("a click runs onClick and closes the menu", () => {
    const onClick = vi.fn();
    expect(setup(<DropdownItem onClick={onClick}>CSV</DropdownItem>)).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keepOpen, a check item and preventDefault keep it open; a check item can still opt in", () => {
    expect(setup(<DropdownItem keepOpen>CSV</DropdownItem>)).not.toHaveBeenCalled();
    expect(setup(<DropdownItem checked>Wrap</DropdownItem>)).not.toHaveBeenCalled();
    expect(setup(<DropdownItem onClick={(e) => e.preventDefault()}>CSV</DropdownItem>)).not.toHaveBeenCalled();
    expect(setup(<DropdownItem checked keepOpen={false}>Wrap</DropdownItem>)).toHaveBeenCalledOnce();
  });
});

import { User } from "../src/components/User";
import { initialsOf } from "../src/utils";

describe("0.14.5 User initials from a ReactNode name", () => {
  it("takes the text, skips a part in brackets and words without a letter", () => {
    expect(initialsOf(<>Contact 1 <small>(you)</small></>)).toBe("C1");
    expect(initialsOf(["Team", " ", <b key="b">Blue</b>])).toBe("TB");
    expect(initialsOf("Ada · Lovelace")).toBe("AL");
    const { container } = render(<User name={<>Contact 1 <small>(you)</small></>} />);
    expect(container.querySelector(".oc-avatar")!.textContent).toBe("C1");
  });
});
