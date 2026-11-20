// File: packages/react/test/v0170-w1.test.tsx
// Map: button group -> spinner -> separator -> slider -> kbd -> label -> item -> toggle -> aspect ratio -> hover card ->
//      scroll area -> radio -> drawer -> code window -> date picker -> carousel -> resizable -> menubar -> context menu -> search
// 0.17.0 (W1): the snippet components that only Vue and Blade had, plus the new ones in all three frameworks.

import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ButtonGroup, ButtonGroupText } from "../src/components/ButtonGroup";
import { Button } from "../src/components/Button";
import { Spinner } from "../src/components/Spinner";
import { Separator } from "../src/components/Separator";
import { Slider, sliderProgress } from "../src/components/Slider";
import { Kbd, KbdGroup } from "../src/components/Kbd";
import { Label } from "../src/components/Label";
import { Item, ItemGroup, ItemSeparator } from "../src/components/Item";
import { Toggle, ToggleGroup } from "../src/components/Toggle";
import { AspectRatio } from "../src/components/AspectRatio";
import { HoverCard } from "../src/components/HoverCard";
import { ScrollArea } from "../src/components/ScrollArea";
import { Radio, RadioGroup } from "../src/components/Radio";
import { Drawer, DrawerClose } from "../src/components/Drawer";
import { CodeWindow } from "../src/components/CodeWindow";
import { DatePicker } from "../src/components/DatePicker";
import { Carousel, CarouselItem } from "../src/components/Carousel";
import { Resizable, ResizablePanel } from "../src/components/Resizable";
import { Menubar } from "../src/components/Menubar";
import { ContextMenu } from "../src/components/ContextMenu";
import { Search } from "../src/components/Search";

