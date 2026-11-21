// File: packages/vue/src/composables/asChild.ts
// Map: SlotChild (merge attributes into the only slot child) -> used by the 0.17.0 compound triggers (as-child)
// Internal helper; not exported from the package index.

import { Comment, Fragment, cloneVNode, defineComponent } from 'vue'
import type { VNode } from 'vue'

/** The real nodes of a slot: comments dropped, fragments (v-for, template) flattened. */
function realNodes(nodes: VNode[]): VNode[] {
  return nodes.flatMap((n) => (n.type === Fragment && Array.isArray(n.children) ? realNodes(n.children as VNode[]) : n.type === Comment ? [] : [n]))
}

/**
 * Renders its only slot child with the attributes merged in (class and style joined, event listeners chained:
 * mergeProps). With more or fewer children it renders the slot unchanged.
 */
export const SlotChild = defineComponent({
  name: 'OcSlotChild',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => {
      const nodes = realNodes(slots.default?.() ?? [])
      if (nodes.length !== 1) return nodes
      return cloneVNode(nodes[0], attrs, true)
    }
  },
})
