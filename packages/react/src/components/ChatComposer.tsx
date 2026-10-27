// File: packages/react/src/components/ChatComposer.tsx
// Map: props -> ChatComposer (form -> label + textarea -> bar: tools, hint, send) -> submit / Enter handling
// Same markup as packages/ui/snippets/chat-composer.html. React adds onSend and (optional) Enter to send.
"use client";

import { forwardRef, useId } from "react";
import type { FormHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

/** The event type React gives to a form's onSubmit (differs between React 18 and 19 typings). */
type SubmitEvent = Parameters<NonNullable<FormHTMLAttributes<HTMLFormElement>["onSubmit"]>>[0];

export interface ChatComposerProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text on submit; the field is cleared afterwards. */
  onSend?: (text: string) => void;
  placeholder?: string;
  /** Accessible label of the field (visually hidden). */
  label?: string;
  /** Tool buttons (`.oc-chat-composer__tool`), e.g. attach or an EmojiPicker. */
  tools?: ReactNode;
  hint?: ReactNode;
  inline?: boolean;
  /** Enter sends, Shift+Enter adds a new line. Default true. */
  sendOnEnter?: boolean;
  disabled?: boolean;
}

/** `form.oc-chat-composer`: growing textarea + toolbar + send button. */
export const ChatComposer = forwardRef<HTMLFormElement, ChatComposerProps>(function ChatComposer(
  { value, defaultValue = "", onValueChange, onSend, placeholder = "Write a message…", label = "Message", tools, hint, inline, sendOnEnter = true, disabled, className, onSubmit, ...rest },
  ref,
) {
  const id = `oc-chat-${useId().replace(/:/g, "")}`;
  const [text, setText] = useControllable(value, defaultValue, onValueChange);
  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    onSubmit?.(e);
    if (!text.trim() || disabled) return;
    onSend?.(text.trim());
    setText("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (sendOnEnter && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };
  return (
    <form ref={ref} className={cx("oc-chat-composer", inline && "oc-chat-composer--inline", className)} onSubmit={submit} {...rest}>
      <label className="oc-visually-hidden" htmlFor={id}>{label}</label>
      <textarea
        className="oc-chat-composer__input"
        id={id}
        rows={1}
        placeholder={placeholder}
        required
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="oc-chat-composer__bar">
        {tools != null && <div className="oc-chat-composer__tools">{tools}</div>}
        {hint != null && <span className="oc-chat-composer__hint">{hint}</span>}
        <button type="submit" className="oc-chat-composer__send" aria-label="Send" disabled={disabled}>&#10148;</button>
      </div>
    </form>
  );
});
