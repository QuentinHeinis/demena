import type { Toast } from '~/types'

let counter = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(message: string, type: Toast['type'] = 'info') {
    const id = ++counter
    toasts.value = [...toasts.value, { id, message, type }]
    if (import.meta.client) {
      window.setTimeout(() => dismiss(id), 4500)
    }
    return id
  }

  return {
    toasts,
    push,
    dismiss,
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error'),
    info: (message: string) => push(message, 'info')
  }
}
