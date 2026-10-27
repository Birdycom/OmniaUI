import type { InjectionKey, Ref } from 'vue'

/** Provided by OcRadioGroup, injected by OcRadio. */
export interface RadioGroupContext {
  model: Ref<string | number | undefined>
  name: Ref<string>
  card: Ref<boolean>
}
export const radioGroupKey: InjectionKey<RadioGroupContext> = Symbol('oc-radio-group')

/** Provided by OcToggleGroup, injected by OcToggle. */
export interface ToggleGroupContext {
  /** Currently pressed values. */
  values: Ref<string[]>
  type: Ref<'single' | 'multiple'>
  name: Ref<string>
  toggle: (value: string) => void
}
export const toggleGroupKey: InjectionKey<ToggleGroupContext> = Symbol('oc-toggle-group')

/** Provided by OcResizable, injected by OcResizablePanel. */
export const resizableVerticalKey: InjectionKey<Ref<boolean>> = Symbol('oc-resizable-vertical')
