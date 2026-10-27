// File: packages/react/src/blocks/BlockPortfolioGrid.tsx | Map: types -> BlockPortfolioGrid (head (title, lead, link) -> grid of ProjectCard)
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { ProjectCard } from "../components/ProjectCard";
import type { ProjectCardProps } from "../components/ProjectCard";

export type PortfolioGridProject = ProjectCardProps & {
  /** Accent preset for the card (green, violet, ...). */
  accent?: string;
};

export interface BlockPortfolioGridProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  /** Display title; wrap a word in `<span className="oc-text-gradient">`. */
  title: ReactNode;
  lead?: ReactNode;
  /** Link at the right of the head, e.g. <LinkArrow href="/work">All projects</LinkArrow>. */
  link?: ReactNode;
  projects: PortfolioGridProject[];
  /** Wider cards. */
  two?: boolean;
}

/** `.oc-block-portfolio`: heading plus a grid of project cards. */
export const BlockPortfolioGrid = forwardRef<HTMLElement, BlockPortfolioGridProps>(function BlockPortfolioGrid(
  { eyebrow, title, lead, link, projects, two = false, className, ...rest },
  ref,
) {
  const titleId = `oc-portfolio-title-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <section ref={ref} className={cx("oc-block-portfolio oc-section-pad", two && "oc-block-portfolio--two", className)} aria-labelledby={titleId} {...rest}>
      <div className="oc-container">
        <div className="oc-block-portfolio-head">
          <div>
            {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
            <h2 className="oc-display oc-display--md" id={titleId}>{title}</h2>
            {lead != null && <p className="oc-block-portfolio-lead">{lead}</p>}
          </div>
          {link}
        </div>
        <div className="oc-block-portfolio-grid">
          {projects.map(({ accent, className: cardClass, ...card }, i) => (
            <ProjectCard key={i} className={cx(accent && `oc-accent--${accent}`, cardClass)} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
});