describe("0.17.0 W1 simple components", () => {
  it("button group with text cell", () => {
    const { container } = render(<ButtonGroup vertical label="Pages"><Button variant="outline">1</Button><ButtonGroupText>of 3</ButtonGroupText></ButtonGroup>);
    const g = container.firstElementChild!;
    expect(g.className).toBe("oc-btn-group oc-btn-group--vertical");
    expect(g.getAttribute("role")).toBe("group");
    expect(g.getAttribute("aria-label")).toBe("Pages");
    expect(container.querySelector("span.oc-btn-group-text")!.textContent).toBe("of 3");
  });

  it("spinner: status with a label, hidden without", () => {
    const { container } = render(<><Spinner size="lg" color="primary" label="Loading" /><Spinner size="md" /></>);
    const [a, b] = Array.from(container.querySelectorAll("span"));
    expect(a.className).toBe("oc-spinner oc-spinner--lg oc-spinner--primary");
    expect(a.getAttribute("role")).toBe("status");
    expect(b.className).toBe("oc-spinner");
    expect(b.getAttribute("aria-hidden")).toBe("true");
  });

  it("separator: hr, vertical, text", () => {
    const { container } = render(<><Separator strong /><Separator vertical /><Separator label="or" /></>);
    expect(container.querySelector("hr")!.className).toBe("oc-separator oc-separator--strong");
    const v = container.querySelector("span.oc-separator")!;
    expect(v.className).toBe("oc-separator oc-separator--vertical");
    expect(v.getAttribute("aria-orientation")).toBe("vertical");
    expect(container.querySelector(".oc-separator-text > span")!.textContent).toBe("or");
  });

  it("slider keeps the fill in sync", () => {
    expect(sliderProgress(350, 100, 600)).toBe("50%");
    expect(sliderProgress(-5)).toBe("0%");
    const onValueChange = vi.fn();
    const { container } = render(<Slider min={100} max={600} defaultValue={350} onValueChange={onValueChange} aria-label="Goal" />);
    const input = container.querySelector("input")!;
    expect(input.className).toBe("oc-slider");
    expect(input.style.getPropertyValue("--oc-slider-progress")).toBe("50%");
    fireEvent.change(input, { target: { value: "600" } });
    expect(onValueChange).toHaveBeenCalledWith(600);
    expect(input.style.getPropertyValue("--oc-slider-progress")).toBe("100%");
  });

  it("kbd and kbd group with separators", () => {
    const { container } = render(<><Kbd>Esc</Kbd><KbdGroup keys={["Ctrl", "K"]} separator /></>);
    expect(container.querySelector("kbd")!.className).toBe("oc-kbd");
    const g = container.querySelector(".oc-kbd-group")!;
    expect(g.querySelectorAll("kbd.oc-kbd")).toHaveLength(2);
    expect(g.querySelector(".oc-kbd-sep")!.textContent).toBe("+");
  });

  it("label modifiers", () => {
    const { container } = render(<Label htmlFor="email" required muted>Email</Label>);
    const l = container.querySelector("label")!;
    expect(l.className).toBe("oc-label oc-label--required oc-label--muted");
    expect(l.getAttribute("for")).toBe("email");
  });

  it("item: link, media, actions, group", () => {
    const { container } = render(
      <ItemGroup>
        <Item href="/a" variant="outline" size="sm" interactive title="Customer 1" description="info@company1.example" media="C1" icon actions={<Button size="sm">Open</Button>} />
        <ItemSeparator />
        <Item title="Plain" />
      </ItemGroup>,
    );
    expect(container.firstElementChild!.className).toBe("oc-item-group");
    const a = container.querySelector("a")!;
    expect(a.className).toBe("oc-item oc-item--outline oc-item--sm oc-item--interactive");
    expect(a.querySelector(".oc-item-media")!.className).toBe("oc-item-media oc-item-media--icon");
    expect(a.querySelector(".oc-item-title")!.textContent).toBe("Customer 1");
    expect(a.querySelector(".oc-item-description")!.textContent).toBe("info@company1.example");
    expect(a.querySelector(".oc-item-actions button")).not.toBeNull();
    expect(container.querySelector("hr")!.className).toBe("oc-item-separator");
    expect(container.querySelector("div.oc-item")!.querySelector(".oc-item-media")).toBeNull();
  });

  it("aspect ratio: preset and custom", () => {
    const { container } = render(<><AspectRatio ratio="square" center /><AspectRatio ratio="5 / 2" /></>);
    const [a, b] = Array.from(container.children) as HTMLElement[];
    expect(a.className).toBe("oc-aspect oc-aspect--square oc-aspect--center");
    expect(b.className).toBe("oc-aspect");
    expect(b.style.getPropertyValue("--oc-aspect")).toBe("5 / 2");
  });

  it("hover card wires interestfor to the popover", () => {
    const { container } = render(<HoverCard label="Company 1" top small>Card</HoverCard>);
    expect(container.firstElementChild!.className).toBe("oc-hover-card oc-hover-card--top");
    const a = container.querySelector("a.oc-hover-card-trigger")!;
    const c = container.querySelector(".oc-hover-card-content")!;
    expect(c.className).toBe("oc-hover-card-content oc-hover-card-content--sm");
    expect(c.hasAttribute("popover")).toBe(true);
    expect(a.getAttribute("interestfor")).toBe(c.id);
  });

  it("scroll area is a focusable region", () => {
    const { container } = render(<ScrollArea horizontal shadows label="Tags">x</ScrollArea>);
    const s = container.firstElementChild!;
    expect(s.className).toBe("oc-scroll-area oc-scroll-area--x oc-scroll-area--shadows");
    expect(s.getAttribute("tabindex")).toBe("0");
    expect(s.getAttribute("role")).toBe("region");
  });
});

