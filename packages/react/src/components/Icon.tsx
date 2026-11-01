import type { SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "d"> {
  /** SVG path data on a 24x24 viewBox: a webicon path (MDI, MDI Light or Material Symbols), e.g. the path of mdi:menu. Use `children` for several shapes. */
  d?: string;
  /** Draw `d` as a 2px line instead of a filled shape (older line icons). */
  line?: boolean;
}

/** Inline 24x24 icon in `currentColor`: a filled webicon path (the snippets use MDI), drawn without iconify-icon. */
export function Icon({ d, line = false, children, className, ...rest }: IconProps) {
  const paint = line
    ? { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
    : { fill: "currentColor" };
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...paint} {...rest}>
      {d ? <path d={d} /> : children}
    </svg>
  );
}
