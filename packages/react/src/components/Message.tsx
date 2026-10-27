// File: packages/react/src/components/Message.tsx
// Map: types + icons -> MessageAttachments -> Message (avatar, bubble: sender, quote, text, attachments, meta; actions)
//      -> MessageDivider -> MessageList (demo conversation)
// Same markup as packages/ui/snippets/message.html. No JavaScript: grouping (--continued) and hover actions are CSS.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Attachment, AttachmentImage, AttachmentThumb } from "./Attachment";
import type { AttachmentFile } from "./Attachment";

/** File chip (default), image preview or square thumbnail inside a message. */
export type MessageAttachment =
  | (AttachmentFile & { kind?: "file" })
  | { kind: "image"; href?: string; src?: string; alt: string; art?: number; caption?: ReactNode }
  | { kind: "thumb"; src?: string; alt: string; art?: number };

export interface MessageAction {
  /** Passed to onAction, e.g. "reply". */
  name: string;
  /** aria-label, e.g. "Reply to this message". */
  label: string;
  /** Built-in "reply" / "delete" icon, or your own svg. */
  icon?: "reply" | "delete" | ReactNode;
  destructive?: boolean;
}

export interface MessageData {
  direction?: "in" | "out";
  sender?: ReactNode;
  /** Initials in the avatar. */
  avatar?: ReactNode;
  time?: ReactNode;
  datetime?: string;
  status?: "sent" | "read" | "failed";
  /** Default "Sent" / "Read" / "Failed". */
  statusLabel?: ReactNode;
  /** Double check icon before the status. */
  statusIcon?: boolean;
  /** Follows a message of the same sender (no name; avatar on the last one). */
  continued?: boolean;
  quote?: { href?: string; sender: ReactNode; text: ReactNode };
  /** A string becomes one paragraph; pass elements for lists, links and more paragraphs. */
  text?: ReactNode;
  attachments?: MessageAttachment[];
  actions?: MessageAction[];
  /** aria-label of the row, e.g. "Lisa Verbeke, 09:12". */
  label?: string;
  id?: string;
}

const svg = (d: string, width = "2") => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const ICONS: Record<string, string> = { reply: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v4", delete: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" };
const STATUS = { sent: "Sent", read: "Read", failed: "Failed" };

/** `.oc-message__attachments`: thumbnails share one `.oc-attachment-list`, files and images stand alone. */
export function MessageAttachments({ items }: { items: MessageAttachment[] }) {
  const thumbs = items.every((a) => a.kind === "thumb");
  return (
    <div className="oc-message__attachments">
      {thumbs ? (
        <div className="oc-attachment-list">{items.map((a, i) => <AttachmentThumb key={i} as="span" {...(a as Extract<MessageAttachment, { kind: "thumb" }>)} />)}</div>
      ) : items.map((a, i) => {
        if (a.kind === "image") { const { kind: _k, ...img } = a; return <AttachmentImage key={i} {...img} />; }
        if (a.kind === "thumb") { const { kind: _k, ...t } = a; return <AttachmentThumb key={i} as="span" {...t} />; }
        const { kind: _k, ...file } = a;
        return <Attachment key={i} {...file} />;
      })}
    </div>
  );
}

export interface MessageProps extends Omit<HTMLAttributes<HTMLElement>, "id">, MessageData {
  onAction?: (name: string) => void;
}

