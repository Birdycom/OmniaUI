import type { SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "d"> {
  /** SVG path data (24x24 viewBox, stroke icon). Use `children` for several shapes. */
  d?: string;
}

/** Inline 24x24 stroke icon (`currentColor`), the shape used by the snippets. */
export function Icon({ d, children, className, ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}
