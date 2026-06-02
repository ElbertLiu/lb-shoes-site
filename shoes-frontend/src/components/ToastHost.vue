<script setup lang="ts">
import { useToast } from '../composables/useToast';

const { toasts } = useToast();
</script>

<template>
  <div class="fixed top-5 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white shadow-lg"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
