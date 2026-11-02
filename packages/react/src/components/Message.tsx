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
  /** aria-label of the row, e.g. "Customer 1, 09:12". */
  label?: string;
  id?: string;
}

/** A webicon (MDI path data, 24x24). */
const svg = (d: string) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
);
const ICONS: Record<string, string> = { reply: "M8 9.8v.9l1.7.3c2.6.4 4.5 1.4 5.9 2.7c-1.7-.5-3.5-.8-5.6-.8H8v1.3L5.8 12zM10 5l-7 7l7 7v-4.1c5 0 8.5 1.6 11 5.1c-1-5-4-10-11-11", delete: "M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z" };
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
                {statusIcon && svg("M.41 13.41L6 19l1.41-1.42L1.83 12m20.41-6.42L11.66 16.17L7.5 12l-1.43 1.41L11.66 19l12-12M18 7l-1.41-1.42l-6.35 6.35l1.42 1.41z")}{statusLabel ?? STATUS[status]}
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
  { sender: "Customer 1", avatar: "C1", time: "09:12", datetime: "2026-10-14T09:12", label: "Customer 1, 09:12", text: "Morning Tom! The worktop supplier sent two samples for Project 1." },
  {
    sender: "Customer 1", avatar: "C1", time: "09:13", datetime: "2026-10-14T09:13", label: "Customer 1, 09:13", continued: true, id: "oc-message-demo-question",
    text: (
      <>
        <p>Which finish should we order?</p>
        <ul><li><strong>Calacatta</strong> matt, 20 mm</li><li><strong>Nero Marquina</strong> polished, 12 mm</li></ul>
        <p>Details are on the <a href="#supplier-sheet">supplier sheet</a>.</p>
      </>
    ),
  },
  {
    direction: "out", avatar: "C6", time: "09:20", datetime: "2026-10-14T09:20", label: "You, 09:20", status: "read", statusIcon: true,
    quote: { href: "#oc-message-demo-question", sender: "Customer 1", text: "Which finish should we order? Calacatta matt, 20 mm or Nero Marquina polished, 12 mm" },
    text: "Calacatta matt. The client wants the lighter look next to the oak fronts.",
    actions: [{ name: "reply", label: "Reply to this message" }, { name: "delete", label: "Delete this message", destructive: true }],
  },
  { divider: "Customer 1 marked this question as answered", system: true },
];

/** `.oc-message-list`: column of messages and dividers. */
export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(function MessageList(
  { items = DEMO, log = true, onAction, className, children, "aria-label": label = log ? "Conversation with Customer 1" : undefined, ...rest },
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
