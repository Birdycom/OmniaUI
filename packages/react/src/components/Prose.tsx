// File: packages/react/src/components/Prose.tsx
// Map: types -> demo article (same text as the snippet) -> Prose (wrapper with size modifiers) -> ProseLead
// Same markup as packages/ui/snippets/prose.html. Put plain HTML (h1-h4, p, lists, blockquote, table, figure, pre) inside.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ProseProps extends HTMLAttributes<HTMLElement> {
  /** All spacing scales along; "compact" for widgets and panels (13 px, tighter, full width). */
  size?: "compact" | "sm" | "md" | "lg";
  /** No max width (default 68ch). */
  full?: boolean;
  as?: "article" | "div" | "section";
  /** The text; the snippet's demo article when empty. */
  children?: ReactNode;
}

/** `p.oc-prose-lead`: larger intro paragraph. */
export function ProseLead({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("oc-prose-lead", className)} {...rest} />;
}

const DEMO = (
  <>
    <h1>Planning a kitchen renovation</h1>
    <ProseLead>A new kitchen takes eight to twelve weeks from the first visit to the last cabinet handle. This guide explains every step, so you know what to expect and when we need you.</ProseLead>
    <h2>Before the first visit</h2>
    <p>Collect a few photos of kitchens you like and measure the room roughly. Exact measurements are not needed yet: our site manager does that during the visit. Read the <a href="#checklist">preparation checklist</a> if you want to be fully ready.</p>
    <ul>
      <li>The <strong>budget range</strong> you have in mind, including appliances</li>
      <li>Which walls, doors and windows can move, and which cannot
        <ul><li>Load-bearing walls need a structural engineer</li><li>Moving a window needs a permit in most towns</li></ul>
      </li>
      <li>Appliances you want to keep</li>
    </ul>
    <figure>
      <div className="oc-media-art oc-media-art--6" role="img" aria-label="Kitchen with oak fronts and a light stone worktop" />
      <figcaption>Villa Dewitte: oak fronts with a Calacatta matt worktop, finished in October 2026.</figcaption>
    </figure>
    <h3>From design to installation</h3>
    <ol>
      <li>Site visit and measurements (week 1)</li>
      <li>Design and quote, with two revision rounds (weeks 2–3)</li>
      <li>Order and production of the cabinets (weeks 4–9)</li>
      <li>Installation, worktop and finishing (weeks 10–11)</li>
    </ol>
    <blockquote>
      <p>The planning was clear from day one. We always knew who was coming and when, and the kitchen was ready a week early.</p>
      <footer>— Ann Dewitte, client in Ghent</footer>
    </blockquote>
    <h2>Worktop materials compared</h2>
    <table>
      <caption>Prices per running metre, 60 cm deep, installed.</caption>
      <thead><tr><th>Material</th><th>Thickness</th><th>Heat resistant</th><th>Price</th></tr></thead>
      <tbody>
        <tr><td>Compact laminate</td><td>12 mm</td><td>Up to 180 °C</td><td>€ 290</td></tr>
        <tr><td>Quartz composite</td><td>20 mm</td><td>Up to 150 °C</td><td>€ 540</td></tr>
        <tr><td>Natural stone</td><td>20 mm</td><td>Yes</td><td>€ 720</td></tr>
      </tbody>
    </table>
    <h3>Sharing your floor plan</h3>
    <p>Upload a PDF or a photo in the client portal, or send it by e-mail. Press <kbd>Ctrl</kbd> + <kbd>V</kbd> in the chat to paste a screenshot. Files are stored as <code>project-id/plans/</code> and only your project team can see them.</p>
    <pre><code>{"Project:   2026-114 Villa Dewitte\nRoom:      Kitchen, ground floor\nWall A:    412 cm (window at 160 cm)\nWall B:    298 cm (door at the left)"}</code></pre>
    <hr />
    <p><small>Lead times are an estimate. <mark>Natural stone</mark> can take two weeks longer in summer.</small></p>
  </>
);

/** `.oc-prose`: typography for long-form text written without classes. */
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  { size = "md", full, as: Tag = "article", className, children, ...rest },
  ref,
) {
  return (
    <Tag ref={ref as React.Ref<HTMLElement & HTMLDivElement>} className={cx("oc-prose", size !== "md" && `oc-prose--${size}`, full && "oc-prose--full", className)} {...rest}>
      {children ?? DEMO}
    </Tag>
  );
});
