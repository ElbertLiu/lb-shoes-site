import { reactive } from 'vue';

interface ToastItem {
  id: number;
  message: string;
}

const toasts = reactive<ToastItem[]>([]);

export function useToast() {
  const success = (message: string) => {
    const id = Date.now();
    toasts.push({ id, message });
    window.setTimeout(() => {
      const index = toasts.findIndex((toast) => toast.id === id);
      if (index >= 0) {
        toasts.splice(index, 1);
      }
    }, 1800);
  };

  return { toasts, success };
}