describe("0.17.0 W1 toggle and radio", () => {
  it("standalone toggle (checkbox and button)", () => {
    const onPressedChange = vi.fn();
    const { container } = render(<><Toggle variant="outline" size="sm" icon aria-label="Bold" onPressedChange={onPressedChange}>B</Toggle><Toggle button defaultPressed>I</Toggle></>);
    const label = container.querySelector("label")!;
    expect(label.className).toBe("oc-toggle oc-toggle--outline oc-toggle--sm oc-toggle--icon");
    const input = label.querySelector("input")!;
    expect(input.type).toBe("checkbox");
    expect(input.getAttribute("aria-label")).toBe("Bold");
    fireEvent.click(input);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    const btn = container.querySelector("button.oc-toggle")!;
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("toggle group single and multiple", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <>
        <ToggleGroup type="single" defaultValue="left" label="Align" spaced name="align"><Toggle value="left">L</Toggle><Toggle value="right">R</Toggle></ToggleGroup>
        <ToggleGroup defaultValue={["b"]} onValueChange={onValueChange}><Toggle value="b">B</Toggle><Toggle value="i">I</Toggle></ToggleGroup>
      </>,
    );
    const [single, multi] = Array.from(container.querySelectorAll(".oc-toggle-group"));
    expect(single.className).toBe("oc-toggle-group oc-toggle-group--spaced");
    expect(single.getAttribute("role")).toBe("radiogroup");
    const radios = single.querySelectorAll<HTMLInputElement>("input[type=radio][name=align]");
    expect(radios).toHaveLength(2);
    expect(radios[0].checked).toBe(true);
    fireEvent.click(radios[1]);
    expect(radios[1].checked).toBe(true);
    expect(multi.getAttribute("role")).toBe("group");
    fireEvent.click(multi.querySelectorAll("input")[1]);
    expect(onValueChange).toHaveBeenCalledWith(["b", "i"]);
  });

  it("radio group from options, card items", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <RadioGroup legend="Plan" row card defaultValue="pro" onValueChange={onValueChange} options={[{ value: "free", label: "Free" }, { value: "pro", label: "Pro", description: "For teams" }]} />,
    );
    const fs = container.querySelector("fieldset")!;
    expect(fs.className).toBe("oc-radio-group oc-radio-group--row");
    expect(fs.querySelector("legend.oc-label")!.textContent).toBe("Plan");
    const items = fs.querySelectorAll("label");
    expect(items[0].className).toBe("oc-radio-item oc-radio-item--card");
    const inputs = fs.querySelectorAll<HTMLInputElement>("input.oc-radio");
    expect(inputs[1].checked).toBe(true);
    expect(inputs[0].name).toBe(inputs[1].name);
    expect(items[1].querySelector("span > small")!.textContent).toBe("For teams");
    fireEvent.click(inputs[0]);
    expect(onValueChange).toHaveBeenCalledWith("free");
  });

  it("standalone radio", () => {
    const { container } = render(<Radio name="x" value="a" defaultChecked>A</Radio>);
    expect(container.querySelector("label")!.className).toBe("oc-radio-item");
    expect(container.querySelector("input")!.checked).toBe(true);
  });
});

