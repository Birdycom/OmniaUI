<!-- File: packages/vue/src/components/OcNameCard.vue | Map: props -> details (head, body slot) -> rename event on mount -->
<script setup lang="ts">
/** Name card: name, rename pencil (when renamable), meta, amount and an actions slot; default slot = content. Emits rename. */
import { onMounted, useTemplateRef } from 'vue'
import { bindNameCard } from '../../../ui/src/form-extras.js'

const props = withDefaults(defineProps<{ name: string; amount?: string; meta?: string; renamable?: boolean; total?: boolean; open?: boolean }>(), { renamable: false, total: false, open: false })
const emit = defineEmits<{ rename: [name: string] }>()
const root = useTemplateRef<HTMLDetailsElement>('root')
onMounted(() => {
  if (!root.value || !props.renamable) return
  bindNameCard(root.value)
  root.value.addEventListener('oc-namecard-rename', (e) => emit('rename', (e as CustomEvent<{ name: string }>).detail.name))
})
</script>

<template>
  <details ref="root" :class="['oc-name-card', total && 'oc-name-card--total']" :open="open">
    <summary class="oc-name-card__head">
      <span class="oc-name-card__title">{{ name }}</span>
      <button v-if="renamable" type="button" class="oc-btn oc-btn--plain" data-oc-rename :aria-label="`Rename ${name}`" title="Rename"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z" /></svg></button>
      <span v-if="meta" class="oc-name-card__meta">{{ meta }}</span>
      <span v-if="amount" class="oc-name-card__amount">{{ amount }}</span>
      <span v-if="$slots.actions" class="oc-name-card__actions"><slot name="actions" /></span>
    </summary>
    <div class="oc-name-card__body"><slot /></div>
  </details>
</template>
