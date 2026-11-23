// File: packages/vue/src/composables/keys-d2.ts
// Map: field context (OcFormField -> OcInput): validation report
// Injection keys of the 0.17.0 form-field extras (kept apart from keys.ts).

import type { InjectionKey } from 'vue'

/** Provided by OcFormField, injected by OcInput: the input reports its blur validation so the field can show the message. */
export interface FieldContext {
  report: (valid: boolean, message?: string) => void
}
export const fieldContextKey: InjectionKey<FieldContext> = Symbol('oc-field')