describe("0.17.0 W1 drawer, code window, date picker, carousel", () => {
  it("drawer markup, trigger command and close", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Drawer id="goal" title="Move goal" description="Set your daily activity goal." trigger="Open drawer" onOpenChange={onOpenChange} footer={<DrawerClose>Cancel</DrawerClose>}>
        Body
      </Drawer>,
    );
    const trigger = container.querySelector("button.oc-btn")!;
    expect(trigger.getAttribute("command")).toBe("show-modal");
    expect(trigger.getAttribute("commandfor")).toBe("goal");
    const d = container.querySelector("dialog")!;
    expect(d.className).toBe("oc-drawer");
    expect(d.getAttribute("closedby")).toBe("any");
    expect(d.getAttribute("aria-labelledby")).toBe("goal-title");
    expect(d.querySelector(".oc-drawer-content > .oc-drawer-handle")!.getAttribute("aria-hidden")).toBe("true");
    expect(d.querySelector("h2.oc-drawer-title")!.id).toBe("goal-title");
    expect(d.querySelector("p.oc-drawer-description")!.textContent).toBe("Set your daily activity goal.");
    expect(d.querySelector(".oc-drawer-body")!.textContent).toBe("Body");
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(d.querySelector(".oc-drawer-footer button")!);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("drawer center modifier", () => {
    const { container } = render(<Drawer center title="T" />);
    expect(container.querySelector("dialog")!.className).toBe("oc-drawer oc-drawer--center");
  });

  it("code window copies the code", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { container } = render(<CodeWindow title="index.html" code={'<button class="oc-btn">Hello</button>'} />);
    expect(container.firstElementChild!.className).toBe("oc-code-window");
    expect(container.querySelectorAll(".oc-code-window__bar > i")).toHaveLength(3);
    expect(container.querySelector(".oc-code-window__title")!.textContent).toBe("index.html");
    expect(container.querySelector("pre.oc-code-window__body > code")!.textContent).toContain("oc-btn");
    const btn = container.querySelector("button.oc-code-copy")!;
    await act(async () => { fireEvent.click(btn); });
    expect(writeText).toHaveBeenCalledWith('<button class="oc-btn">Hello</button>');
    expect(btn.className).toBe("oc-code-copy is-copied");
    expect(btn.textContent).toBe("Copied");
  });

  it("code window with own body, dark, no copy", () => {
    const { container } = render(<CodeWindow dark copy={false} title="app.js"><div className="oc-code-block">x</div></CodeWindow>);
    expect(container.firstElementChild!.className).toBe("oc-code-window oc-code-window--dark");
    expect(container.querySelector(".oc-code-copy")).toBeNull();
    expect(container.querySelector(".oc-code-block")).not.toBeNull();
  });

  it("date picker: placeholder, pick, value on the trigger", () => {
    const onChange = vi.fn();
    const { container } = render(<DatePicker locale="en-GB" today="2026-10-14" defaultValue="2026-10-16" onChange={onChange} name="when" />);
    const trigger = container.querySelector("button.oc-date-picker-trigger")!;
    expect(trigger.className).toBe("oc-btn oc-btn--outline oc-date-picker-trigger");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.querySelector("span")!.textContent).toBe("16 October 2026");
    expect(trigger.hasAttribute("data-empty")).toBe(false);
    const pop = container.querySelector(".oc-popover")!;
    expect(pop.className).toBe("oc-popover oc-popover--calendar");
    expect(trigger.getAttribute("popovertarget")).toBe(pop.id);
    expect(pop.querySelector(".oc-calendar")).not.toBeNull();
    fireEvent.click(pop.querySelector('button[data-date="2026-10-20"]')!);
    expect(onChange).toHaveBeenCalledWith("2026-10-20");
    expect(trigger.querySelector("span")!.textContent).toBe("20 October 2026");
    expect(container.querySelector<HTMLInputElement>("input[type=hidden][name=when]")!.value).toBe("2026-10-20");
  });

  it("date picker empty shows the placeholder", () => {
    const { container } = render(<DatePicker placeholder="Pick a date" />);
    const trigger = container.querySelector("button.oc-date-picker-trigger")!;
    expect(trigger.hasAttribute("data-empty")).toBe(true);
    expect(trigger.querySelector("span")!.textContent).toBe("Pick a date");
  });

  it("carousel numbers the slides and renders the dots", () => {
    const { container } = render(
      <Carousel id="hl" label="Highlights" per="halves">
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem id="own">Slide 2</CarouselItem>
        <span>Slide 3</span>
      </Carousel>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-carousel oc-carousel--halves");
    const vp = root.querySelector(".oc-carousel-viewport")!;
    expect(vp.getAttribute("aria-roledescription")).toBe("carousel");
    expect(vp.getAttribute("aria-label")).toBe("Highlights");
    const items = vp.querySelectorAll(".oc-carousel-item");
    expect(items).toHaveLength(3);
    expect(items[0].getAttribute("aria-label")).toBe("1 of 3");
    expect(items[1].id).toBe("own");
    expect(items[2].getAttribute("aria-roledescription")).toBe("slide");
    const dots = root.querySelectorAll("nav.oc-carousel-dots a.oc-carousel-dot");
    expect(Array.from(dots).map((d) => d.getAttribute("href"))).toEqual(["#hl-slide-1", "#own", "#hl-slide-3"]);
    expect(root.hasAttribute("data-oc-dots")).toBe(true);
  });

  it("carousel loop buttons", () => {
    const { container } = render(<Carousel loop dots={false}><div>A</div><div>B</div></Carousel>);
    const root = container.firstElementChild!;
    expect(root.className).toBe("oc-carousel oc-carousel--loop");
    expect(root.querySelector(".oc-carousel-prev")!.getAttribute("aria-controls")).toBe(root.querySelector(".oc-carousel-viewport")!.id);
    expect(root.querySelector(".oc-carousel-next")).not.toBeNull();
    expect(root.querySelector(".oc-carousel-dots")).toBeNull();
    expect(root.hasAttribute("data-oc-loop")).toBe(true);
  });
});

