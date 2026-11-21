import type { InjectionKey, Ref } from 'vue'

/** Provided by OcRadioGroup, injected by OcRadio. */
export interface RadioGroupContext {
  model: Ref<string | number | undefined>
  name: Ref<string>
  card: Ref<boolean>
  /** Id of the group's error message (0.17.0): every radio gets aria-invalid + aria-describedby. */
  errorId?: Ref<string | undefined>
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
