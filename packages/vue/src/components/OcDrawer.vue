<!-- File: packages/vue/src/components/OcDrawer.vue | Map: props + v-model:open -> trigger (slot or button with label; invoker command) -> dialog.oc-drawer (handle, header, body, footer) -->
<script setup lang="ts">
/**
 * Bottom sheet on a native <dialog class="oc-drawer"> (same markup as packages/ui/snippets/drawer.html).
 * v-model:open controls it; Esc / backdrop / close() update the model. `label` renders an outline trigger button
 * (command="show-modal", so it also opens before hydration); slot `trigger` (scoped: { id, open }) replaces it.
 * Slots: header (replaces title + description), default (body), footer (scoped: { close }).
 * Classes: .oc-drawer(--center), -content, -handle, -header, -title, -description, -body, -footer
 */
import { ref, useAttrs } from 'vue'
import { useDialog } from '../composables/useDialog'
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
withDefaults(
  defineProps<{
    title?: string
    description?: string
    /** Text of the trigger button (none without it). */
    label?: string
    /** Centered panel from 40rem up. */
    center?: boolean
    closedby?: 'any' | 'closerequest' | 'none'
  }>(),
  { closedby: 'any' },
)
const attrs = useAttrs()
const open = defineModel<boolean>('open', { default: false })
const el = ref<HTMLDialogElement | null>(null)
const { onClose } = useDialog(open, el)
const id = (attrs.id as string | undefined) ?? useUid('oc-drawer')
const close = () => (open.value = false)
const show = () => (open.value = true)
defineExpose({ close, show })
</script>

<template>
  <slot name="trigger" :id="id" :open="show">
    <button v-if="label" class="oc-btn oc-btn--outline" type="button" command="show-modal" :commandfor="id" @click="show">{{ label }}</button>
  </slot>
  <dialog
    v-bind="attrs"
    :id="id"
    ref="el"
    :class="['oc-drawer', center && 'oc-drawer--center']"
    :closedby="closedby"
    :aria-labelledby="title ? `${id}-title` : undefined"
    @close="onClose"
  >
    <div class="oc-drawer-content">
      <div class="oc-drawer-handle" aria-hidden="true"></div>
      <div v-if="title || description || $slots.header" class="oc-drawer-header">
        <slot name="header">
          <h2 v-if="title" :id="`${id}-title`" class="oc-drawer-title">{{ title }}</h2>
          <p v-if="description" class="oc-drawer-description">{{ description }}</p>
        </slot>
      </div>
      <div v-if="$slots.default" class="oc-drawer-body"><slot /></div>
      <div v-if="$slots.footer" class="oc-drawer-footer"><slot name="footer" :close="close" /></div>
    </div>
  </dialog>
</template>
