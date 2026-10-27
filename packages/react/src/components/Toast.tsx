"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

const GLYPHS: Record<ToastVariant, string> = { success: "✓", error: "!", warning: "!", info: "i" };

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: ToastVariant;
  title: ReactNode;
  description?: ReactNode;
  /** Custom status glyph (defaults per variant). */
  icon?: ReactNode;
  /** Shows the dismiss button. */
  onDismiss?: () => void;
  dismissLabel?: string;
}

/** One `.oc-toast` notification (`role="alert"` for errors, `status` otherwise). */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { variant = "info", title, description, icon, onDismiss, dismissLabel = "Dismiss", className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-toast", `oc-toast--${variant}`, className)} role={variant === "error" ? "alert" : "status"} {...rest}>
      <span className="oc-toast-icon" aria-hidden="true">{icon ?? GLYPHS[variant]}</span>
      <div className="oc-toast-body">
        <p className="oc-toast-title">{title}</p>
        {description != null && <p className="oc-toast-description">{description}</p>}
      </div>
      {onDismiss && (
        <button className="oc-toast-close" type="button" aria-label={dismissLabel} onClick={onDismiss}>&times;</button>
      )}
    </div>
  );
});

/** `.oc-toast-container` (fixed bottom right; `top` or `static` for in-flow). */
export const ToastContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { top?: boolean; static?: boolean }>(function ToastContainer(
  { top, static: isStatic, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("oc-toast-container", top && "oc-toast-container--top", isStatic && "oc-toast-container--static", className)}
      {...rest}
    />
  );
});

export interface ToastOptions {
  variant?: ToastVariant;
  title: ReactNode;
  description?: ReactNode;
  /** Auto-dismiss after ms (default 5000). Use 0 to keep the toast until dismissed. */
  duration?: number;
}

interface ToastEntry extends ToastOptions {
  id: number;
}

interface ToastApi {
  /** Queue a toast; returns its id. */
  toast: (options: ToastOptions) => number;
  dismiss: (id?: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  children?: ReactNode;
  /** Stack at the top instead of the bottom. */
  top?: boolean;
  /** Default auto-dismiss in ms (default 5000). */
  duration?: number;
  /** Maximum toasts shown at once (oldest are dropped; default 5). */
  limit?: number;
}

/** Holds the toast queue and renders the fixed `.oc-toast-container`. Use `useToast()` below it. */
export function ToastProvider({ children, top, duration = 5000, limit = 5 }: ToastProviderProps) {
  const [items, setItems] = useState<ToastEntry[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id?: number) => {
    if (id === undefined) {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
      setItems([]);
      return;
    }
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      setItems((list) => [...list, { ...options, id }].slice(-limit));
      const ms = options.duration ?? duration;
      if (ms > 0) timers.current.set(id, setTimeout(() => dismiss(id), ms));
      return id;
    },
    [dismiss, duration, limit],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer top={top} aria-live="polite">
        {items.map((t) => (
          <Toast key={t.id} variant={t.variant} title={t.title} description={t.description} onDismiss={() => dismiss(t.id)} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

/** `const { toast, dismiss } = useToast()`: needs a surrounding `<ToastProvider>`. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
