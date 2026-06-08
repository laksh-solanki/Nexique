import { reactive } from "vue";

const state = reactive({
  toasts: [],
});

export function useToast() {
  function remove(id) {
    const index = state.toasts.findIndex((toast) => toast.id === id);
    if (index !== -1) state.toasts.splice(index, 1);
  }

  function push(message, type = "success") {
    const id = crypto.randomUUID();
    state.toasts.push({ id, message, type });
    window.setTimeout(() => remove(id), 3600);
  }

  return {
    state,
    success: (message) => push(message, "success"),
    error: (message) => push(message, "error"),
    info: (message) => push(message, "info"),
    remove,
  };
}
