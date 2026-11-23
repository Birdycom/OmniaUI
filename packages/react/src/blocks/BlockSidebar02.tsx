// File: packages/react/src/blocks/BlockSidebar02.tsx | Map: default groups -> BlockSidebar02 (group labels as details/summary)
// Snippet: packages/blocks/blocks/sidebar-02.html. BlockSidebar01..05 share one frame; only the defaults differ.
import { forwardRef } from "react";
import { SidebarBlockFrame } from "../blockParts/SidebarBlockFrame";
import type { SidebarBlockGroup, SidebarBlockProps } from "../blockParts/SidebarBlockFrame";

export type BlockSidebar02Props = SidebarBlockProps;

const GROUPS: SidebarBlockGroup[] = [
  {
    label: "Getting started",
    items: [
      { label: "Introduction", icon: "mdi:book-open-variant-outline", current: true },
      { label: "Installation", icon: "mdi:code-tags" },
    ],
  },
  {
    label: "Building",
    items: [
      { label: "Components", icon: "mdi:layers-outline" },
      { label: "Blocks", icon: "mdi:file-document-outline" },
    ],
  },
  {
    label: "Reference",
    open: false,
    items: [
      { label: "Configuration", icon: "mdi:cog-outline" },
      { label: "Charts", icon: "mdi:chart-bar" },
    ],
  },
];

/** `.oc-block-sb` with `.oc-block-sb-group` details: each group label folds its group (native details). */
export const BlockSidebar02 = forwardRef<HTMLDivElement, BlockSidebar02Props>(function BlockSidebar02(props, ref) {
  return <SidebarBlockFrame ref={ref} defaults={{ groups: GROUPS, collapsibleGroups: true }} {...props} />;
});
