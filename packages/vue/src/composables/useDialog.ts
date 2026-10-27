import { onMounted, watch, type Ref } from 'vue'

/**
 * Keeps a native <dialog> in sync with a boolean `open` model:
 * open -> showModal(), closed -> close(). Native close (Esc, backdrop, form method=dialog)
 * is reported through `onClose` so v-model:open stays correct.
 */
export function useDialog(open: Ref<boolean | undefined>, el: Ref<HTMLDialogElement | null>) {
  function sync() {
    const dialog = el.value
    if (!dialog) return
    if (open.value && !dialog.open) dialog.showModal()
    else if (!open.value && dialog.open) dialog.close()
  }
  watch(open, sync, { flush: 'post' })
  onMounted(sync)
  function onClose() {
    if (open.value) open.value = false
  }
  return { onClose }
}
