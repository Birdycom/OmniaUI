import * as Vue from 'vue'

let counter = 0

/**
 * Stable unique id for aria-labelledby / popovertarget / label-for wiring.
 * Uses Vue's built-in useId() when available (Vue >= 3.5, SSR safe), otherwise a counter.
 */
export function useUid(prefix = 'oc'): string {
  const useId = (Vue as Record<string, unknown>)['useId'] as (() => string) | undefined
  return `${prefix}-${useId ? useId() : ++counter}`
}