/** `article.oc-message`: one chat bubble with avatar, meta and hover actions. */
export const Message = forwardRef<HTMLElement, MessageProps>(function Message(
  { direction = "in", sender, avatar, time, datetime, status, statusLabel, statusIcon, continued, quote, text, attachments, actions, label, onAction, className, children, ...rest },
  ref,
) {
  return (
    <article ref={ref} className={cx("oc-message", direction === "out" && "oc-message--out", continued && "oc-message--continued", className)} aria-label={label} {...rest}>
      <span className="oc-avatar oc-message__avatar">{avatar}</span>
      <div className="oc-message__bubble">
        {sender != null && !continued && <p className="oc-message__sender">{sender}</p>}
        {quote && <a className="oc-message__quote" href={quote.href}><strong>{quote.sender}</strong><span>{quote.text}</span></a>}
        {(text != null || children != null) && <div className="oc-message__text">{typeof text === "string" ? <p>{text}</p> : text}{children}</div>}
        {attachments?.length ? <MessageAttachments items={attachments} /> : null}
        {(time != null || status) && (
          <p className="oc-message__meta">
            {time != null && <time dateTime={datetime}>{time}</time>}
            {status && (
              <span className={cx("oc-message__status", status !== "sent" && `oc-message__status--${status}`)}>
                {statusIcon && svg("M2 12.5 7 17.5 18 6.5M13 16.5l1 1L22.5 9", "2.2")}{statusLabel ?? STATUS[status]}
              </span>
            )}
          </p>
        )}
      </div>
      {actions?.length ? (
        <div className="oc-message__actions">
          {actions.map((a) => (
            <button key={a.name} type="button" className={cx("oc-message__action", a.destructive && "oc-message__action--destructive")} aria-label={a.label} onClick={() => onAction?.(a.name)}>
              {typeof a.icon === "string" || a.icon == null ? svg(ICONS[(a.icon as string) ?? a.name] ?? ICONS.reply) : a.icon}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
});

export interface MessageDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Centred notice without lines. */
  system?: boolean;
}

/** `.oc-message-divider`: date divider, or a system notice. */
export function MessageDivider({ system, className, children, ...rest }: MessageDividerProps) {
  return <div className={cx("oc-message-divider", system && "oc-message-divider--system", className)} role={system ? "note" : undefined} {...rest}><span>{children}</span></div>;
}

export type MessageListItem = MessageData | { divider: ReactNode; system?: boolean };

export interface MessageListProps extends HTMLAttributes<HTMLDivElement> {
  /** Messages and dividers in order; `children` replace them. */
  items?: MessageListItem[];
  /** role="log" for a list that updates live (default true). */
  log?: boolean;
  onAction?: (name: string, message: MessageData, index: number) => void;
}

const DEMO: MessageListItem[] = [
  { divider: "Tuesday 14 October" },
  { sender: "Lisa Verbeke", avatar: "LV", time: "09:12", datetime: "2026-10-14T09:12", label: "Lisa Verbeke, 09:12", text: "Morning Tom! The worktop supplier sent two samples for Villa Dewitte." },
  {
    sender: "Lisa Verbeke", avatar: "LV", time: "09:13", datetime: "2026-10-14T09:13", label: "Lisa Verbeke, 09:13", continued: true, id: "oc-message-demo-question",
    text: (
      <>
        <p>Which finish should we order?</p>
        <ul><li><strong>Calacatta</strong> matt, 20 mm</li><li><strong>Nero Marquina</strong> polished, 12 mm</li></ul>
        <p>Details are on the <a href="#supplier-sheet">supplier sheet</a>.</p>
      </>
    ),
  },
  {
    direction: "out", avatar: "TP", time: "09:20", datetime: "2026-10-14T09:20", label: "You, 09:20", status: "read", statusIcon: true,
    quote: { href: "#oc-message-demo-question", sender: "Lisa Verbeke", text: "Which finish should we order? Calacatta matt, 20 mm or Nero Marquina polished, 12 mm" },
    text: "Calacatta matt. The client wants the lighter look next to the oak fronts.",
    actions: [{ name: "reply", label: "Reply to this message" }, { name: "delete", label: "Delete this message", destructive: true }],
  },
  { divider: "Lisa Verbeke marked this question as answered", system: true },
];

/** `.oc-message-list`: column of messages and dividers. */
export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(function MessageList(
  { items = DEMO, log = true, onAction, className, children, "aria-label": label = log ? "Conversation with Lisa Verbeke" : undefined, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-message-list", className)} role={log ? "log" : undefined} aria-label={label} {...rest}>
      {children ?? items.map((item, i) =>
        "divider" in item
          ? <MessageDivider key={i} system={item.system}>{item.divider}</MessageDivider>
          : <Message key={i} {...item} onAction={(name) => onAction?.(name, item, i)} />,
      )}
    </div>
  );
});
