import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import {defineConfig} from 'vite';

function manualChunks(id: string) {
  if (!id.includes('node_modules')) {
    return undefined;
  }
  const normalized = id.replace(/\\/g, '/');
  if (
    normalized.includes('/vue/')
    || normalized.includes('/vue-router/')
    || normalized.includes('/element-plus/')
    || normalized.includes('/@element-plus/')
    || normalized.includes('/@vueuse/')
  ) {
    return 'element-vendor';
  }
  return 'vendor';
}

export default defineConfig(() => {
  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
  };
});
