// File: packages/react/src/blocks/BlockSidebar05.tsx | Map: default groups -> BlockSidebar05 (items that fold a submenu with details/summary)
// Snippet: packages/blocks/blocks/sidebar-05.html. BlockSidebar01..05 share one frame; only the defaults differ.
import { forwardRef } from "react";
import { SidebarBlockFrame } from "../blockParts/SidebarBlockFrame";
import type { SidebarBlockGroup, SidebarBlockProps } from "../blockParts/SidebarBlockFrame";

export type BlockSidebar05Props = SidebarBlockProps;

const GROUPS: SidebarBlockGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Dashboard", icon: "mdi:home-outline", open: true, items: [{ label: "Overview" }, { label: "Analytics" }, { label: "Reports" }] },
      { label: "Projects", icon: "mdi:folder-outline", items: [{ label: "Active" }, { label: "Archived" }] },
      { label: "Team", icon: "mdi:account-outline", items: [{ label: "Members" }, { label: "Roles" }, { label: "Invitations" }] },
    ],
  },
];

/** `.oc-block-sb` with `.oc-sidebar-collapsible`: menu items that expand a submenu (native details/summary). */
export const BlockSidebar05 = forwardRef<HTMLDivElement, BlockSidebar05Props>(function BlockSidebar05(props, ref) {
  return <SidebarBlockFrame ref={ref} defaults={{ groups: GROUPS, submenu: "collapsible" }} {...props} />;
});
