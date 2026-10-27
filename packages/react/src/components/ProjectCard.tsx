// File: packages/react/src/components/ProjectCard.tsx | Map: props -> ProjectCard (a -> frame (bar + shot) -> body)
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

// The native anchor "type" (MIME hint) is replaced by the badge text prop below.
export interface ProjectCardProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "type"> {
  name: ReactNode;
  /** Badge text ("Website"). */
  type?: ReactNode;
  /** Sector / location line. */
  meta?: ReactNode;
  /** Text of the arrow link (default "View project"). */
  more?: ReactNode;
  /** Screenshot URL; without it the preview is an accent gradient. */
  image?: string;
  /** Accessible description of the screenshot. */
  imageAlt?: string;
  /** Edge-to-edge preview. */
  flat?: boolean;
}

/** `<a class="oc-project-card">`: portfolio card with a browser-like preview. */
export const ProjectCard = forwardRef<HTMLAnchorElement, ProjectCardProps>(function ProjectCard(
  { name, type, meta, more = "View project", image, imageAlt = "", flat = false, className, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={cx("oc-project-card", flat && "oc-project-card--flat", className)} {...rest}>
      <span className="oc-project-card__frame">
        <span className="oc-project-card__bar" aria-hidden="true"><i /><i /><i /></span>
        {image ? (
          <img className="oc-project-card__shot" src={image} alt={imageAlt} loading="lazy" />
        ) : (
          <span className="oc-project-card__shot" role="img" aria-label={imageAlt || undefined} aria-hidden={imageAlt ? undefined : true} />
        )}
      </span>
      <span className="oc-project-card__body">
        {type != null && <span className="oc-project-card__type">{type}</span>}
        <span className="oc-project-card__name">{name}</span>
        {meta != null && <span className="oc-project-card__meta">{meta}</span>}
        {more != null && <span className="oc-project-card__more">{more}</span>}
      </span>
    </a>
  );
});
