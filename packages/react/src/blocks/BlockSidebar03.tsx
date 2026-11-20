// File: packages/react/src/blocks/BlockSidebar03.tsx | Map: default groups -> BlockSidebar03 (items with always visible submenus)
// Snippet: packages/blocks/blocks/sidebar-03.html. BlockSidebar01..05 share one frame; only the defaults differ.
import { forwardRef } from "react";
import { SidebarBlockFrame } from "../blockParts/SidebarBlockFrame";
import type { SidebarBlockGroup, SidebarBlockProps } from "../blockParts/SidebarBlockFrame";

export type BlockSidebar03Props = SidebarBlockProps;

const GROUPS: SidebarBlockGroup[] = [
  {
    label: "Getting started",
    items: [
      {
        label: "Introduction",
        icon: "mdi:book-open-variant-outline",
        current: true,
        items: [{ label: "Overview" }, { label: "Quick start" }, { label: "Tokens" }],
      },
      {
        label: "Components",
        icon: "mdi:layers-outline",
        items: [{ label: "Buttons" }, { label: "Forms" }, { label: "Navigation" }],
      },
    ],
  },
];

/** `.oc-block-sb` with `.oc-sidebar-menu-sub`: menu items with nested lists that stay visible, guided by a line. */
export const BlockSidebar03 = forwardRef<HTMLDivElement, BlockSidebar03Props>(function BlockSidebar03(props, ref) {
  return <SidebarBlockFrame ref={ref} defaults={{ groups: GROUPS, submenu: "list" }} {...props} />;
});