describe("0.17.0 W1 tier B", () => {
  it("resizable panels and box", () => {
    const { container } = render(<><Resizable vertical><ResizablePanel resizable>A</ResizablePanel><ResizablePanel>B</ResizablePanel></Resizable><Resizable box /></>);
    const [a, b] = Array.from(container.children);
    expect(a.className).toBe("oc-resizable oc-resizable--vertical");
    expect(a.firstElementChild!.className).toBe("oc-resizable-panel oc-resizable-panel--resizable");
    expect(b.className).toBe("oc-resizable-box oc-resizable");
  });

  it("menubar: triggers point at popover menus", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Menubar
        label="Application"
        menus={[
          { label: "File", items: [{ label: "New tab", shortcut: "Ctrl T", onSelect }, { separator: true }, { label: "Share", items: [{ label: "E-mail link" }] }] },
          { label: "View", items: [{ label: "Always show bookmarks", checked: true }, { label: "Delete", destructive: true }] },
        ]}
      />,
    );
    const bar = container.querySelector(".oc-menubar")!;
    expect(bar.getAttribute("role")).toBe("menubar");
    const triggers = bar.querySelectorAll("button.oc-menubar-trigger");
    expect(triggers).toHaveLength(2);
    const menu = container.querySelector(`#${triggers[0].getAttribute("popovertarget")}`)!;
    expect(menu.className).toBe("oc-dropdown-menu");
    expect(menu.getAttribute("role")).toBe("menu");
    expect(menu.querySelector(".oc-dropdown-shortcut")!.textContent).toBe("Ctrl T");
    expect(menu.querySelector(".oc-dropdown-separator")!.getAttribute("role")).toBe("separator");
    expect(menu.querySelector(".oc-dropdown-sub > .oc-dropdown-submenu[role=menu]")).not.toBeNull();
    fireEvent.click(menu.querySelector("button.oc-dropdown-item")!);
    expect(onSelect).toHaveBeenCalled();
    const view = container.querySelector(`#${triggers[1].getAttribute("popovertarget")}`)!;
    expect(view.querySelector("[role=menuitemcheckbox]")!.getAttribute("aria-checked")).toBe("true");
    expect(view.querySelector(".oc-dropdown-item--destructive")).not.toBeNull();
  });

  it("context menu positions at the pointer", () => {
    const { container } = render(<ContextMenu items={[{ label: "Reload", shortcut: "Ctrl R" }]}>Right-click here</ContextMenu>);
    const area = container.querySelector(".oc-context-area")!;
    expect(area.getAttribute("tabindex")).toBe("0");
    const menu = container.querySelector<HTMLElement>(".oc-context-menu")!;
    expect(menu.className).toBe("oc-dropdown-menu oc-context-menu");
    expect(menu.getAttribute("aria-label")).toBe("Actions");
    fireEvent.contextMenu(area, { clientX: 40, clientY: 50 });
    expect(menu.style.getPropertyValue("--oc-context-x")).toBe("40px");
    expect(menu.style.getPropertyValue("--oc-context-y")).toBe("50px");
  });

  it("search field", () => {
    const { container } = render(<Search name="q" placeholder="Search the docs" hint="/" />);
    expect(container.firstElementChild!.className).toBe("oc-search");
    expect(container.querySelector("svg")!.getAttribute("class")).toBe("oc-search-icon");
    const input = container.querySelector("input")!;
    expect(input.className).toBe("oc-search-input");
    expect(input.type).toBe("search");
    expect(input.getAttribute("aria-label")).toBe("Search the docs");
    expect(container.querySelector("kbd.oc-search-hint")!.textContent).toBe("/");
  });
});
