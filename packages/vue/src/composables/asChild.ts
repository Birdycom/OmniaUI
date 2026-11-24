// File: packages/vue/src/composables/asChild.ts
// Map: SlotChild (merge attributes into the only slot child) -> used by the 0.17.0 compound triggers (as-child)
// Internal helper; not exported from the package index.

import { Comment, Fragment, cloneVNode, defineComponent, h, mergeProps } from 'vue'
import type { VNode, VNodeArrayChildren } from 'vue'

/** The real nodes of a slot: comments dropped, fragments (v-for, template) flattened. */
function realNodes(nodes: VNode[]): VNode[] {
  return nodes.flatMap((n) => (n.type === Fragment && Array.isArray(n.children) ? realNodes(n.children as VNode[]) : n.type === Comment ? [] : [n]))
}

/**
 * Renders its only slot child with the attributes merged in (class and style joined, event listeners chained:
 * mergeProps). With more or fewer children it renders the slot unchanged.
 * 0.18.0: the child's own content can be changed: an `append` slot is added after it, and the `fill` prop
 * (own content -> new content) rewrites it, for an element child or the default slot of a component child (the rich
 * content of a tooltip, the icon and hint of a menu item around a router link).
 */
export const SlotChild = defineComponent({
  name: 'OcSlotChild',
  inheritAttrs: false,
  props: { fill: { type: Function, default: undefined } },
  setup(props, { slots, attrs }) {
    return () => {
      const nodes = realNodes(slots.default?.() ?? [])
      if (nodes.length !== 1) return nodes
      const extra = slots.append?.() ?? []
      const fill = props.fill as ((own: VNodeArrayChildren) => VNodeArrayChildren) | undefined
      if (!extra.length && !fill) return cloneVNode(nodes[0], attrs, true)
      const change = (own: VNodeArrayChildren): VNodeArrayChildren => [...(fill ? fill(own) : own), ...extra]
      const n = nodes[0]
      const merged = mergeProps(n.props ?? {}, attrs)
      if (typeof n.type === 'string') {
        const own: VNodeArrayChildren = typeof n.children === 'string' ? [n.children] : Array.isArray(n.children) ? (n.children as VNodeArrayChildren) : []
        return h(n.type, merged, change(own))
      }
      const own = n.children && typeof n.children === 'object' && !Array.isArray(n.children) ? (n.children as Record<string, unknown>) : {}
      const inner = typeof own.default === 'function' ? (own.default as () => VNode[]) : () => []
      return h(n.type as never, merged, { ...own, default: () => change(inner()) })
    }
  },
})
