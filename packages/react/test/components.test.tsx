import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  Badge,
  BlockHero,
  BlockPricing,
  Button,
  ButtonLink,
  Command,
  CopyField,
  FormField,
  Input,
  Modal,
  ModalClose,
  PasswordInput,
  Segmented,
  Stepper,
  Toast,
  ToastProvider,
  useToast,
} from "../src";

describe("Button", () => {
  it("renders the default variant with the base class only", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("oc-btn");
    expect(screen.getByRole("button").className).toBe("oc-btn");
  });

  it.each([
    ["secondary", "oc-btn--secondary"],
    ["outline", "oc-btn--outline"],
    ["ghost", "oc-btn--ghost"],
    ["destructive", "oc-btn--destructive"],
    ["link", "oc-btn--link"],
    ["success", "oc-btn--success"],
  ] as const)("maps variant %s to %s", (variant, cls) => {
    render(<Button variant={variant}>x</Button>);
    expect(screen.getByRole("button")).toHaveClass("oc-btn", cls);
  });

  it("maps size, icon and merges className, ref and rest props", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} size="sm" icon className="extra" data-x="1" disabled>
        x
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toBe("oc-btn oc-btn--sm oc-btn--icon extra");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("data-x", "1");
    expect(ref.current).toBe(btn);
  });

  it("md size adds no modifier; lg does", () => {
    const { rerender } = render(<Button size="md">x</Button>);
    expect(screen.getByRole("button").className).toBe("oc-btn");
    rerender(<Button size="lg">x</Button>);
    expect(screen.getByRole("button")).toHaveClass("oc-btn--lg");
  });

  it("ButtonLink renders an anchor with button classes", () => {
    render(<ButtonLink href="/x" variant="outline">Go</ButtonLink>);
    expect(screen.getByRole("link", { name: "Go" })).toHaveClass("oc-btn", "oc-btn--outline");
  });
});

describe("Badge", () => {
  it("maps the variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error")).toHaveClass("oc-badge", "oc-badge--destructive");
  });
});

describe("Modal", () => {
  it("calls showModal when open and close when it closes again", () => {
    const show = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    const close = vi.spyOn(HTMLDialogElement.prototype, "close");
    const { container, rerender } = render(
      <Modal open={false} title="Are you sure?" description="Cannot be undone." footer={<button>OK</button>}>
        body
      </Modal>,
    );
    const dialog = container.querySelector("dialog.oc-modal") as HTMLDialogElement;
    expect(dialog).not.toBeNull();
    expect(show).not.toHaveBeenCalled();

    rerender(
      <Modal open title="Are you sure?" description="Cannot be undone." footer={<button>OK</button>}>
        body
      </Modal>,
    );
    expect(show).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector(".oc-modal-title")).toHaveTextContent("Are you sure?");
    expect(dialog.getAttribute("aria-labelledby")).toBe(dialog.querySelector(".oc-modal-title")!.id);
    expect(dialog.querySelector(".oc-modal-footer")).toBeInTheDocument();

    rerender(<Modal open={false} title="Are you sure?">body</Modal>);
    expect(close).toHaveBeenCalled();
    show.mockRestore();
    close.mockRestore();
  });

  it("reports closing through onOpenChange (ModalClose) in uncontrolled mode", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Modal defaultOpen onOpenChange={onOpenChange} title="T" footer={<ModalClose variant="outline">Cancel</ModalClose>} />,
    );
    const dialog = container.querySelector("dialog") as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Cancel", hidden: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(dialog.open).toBe(false);
  });

  it("AlertDialog renders the type modifier and icon", () => {
    const { container } = render(<AlertDialog open type="error" title="Delete?" message="Gone." />);
    expect(container.querySelector(".oc-alert-dialog--error")).toBeInTheDocument();
    expect(container.querySelector(".oc-alert-dialog-icon")).toHaveTextContent("×");
  });
});

