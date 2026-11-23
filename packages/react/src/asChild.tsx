// File: packages/react/src/asChild.tsx
// Map: merge the props of a trigger into its only child (asChild) -> event handlers chained, classes joined, refs merged
// Internal helper of the compound Dialog / Popover triggers (0.17.0); not exported from the package index.

import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode, Ref } from "react";
import { cx } from "./utils";

type AnyProps = Record<string, unknown>;

/**
 * Clones the only child with `props` merged in: handlers (`on*`) run the child's first, then ours (unless the child
 * called preventDefault); `className` and `style` are joined; the child's own other props win over ours except `ref`.
 * Returns null when `children` is not a single element.
 */
export function mergeIntoChild(children: ReactNode, props: AnyProps, ref?: Ref<unknown>): ReactElement | null {
  const only = Children.toArray(children).filter(isValidElement);
  if (only.length !== 1) return null;
  const child = only[0] as ReactElement<AnyProps>;
  const own = child.props;
  const merged: AnyProps = { ...props, ...own };
  for (const key of Object.keys(props)) {
    const ours = props[key];
    const theirs = own[key];
    if (/^on[A-Z]/.test(key) && typeof ours === "function" && typeof theirs === "function") {
      merged[key] = (e: { defaultPrevented?: boolean }) => {
        (theirs as (e: unknown) => void)(e);
        if (!e?.defaultPrevented) (ours as (e: unknown) => void)(e);
      };
    } else if (key === "className") {
      merged.className = cx(ours as string, theirs as string) || undefined;
    } else if (key === "style") {
      merged.style = { ...(ours as object), ...(theirs as object) };
    }
  }
  if (ref) merged.ref = ref;
  return cloneElement(child, merged);
}
