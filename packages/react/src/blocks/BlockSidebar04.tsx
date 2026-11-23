// File: packages/react/src/blocks/BlockSidebar04.tsx | Map: BlockSidebar04 (sidebar-01 groups on a floating panel)
// Snippet: packages/blocks/blocks/sidebar-04.html. BlockSidebar01..05 share one frame; only the defaults differ.
import { forwardRef } from "react";
import { SIDEBAR_BASE_GROUPS, SIDEBAR_USER, SidebarBlockFrame } from "../blockParts/SidebarBlockFrame";
import type { SidebarBlockProps } from "../blockParts/SidebarBlockFrame";

export type BlockSidebar04Props = SidebarBlockProps;

/** `.oc-block-sb--floating` + `.oc-sidebar--floating`: the sidebar as a rounded, shadowed panel over a muted page. */
export const BlockSidebar04 = forwardRef<HTMLDivElement, BlockSidebar04Props>(function BlockSidebar04(props, ref) {
  return <SidebarBlockFrame ref={ref} defaults={{ groups: SIDEBAR_BASE_GROUPS, user: SIDEBAR_USER, floating: true }} {...props} />;
});
