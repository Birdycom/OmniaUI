import { computed, useAttrs } from 'vue'

/**
 * For components whose root is a wrapper (label, div) around the real form control:
 * `class` and `style` stay on the wrapper, every other attribute (id, name, disabled,
 * autocomplete, aria-*, listeners) goes to the control. Use with defineOptions({ inheritAttrs: false }).
 */
export function useAttrsSplit() {
  const attrs = useAttrs()
  const root = computed(() => ({ class: attrs.class, style: attrs.style }))
  const control = computed(() => {
    const { class: _c, style: _s, ...rest } = attrs
    return rest
  })
  return { root, control }
}
