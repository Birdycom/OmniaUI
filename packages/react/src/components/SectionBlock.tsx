// File: packages/react/src/components/SectionBlock.tsx
// Map: types -> SectionHeader (div.oc-section-header: title, source / scss / file / version badges, description)
//      -> SectionBlock (section.oc-section | .oc-docs-section -> header -> oc-section-content -> oc-section-footer)
// Same markup as the section block and section header pages: every part is optional and takes no space when left out.
import { forwardRef } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { BadgeSource, VersionBadge } from "./BadgeSource";

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  /** Heading level of the title. Default h2. */
  as?: ElementType;
  /** Source badge (`__badge-source`), e.g. "CSS class" or "Component". */
  source?: ReactNode;
  /** SCSS file badge (`__badge-scss`). */
  scss?: ReactNode;
  /** Page / file badge (`__badge-file`). */
  file?: ReactNode;
  /** Version badge (`__badge-version`), always at the right. */
  version?: ReactNode;
  /** Muted line below the title row (`__desc`). */
  description?: ReactNode;
}

/** `div.oc-section-header`: title and badges on one row, the description below. Children follow the description. */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { title, as: Title = "h2", source, scss, file, version, description, className, children, ...rest },
  ref,
) {
  // Cast keeps the JSX check happy for any ElementType (h2 default, h3 in nested docs sections).
  const Tag = Title as "h2";
  return (
    <div ref={ref} className={cx("oc-section-header", className)} {...rest}>
      {title != null && <Tag className="oc-section-header__title">{title}</Tag>}
      {source != null && <BadgeSource className="oc-section-header__badge-source">{source}</BadgeSource>}
      {scss != null && <BadgeSource kind="scss" className="oc-section-header__badge-scss">{scss}</BadgeSource>}
      {file != null && <BadgeSource kind="file" className="oc-section-header__badge-file">{file}</BadgeSource>}
      {version != null && <VersionBadge className="oc-section-header__badge-version">{version}</VersionBadge>}
      {description != null && <p className="oc-section-header__desc">{description}</p>}
      {children}
    </div>
  );
});

export interface SectionBlockProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Header parts (see SectionHeader). Without a title and badges the header is left out. */
  title?: ReactNode;
  titleAs?: ElementType;
  source?: ReactNode;
  scss?: ReactNode;
  file?: ReactNode;
  version?: ReactNode;
  description?: ReactNode;
  /** Own header content in place of the props above (rendered inside `div.oc-section-header`). */
  header?: ReactNode;
  /** Footer title and text (`oc-section-footer__title` / `__desc`). */
  footerTitle?: ReactNode;
  footerDescription?: ReactNode;
  /** Own footer content (inside `div.oc-section-footer`, after the title and text). */
  footer?: ReactNode;
  /** The docs section look (`section.oc-docs-section`) instead of the card (`section.oc-section`). */
  docs?: boolean;
}

/** `section.oc-section`: header, content (the children, in `oc-section-content`) and an optional footer. */
export const SectionBlock = forwardRef<HTMLElement, SectionBlockProps>(function SectionBlock(
  { title, titleAs, source, scss, file, version, description, header, footerTitle, footerDescription, footer, docs, className, children, ...rest },
  ref,
) {
  const hasHeader = header != null || [title, source, scss, file, version, description].some((p) => p != null);
  const hasFooter = footer != null || footerTitle != null || footerDescription != null;
  return (
    <section ref={ref} className={cx(docs ? "oc-docs-section" : "oc-section", className)} {...rest}>
      {hasHeader && (
        <SectionHeader title={title} as={titleAs} source={source} scss={scss} file={file} version={version} description={description}>
          {header}
        </SectionHeader>
      )}
      {children != null && <div className="oc-section-content">{children}</div>}
      {hasFooter && (
        <div className="oc-section-footer">
          {footerTitle != null && <h3 className="oc-section-footer__title">{footerTitle}</h3>}
          {footerDescription != null && <p className="oc-section-footer__desc">{footerDescription}</p>}
          {footer}
        </div>
      )}
    </section>
  );
});
