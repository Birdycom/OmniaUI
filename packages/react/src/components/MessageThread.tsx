// File: packages/react/src/components/MessageThread.tsx
// Map: types + demo -> MessageThread (state: messages, sending) -> header (back, heading, people, badge, menu) -> scroll (MessageList)
//      -> footer (composer form / note / own composer) -> busy overlay
// Same markup as packages/ui/snippets/message-thread.html. Like the snippet script, a sent text is appended as an outgoing bubble
// (after onSend resolves; aria-busy shows the overlay meanwhile) and Ctrl/Cmd + Enter sends.
"use client";

import { forwardRef, useEffect, useId, useState } from "react";
import type { FormEvent, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { MessageList } from "./Message";
import type { MessageData, MessageListItem } from "./Message";

export interface ThreadParticipant { initials: ReactNode; name?: string }
export type ThreadMenuItem = { name: string; label: ReactNode; destructive?: boolean } | { separator: true };

export interface MessageThreadProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  /** Bold first part of the meta line, e.g. the project. */
  project?: ReactNode;
  meta?: ReactNode;
  participants?: ThreadParticipant[];
  /** Badge in the header, e.g. { label: "Urgent", variant: "destructive" }. */
  status?: { label: ReactNode; variant?: string } | null;
  /** Actions menu; null hides the button. */
  menu?: ThreadMenuItem[] | null;
  onMenu?: (name: string) => void;
  messages?: MessageListItem[];
  /** aria-label of the scroll area (default "Messages"). */
  scrollLabel?: string;
  /** aria-live="polite" on the scroll area (default true). */
  live?: boolean;
  /** Show the sending overlay (aria-busy). */
  busy?: boolean;
  /** Overlay title; null leaves the overlay out. */
  busyTitle?: ReactNode;
  busyText?: ReactNode;
  /** Replaces the default composer form. */
  composer?: ReactNode;
  /** Text instead of a composer, e.g. for a closed conversation. */
  note?: ReactNode;
  placeholder?: string;
  composerLabel?: string;
  inline?: boolean;
  tools?: Array<"attach" | "emoji">;
  onTool?: (tool: "attach" | "emoji") => void;
  hint?: ReactNode;
  /** Called with the text; the bubble is appended when it resolves (not when it throws). */
  onSend?: (text: string) => void | Promise<void>;
  /** Append sent messages yourself through `messages` (default false = append here). */
  manual?: boolean;
  /** Avatar of new outgoing messages (default: the last outgoing avatar, else "Me"). */
  me?: ReactNode;
  /** Element at the start of the header, e.g. a back link. */
  back?: ReactNode;
  /** No wallpaper (`--plain`). */
  plain?: boolean;
}

const MENU: ThreadMenuItem[] = [
  { name: "unread", label: "Mark as unread" }, { name: "archive", label: "Move to archive" }, { separator: true },
  { name: "delete", label: "Delete conversation", destructive: true },
];
const DEMO: MessageListItem[] = [
  { divider: "Tuesday 14 October" },
  { sender: "Customer 1", avatar: "C1", time: "09:12", datetime: "2026-10-14T09:12", text: "The supplier dropped off two worktop samples at the workshop. Photo attached.",
    attachments: [{ kind: "image", href: "#samples.jpg", alt: "Two worktop samples on the workbench", art: 6, caption: "samples.jpg · 2.1 MB" }] },
  { sender: "Customer 1", avatar: "C1", time: "09:13", datetime: "2026-10-14T09:13", continued: true,
    text: <p>Which one should we order: <strong>Calacatta matt</strong> or <strong>Nero Marquina polished</strong>? The cutting slot is Friday.</p> },
  { direction: "out", avatar: "C6", time: "09:20", datetime: "2026-10-14T09:20", status: "read", text: "Calacatta matt, 20 mm. I'll send the updated quote to the client today.",
    attachments: [{ name: "Quote kitchen Project 1 v2.pdf", size: "1.2 MB", href: "#quote.pdf" }], actions: [{ name: "delete", label: "Delete this message", destructive: true }] },
  { divider: "Today" },
  { sender: "Customer 1", avatar: "C1", time: "10:02", datetime: "2026-10-24T10:02", text: "Client signed. Can you confirm the edge profile before 16:00?" },
];
const isOut = (m?: MessageListItem): m is MessageData => !!m && !("divider" in m) && m.direction === "out";