describe("Toast", () => {
  it("renders a single toast with variant, role and dismiss", () => {
    const onDismiss = vi.fn();
    render(<Toast variant="error" title="Failed" description="Try again" onDismiss={onDismiss} />);
    const el = screen.getByRole("alert");
    expect(el).toHaveClass("oc-toast", "oc-toast--error");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("queues toasts through useToast and auto-dismisses them", () => {
    vi.useFakeTimers();
    function Trigger() {
      const { toast } = useToast();
      return <button onClick={() => toast({ variant: "success", title: "Saved", duration: 1000 })}>fire</button>;
    }
    const { container } = render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("fire"));
    fireEvent.click(screen.getByText("fire"));
    expect(container.ownerDocument.querySelectorAll(".oc-toast--success")).toHaveLength(2);
    expect(container.ownerDocument.querySelector(".oc-toast-container")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[0]);
    expect(container.ownerDocument.querySelectorAll(".oc-toast--success")).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(container.ownerDocument.querySelectorAll(".oc-toast--success")).toHaveLength(0);
    vi.useRealTimers();
  });

  it("useToast throws outside a provider", () => {
    function Bad() {
      useToast();
      return null;
    }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

describe("wrapper logic", () => {
  it("Command filters items and tracks aria-selected", () => {
    const onSelect = vi.fn();
    render(
      <Command
        onSelect={onSelect}
        groups={[
          { label: "Suggestions", items: [{ id: "inv", label: "New invoice", shortcut: "Ctrl N" }, { id: "con", label: "Open contacts" }] },
          { label: "Settings", items: [{ id: "app", label: "Appearance" }, { id: "bil", label: "Billing", disabled: true }] },
        ]}
      />,
    );
    const options = () => screen.getAllByRole("option", { hidden: true });
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "contact" } });
    expect(screen.getByText("Open contacts")).not.toHaveAttribute("hidden");
    expect(screen.getByText("New invoice", { exact: false })).toHaveAttribute("hidden");
    expect(screen.getByText("Open contacts")).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "con" }));
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(document.querySelector(".oc-command-empty")).not.toHaveAttribute("hidden");
  });

  it("PasswordInput toggles type and aria-pressed", () => {
    render(<PasswordInput defaultValue="secret" aria-label="pw" />);
    const input = screen.getByLabelText("pw") as HTMLInputElement;
    const btn = screen.getByRole("button", { name: "Toggle password visibility" });
    expect(input.type).toBe("password");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn);
    expect(input.type).toBe("text");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveTextContent("Hide");
  });

  it("CopyField writes to the clipboard and sets is-copied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyField value="JBSW" label="Setup key" />);
    const btn = screen.getByRole("button", { name: "Copy" });
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(writeText).toHaveBeenCalledWith("JBSW");
    expect(btn).toHaveClass("oc-copy-field-button", "is-copied");
  });

  it("FormField wires label, description and error to the control", () => {
    render(
      <FormField label="Email" description="We never share it." error="Invalid">
        <Input type="email" />
      </FormField>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain("-help");
    expect(screen.getByText("We never share it.")).toHaveClass("oc-field-description");
  });

  it("Segmented works controlled and uncontrolled", () => {
    const onChange = vi.fn();
    function Wrap() {
      const [v, setV] = useState("month");
      return <Segmented aria-label="Period" value={v} onChange={(x) => { setV(x); onChange(x); }} options={[{ value: "month", label: "Month" }, { value: "year", label: "Year" }]} />;
    }
    render(<Wrap />);
    fireEvent.click(screen.getByLabelText("Year"));
    expect(onChange).toHaveBeenCalledWith("year");
    expect(screen.getByLabelText("Year")).toBeChecked();
  });

  it("Stepper marks done, active and upcoming steps", () => {
    render(<Stepper steps={[{ label: "A", meta: "1/3" }, { label: "B" }, { label: "C" }]} current={1} />);
    const [a, b, c] = screen.getAllByRole("button");
    expect(a).toHaveClass("oc-stepper-item--done");
    expect(b).toHaveClass("oc-stepper-item--active");
    expect(b).toHaveAttribute("aria-current", "step");
    expect(c).toBeDisabled();
  });
});

describe("blocks", () => {
  it("BlockHero renders the snippet structure", () => {
    const { container } = render(<BlockHero badge="New" title="Hi" description="Text" actions={<Button>Go</Button>} />);
    expect(container.querySelector(".oc-block-hero > .oc-block-hero-badge")).toHaveTextContent("New");
    expect(container.querySelector(".oc-block-hero > h1")).toHaveTextContent("Hi");
    expect(container.querySelector(".oc-block-hero-actions .oc-btn")).toBeInTheDocument();
  });

  it("BlockPricing marks the featured plan", () => {
    const { container } = render(
      <BlockPricing plans={[{ name: "Free", price: "0", features: ["a"], action: "Start" }, { name: "Pro", price: "29", period: "/month", features: ["b"], action: "Buy", featured: true }]} />,
    );
    expect(container.querySelectorAll(".oc-block-pricing-card")).toHaveLength(2);
    expect(container.querySelector(".oc-block-pricing-card--featured .oc-btn--outline")).toBeNull();
    expect(container.querySelector(".oc-block-pricing-card:not(.oc-block-pricing-card--featured) .oc-btn--outline")).toBeInTheDocument();
  });
});
