"use client";

import { forwardRef, useEffect, useId, useRef } from "react";
import type { HTMLAttributes, InputHTMLAttributes } from "react";
import { bindAvatarPicker } from "../../../ui/src/form-extras.js";
import { cx } from "../utils";
import { Icon } from "./Icon";

export interface AvatarPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "onInvalid"> {
  initials: string;
  label?: string;
  hint?: string;
  /** Rounded square and contain-fit (a company logo). */
  logo?: boolean;
  /** Name of the file input (sent with the form). */
  name?: string;
  accept?: string;
  /** Refuse larger files (KB); the reason shows under the buttons. */
  maxKb?: number;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  onChange?: (file: File | null) => void;
  /** A refused file (wrong type for accept, or larger than maxKb) and the reason. */
  onInvalid?: (file: File, reason: string) => void;
}

/** Avatar or logo picker with a preview, Upload and Remove, and drag and drop (`.oc-avatar-picker`). */
export const AvatarPicker = forwardRef<HTMLDivElement, AvatarPickerProps>(function AvatarPicker(
  { initials, label = "Profile picture", hint, logo, name, accept = "image/*", maxKb, inputProps, onChange, onInvalid, className, ...rest },
  ref,
) {
  const id = useId();
  const own = useRef<HTMLDivElement | null>(null);
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const invalidRef = useRef(onInvalid);
  invalidRef.current = onInvalid;
  useEffect(() => {
    const el = own.current;
    if (!el) return;
    bindAvatarPicker(el);
    const handler = (event: Event) => changeRef.current?.((event as CustomEvent<{ file: File | null }>).detail.file);
    const refused = (event: Event) => { const { file, reason } = (event as CustomEvent<{ file: File; reason: string }>).detail; invalidRef.current?.(file, reason); };
    el.addEventListener("oc-avatar-change", handler);
    el.addEventListener("oc-avatar-invalid", refused);
    return () => { el.removeEventListener("oc-avatar-change", handler); el.removeEventListener("oc-avatar-invalid", refused); };
  }, []);
  return (
    <div
      ref={(node) => { own.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
      className={cx("oc-avatar-picker", logo && "oc-avatar-picker--square oc-avatar-picker--logo", className)}
      data-oc-max-kb={maxKb}
      {...rest}
    >
      <label className="oc-avatar-picker__preview" htmlFor={id} title="Choose an image">
        <span data-oc-initials="">{initials}</span>
        <input className="oc-avatar-picker__file" id={id} type="file" accept={accept} name={name} {...inputProps} />
      </label>
      <div className="oc-avatar-picker__text">
        <span className="oc-avatar-picker__label">{label}</span>
        {hint && <span className="oc-avatar-picker__hint">{hint}</span>}
        <div className="oc-avatar-picker__actions">
          <button type="button" className="oc-btn oc-btn--outline oc-btn--sm" data-oc-avatar-upload=""><Icon d="M9 16v-6H5l7-7l7 7h-4v6zm-4 4v-2h14v2z" />Upload</button>
          <button type="button" className="oc-btn oc-btn--ghost oc-btn--sm" data-oc-avatar-remove=""><Icon d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />Remove</button>
        </div>
      </div>
    </div>
  );
});
