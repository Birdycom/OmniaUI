// File: packages/react/src/blocks/BlockSidebar01.tsx | Map: re-exported sidebar types -> default groups -> BlockSidebar01 (brand, two labelled groups, user footer)
// Snippet: packages/blocks/blocks/sidebar-01.html. BlockSidebar01..05 share one frame; only the defaults differ.
import { forwardRef } from "react";
import { SIDEBAR_BASE_GROUPS, SIDEBAR_USER, SidebarBlockFrame } from "../blockParts/SidebarBlockFrame";
import type { SidebarBlockProps } from "../blockParts/SidebarBlockFrame";

export type {
  SidebarBlockBrand,
  SidebarBlockGroup,
  SidebarBlockItem,
  SidebarBlockProps,
  SidebarBlockSubItem,
  SidebarBlockUser,
} from "../blockParts/SidebarBlockFrame";
export type BlockSidebar01Props = SidebarBlockProps;

/** `.oc-block-sb` + `.oc-sidebar`: the base layout with a brand header, labelled groups and a user footer. */
export const BlockSidebar01 = forwardRef<HTMLDivElement, BlockSidebar01Props>(function BlockSidebar01(props, ref) {
  return <SidebarBlockFrame ref={ref} defaults={{ groups: SIDEBAR_BASE_GROUPS, user: SIDEBAR_USER }} {...props} />;
});