/** `section.oc-message-thread`: header, scrolling messages (newest at the bottom), composer and sending overlay. */
export const MessageThread = forwardRef<HTMLElement, MessageThreadProps>(function MessageThread(
  {
    title = "Kitchen worktop: which finish?", project = "Project 1", meta = "Customer 1 → Customer 6 · 14 Oct 2026",
    participants = [{ initials: "C1", name: "Customer 1" }, { initials: "C6", name: "Customer 6" }], status = { label: "Urgent", variant: "destructive" },
    menu = MENU, onMenu, messages = DEMO, scrollLabel = "Messages", live = true, busy, busyTitle = "Sending message…",
    busyText = "Please wait, do not close this conversation.", composer, note, placeholder = "Type your reply…", composerLabel = "Reply", inline,
    tools = ["attach", "emoji"], onTool, hint = "Ctrl + Enter to send", onSend, manual, me, back, plain, id, className, ...rest
  },
  ref,
) {
  const auto = useId().replace(/[^\w-]/g, "");
  const base = id ?? `oc-thread-${auto}`;
  const [list, setList] = useState(messages);
  const [sending, setSending] = useState(false);
  useEffect(() => setList(messages), [messages]);

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const field = e.currentTarget.elements.namedItem("message") as HTMLTextAreaElement;
    const text = field.value.trim();
    if (!text) return;
    setSending(true);
    try { await onSend?.(text); } catch { setSending(false); return; }
    if (!manual) setList((l) => {
      const last = l[l.length - 1];
      const mine = me ?? [...l].reverse().find(isOut)?.avatar ?? "Me";
      return [...l, { direction: "out", avatar: mine, continued: isOut(last), text, time: new Date().toTimeString().slice(0, 5), status: "sent" }];
    });
    field.value = "";
    setSending(false);
    field.focus();
  };
  const ctrlEnter = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    e.currentTarget.requestSubmit();
  };

  return (
    <section ref={ref} className={cx("oc-message-thread", plain && "oc-message-thread--plain", className)} aria-labelledby={`${base}-title`} aria-busy={busy || sending || undefined} {...rest}>
      <header className="oc-message-thread__header">
        {back}
        <div className="oc-message-thread__heading">
          <h3 className="oc-message-thread__title" id={`${base}-title`}>{title}</h3>
          {(project != null || meta != null) && <p className="oc-message-thread__meta">{project != null && <strong>{project}</strong>}{project != null && meta != null && " · "}{meta}</p>}
        </div>
        {participants.length > 0 && (
          <div className="oc-avatar-group oc-message-thread__people" aria-label={`${participants.length} participants`}>
            {participants.map((p, i) => <span key={i} className="oc-avatar" title={p.name}>{p.initials}</span>)}
          </div>
        )}
        {(status || menu) && (
          <div className="oc-message-thread__actions">
            {status && <span className={cx("oc-badge", status.variant && `oc-badge--${status.variant}`)}>{status.label}</span>}
            {menu && (
              <>
                <button type="button" className="oc-message-thread__icon-btn" popoverTarget={`${base}-menu`} aria-label="Conversation actions">
                  <svg data-icon="mdi:dots-vertical" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"/></svg>
                </button>
                <div className="oc-dropdown-menu" id={`${base}-menu`} {...attrs({ popover: "" })} role="menu">
                  {menu.map((m, i) => "separator" in m
                    ? <div key={i} className="oc-dropdown-separator" role="separator" />
                    : <button key={i} type="button" className={cx("oc-dropdown-item", m.destructive && "oc-dropdown-item--destructive")} role="menuitem" onClick={() => onMenu?.(m.name)}>{m.label}</button>)}
                </div>
              </>
            )}
          </div>
        )}
      </header>
      <div className="oc-message-thread__scroll" tabIndex={0} role="log" aria-label={scrollLabel} aria-live={live ? "polite" : undefined}>
        <MessageList items={list} log={false} />
      </div>
      <div className="oc-message-thread__footer">
        {note != null ? <p className="oc-message-thread__note">{note}</p> : composer ?? (
          <form className={cx("oc-chat-composer", inline && "oc-chat-composer--inline")} action="#" aria-label={composerLabel} onSubmit={send} onKeyDown={ctrlEnter}>
            <label className="oc-visually-hidden" htmlFor={`${base}-input`}>Message</label>
            <textarea className="oc-chat-composer__input" id={`${base}-input`} name="message" rows={1} placeholder={placeholder} required />
            <div className="oc-chat-composer__bar">
              {tools.length > 0 && (
                <div className="oc-chat-composer__tools">
                  {tools.includes("attach") && <button type="button" className="oc-chat-composer__tool" aria-label="Attach a file" onClick={() => onTool?.("attach")}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 6v11.5a4 4 0 0 1-4 4a4 4 0 0 1-4-4V5a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 1 13.5 5v10.5a1 1 0 0 1-1 1a1 1 0 0 1-1-1V6H10v9.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5V5a4 4 0 0 0-4-4a4 4 0 0 0-4 4v12.5a5.5 5.5 0 0 0 5.5 5.5a5.5 5.5 0 0 0 5.5-5.5V6z"/></svg></button>}
                  {tools.includes("emoji") && <button type="button" className="oc-chat-composer__tool" aria-label="Insert emoji" onClick={() => onTool?.("emoji")}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 12a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8m2 0a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2a10 10 0 0 1 10 10m-12-3.5c0 .8-.7 1.5-1.5 1.5S7 9.3 7 8.5S7.7 7 8.5 7s1.5.7 1.5 1.5m7 0c0 .8-.7 1.5-1.5 1.5S14 9.3 14 8.5S14.7 7 15.5 7s1.5.7 1.5 1.5m-5 9.73c-1.75 0-3.29-.73-4.19-1.81L9.23 14c.45.72 1.52 1.23 2.77 1.23s2.32-.51 2.77-1.23l1.42 1.42c-.9 1.08-2.44 1.81-4.19 1.81"/></svg></button>}
                </div>
              )}
              {hint != null && <span className="oc-chat-composer__hint">{hint}</span>}
              <button type="submit" className="oc-chat-composer__send" aria-label="Send"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2l-15 2z"/></svg></button>
            </div>
          </form>
        )}
      </div>
      {busyTitle != null && (
        <div className="oc-message-thread__busy" role="status">
          <span className="oc-spinner oc-spinner--lg" aria-hidden="true" />
          <strong>{busyTitle}</strong>
          {busyText != null && <span>{busyText}</span>}
        </div>
      )}
    </section>
  );
});
