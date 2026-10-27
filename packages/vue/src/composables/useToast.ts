import { reactive, readonly } from 'vue'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  /** Milliseconds before auto-dismiss. 0 keeps the toast until dismissed. Default 5000. */
  duration?: number
}

export interface ToastItem extends Required<Pick<ToastOptions, 'title' | 'variant'>> {
  id: number
  description?: string
  duration: number
}

const state = reactive<{ toasts: ToastItem[] }>({ toasts: [] })
const timers = new Map<number, ReturnType<typeof setTimeout>>()
let nextId = 1

function dismiss(id: number) {
  const timer = timers.get(id)
  if (timer) clearTimeout(timer)
  timers.delete(id)
  const i = state.toasts.findIndex((t) => t.id === id)
  if (i !== -1) state.toasts.splice(i, 1)
}

function push(options: ToastOptions): number {
  const id = nextId++
  const item: ToastItem = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? 'info',
    duration: options.duration ?? 5000,
  }
  state.toasts.push(item)
  if (item.duration > 0) timers.set(id, setTimeout(() => dismiss(id), item.duration))
  return id
}

function clear() {
  for (const t of [...state.toasts]) dismiss(t.id)
}

const shortcut =
  (variant: ToastVariant) =>
  (title: string, description?: string, options: Omit<ToastOptions, 'title' | 'description' | 'variant'> = {}) =>
    push({ ...options, title, description, variant })

/** Shared toast queue. Render it once with <OcToastContainer />. */
export function useToast() {
  return {
    toasts: readonly(state).toasts,
    push,
    dismiss,
    clear,
    success: shortcut('success'),
    error: shortcut('error'),
    warning: shortcut('warning'),
    info: shortcut('info'),
  }
}
