// File: packages/vue/src/composables/keys-d3.ts
// Map: tabs context (OcTabs compound) -> dialog context (OcDialog) -> popover context (OcPopover compound)
// Injection keys of the 0.17.0 compound components (provide in the root, inject in the parts).

import type { InjectionKey, Ref } from 'vue'

/** Provided by OcTabs without `tabs`, injected by OcTabsList / OcTabsTrigger / OcTabsContent. */
export interface TabsContext {
  value: Ref<string | undefined>
  select: (value: string) => void
  /** Base of the tab and panel ids. */
  base: string
  variant: Ref<'pill' | 'vertical' | undefined>
}
export const tabsKey: InjectionKey<TabsContext> = Symbol('oc-tabs')

/** Provided by OcDialog, injected by OcDialogTrigger / OcDialogContent / OcDialogTitle / OcDialogDescription / OcDialogClose. */
export interface DialogContext {
  open: Ref<boolean>
  setOpen: (open: boolean) => void
  contentId: string
  titleId: string
  descriptionId: string
}
export const dialogKey: InjectionKey<DialogContext> = Symbol('oc-dialog')

/** Provided by OcPopover in compound mode, injected by OcPopoverTrigger / OcPopoverContent / OcPopoverAnchor. */
export interface PopoverContext {
  open: Ref<boolean>
  setOpen: (open: boolean) => void
  contentId: string
  anchorName: string
  anchored: Ref<boolean>
  anchorEl: Ref<HTMLElement | null>
  triggerEl: Ref<HTMLElement | null>
}
export const popoverKey: InjectionKey<PopoverContext> = Symbol('oc-popover-compound')

/** A value as part of an id: characters that do not belong in an id become a dash. */
export const idPart = (value: string) => value.replace(/[^A-Za-z0-9_-]+/g, '-')
