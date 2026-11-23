// File: packages/react/src/components/BrowserFrame.tsx
// Map: props -> BrowserFrame (figure -> bar: dots, address, actions -> view (img or children) -> caption | body: div -> bar -> __body)
// Same markup as packages/ui/snippets/browser-frame.html.
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import { cx } from "../utils";
import { webiconNode } from "./Webicon";

export interface BrowserFrameProps extends HTMLAttributes<HTMLElement> {
  /** Text in the address pill. Leave out (or use `minimal`) for dots only. */
  url?: string;
  /** Screenshot URL. `children` replace it (live content). */
  src?: string;
  alt?: string;
  caption?: ReactNode;
  /** Small glyphs on the right of the bar. */
  actions?: ReactNode;
  minimal?: boolean;
  dark?: boolean;
  tilt?: boolean;
  /** View height follows the content instead of the ratio. */
  auto?: boolean;
  /** View ratio, e.g. "16 / 9". Default 16 / 10. */
  ratio?: string;
  /** Shadow in the accent color, the screenshot zooms in a little on hover (`--glow`). */
  glow?: boolean;
  /** Product mark on the bottom end corner (`__mark`): a webicon name in a large icon tile, or any node. */
  mark?: ReactNode;
  /** Accent preset of the mark tile (green, violet …). */
  markAccent?: string;
  /**
   * The compact showcase frame (0.17.0): a `div.oc-browser-frame` with the bar and one `.oc-browser-frame__body` (16 / 10,
   * cropped from the top) in place of figure / view / caption: the screenshot itself (`src`) or a div with the children.
   */
  body?: boolean;
  /** Inline style of the `__body` (e.g. a background while there is no screenshot). */
  bodyStyle?: CSSProperties;
}

/** `figure.oc-browser-frame`: fake browser chrome around a screenshot or any content. */
export const BrowserFrame = forwardRef<HTMLElement, BrowserFrameProps>(function BrowserFrame(
  { url, src, alt = "", caption, actions, minimal, dark, tilt, auto, ratio, glow, mark, markAccent, body, bodyStyle, className, style, children, ...rest },
  ref,
) {
  const vars = ratio ? ({ "--oc-browser-frame-ratio": ratio } as CSSProperties) : undefined;
  if (body) {
    return (
      <div ref={ref as Ref<HTMLDivElement>} className={cx("oc-browser-frame", glow && "oc-browser-frame--glow", className)} style={style} {...rest}>
        <div className="oc-browser-frame__bar">
          <i /><i /><i />
          {url != null && <span className="oc-browser-frame__address">{url}</span>}
          {actions != null && <span className="oc-browser-frame__actions" aria-hidden="true">{actions}</span>}
        </div>
        {src && children == null
          ? <img className="oc-browser-frame__body" src={src} alt={alt} style={bodyStyle} />
          : <div className="oc-browser-frame__body" style={bodyStyle}>{children}</div>}
      </div>
    );
  }
  return (
    <figure
      ref={ref}
      className={cx("oc-browser-frame", minimal && "oc-browser-frame--minimal", dark && "oc-browser-frame--dark", tilt && "oc-browser-frame--tilt", auto && "oc-browser-frame--auto", glow && "oc-browser-frame--glow", className)}
      style={{ ...vars, ...style }}
      {...rest}
    >
      <div className="oc-browser-frame__bar">
        <i /><i /><i />
        {url != null && <span className="oc-browser-frame__address">{url}</span>}
        {actions != null && <span className="oc-browser-frame__actions" aria-hidden="true">{actions}</span>}
      </div>
      <div className="oc-browser-frame__view">{children ?? (src ? <img src={src} alt={alt} /> : <div className="oc-media-art" role="img" aria-label={alt} />)}</div>
      {mark != null && (
        typeof mark === "string"
          ? <span className={cx("oc-browser-frame__mark oc-icon-tile oc-icon-tile--lg", markAccent && `oc-accent--${markAccent}`)} aria-hidden="true">{webiconNode(mark)}</span>
          : <span className="oc-browser-frame__mark">{mark}</span>
      )}
      {caption != null && <figcaption className="oc-browser-frame__caption">{caption}</figcaption>}
    </figure>
  );
});
