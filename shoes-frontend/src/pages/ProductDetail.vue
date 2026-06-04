<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import ClientLayout from '../layouts/ClientLayout.vue';
import { useLanguage } from '../i18n';
import { useCategories } from '../stores/categories';
import { useProducts } from '../stores/products';
import { useToast } from '../composables/useToast';
import { resolveMediaUrl, resolveProductImage } from '../utils/api';

const route = useRoute();
const { t, lang } = useLanguage();
const { getCategoryName } = useCategories();
const { products } = useProducts();
const { success } = useToast();
const currentImageIndex = ref(0);
const whatsappContact = (import.meta.env.VITE_WHATSAPP_CONTACT as string | undefined)?.trim() || '+86 138-0000-0000';
const facebookContact = (import.meta.env.VITE_FACEBOOK_CONTACT as string | undefined)?.trim() || 'ShoeFactory123';
const product = computed(() => products.value.find((p) => p.id === route.params.id));
const isRtl = computed(() => lang.value === 'ar');
const productImages = computed(() => product.value?.images.map((image) => image.trim()).filter(Boolean) || []);
const currentProductImage = computed(() => resolveProductImage(product.value?.images, currentImageIndex.value));
const hasMultipleImages = computed(() => productImages.value.length > 1);

const nextImage = () => {
  if (hasMultipleImages.value) {
    currentImageIndex.value = (currentImageIndex.value + 1) % productImages.value.length;
  }
};
const prevImage = () => {
  if (hasMultipleImages.value) {
    currentImageIndex.value = currentImageIndex.value === 0 ? productImages.value.length - 1 : currentImageIndex.value - 1;
  }
};
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  success('Copied to clipboard');
};

watch(() => route.params.id, () => {
  currentImageIndex.value = 0;
});
</script>

<template>
  <ClientLayout>
    <div v-if="!product" class="flex min-h-[60vh] flex-col items-center justify-center p-20 text-center">
      <h2 class="mb-4 text-2xl font-bold text-gray-900">{{ t('product.notFound') }}</h2>
      <RouterLink to="/products" class="text-blue-600 hover:underline">{{ t('product.back') }}</RouterLink>
    </div>

    <div v-else class="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-12">
      <RouterLink to="/products" class="mb-8 inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-900">
        <ArrowRight v-if="isRtl" class="ml-1 h-4 w-4" />
        <ArrowLeft v-else class="mr-1 h-4 w-4" />
        {{ t('product.back') }}
      </RouterLink>

      <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div class="flex w-full flex-col gap-4 lg:w-1/2">
          <div class="group relative aspect-square overflow-hidden rounded-2xl bg-gray-50 md:aspect-[4/3] lg:aspect-square">
            <img :src="currentProductImage" :alt="product.name" class="h-full w-full object-cover" />
            <button v-if="hasMultipleImages" class="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100" @click="prevImage">
              <ChevronLeft class="h-5 w-5 rtl:rotate-180" />
            </button>
            <button v-if="hasMultipleImages" class="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100" @click="nextImage">
              <ChevronRight class="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>

          <div v-if="productImages.length" class="no-scrollbar flex gap-4 overflow-x-auto pb-1">
            <button v-for="(img, idx) in productImages" :key="`${img}-${idx}`" class="aspect-square w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:w-32 md:w-36 lg:w-[calc((100%_-_3rem)/4)]" :class="currentImageIndex === idx ? 'border-gray-900' : 'border-transparent hover:border-gray-200'" @click="currentImageIndex = idx">
              <img :src="resolveMediaUrl(img)" alt="" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <div class="flex w-full flex-col py-2 lg:w-1/2 lg:py-6">
          <div class="mb-2 flex items-center gap-3">
            <span class="rounded bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{{ getCategoryName(product.category) }}</span>
            <span class="font-mono text-sm font-medium text-gray-400">#{{ product.id }}</span>
          </div>

          <h1 class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            {{ t('products.newProduct', { cat: getCategoryName(product.category), style: product.brief }) }}
          </h1>

          <div class="prose prose-sm mb-8 max-w-none text-gray-500">
            <p>{{ t('product.desc') }}</p>
          </div>

          <div class="mb-8 flex flex-col gap-4 border-y border-gray-100 py-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500">{{ t('product.price') }}</span>
              <span class="text-2xl font-bold text-gray-900">{{ product.price }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500">{{ t('product.stockStatus') }}</span>
              <span class="flex items-center text-sm font-medium" :class="product.inStock ? 'text-green-600' : 'text-orange-500'">
                <CheckCircle2 v-if="product.inStock" class="mr-1.5 h-4 w-4 rtl:ml-1.5 rtl:mr-0" />
                {{ product.inStock ? t('product.inStock') : t('product.outOfStock') }}
              </span>
            </div>
          </div>

          <div class="mt-auto flex flex-col gap-3">
            <p class="mb-1 text-center text-xs text-gray-400 lg:text-left rtl:lg:text-right">{{ t('product.contactTip') }}</p>
            <button class="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-4 py-4 text-white shadow-sm transition-colors hover:bg-[#1DA851] hover:shadow-md" @click="copyToClipboard(whatsappContact)">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="h-6 w-6 shrink-0 fill-current">
                <path d="M12.04 2a9.86 9.86 0 0 0-8.45 14.94L2.42 22l5.19-1.14A9.86 9.86 0 1 0 12.04 2Zm0 1.82a8.04 8.04 0 0 1 6.8 12.33 8.04 8.04 0 0 1-10.7 2.76l-.33-.18-3.08.68.7-3-.2-.35a8.04 8.04 0 0 1 6.81-12.24Zm-3.44 4.4c-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.3s.99 2.68 1.13 2.86c.14.18 1.91 3.05 4.74 4.15 2.35.92 2.83.74 3.34.69.51-.05 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.18.28-.73.9-.9 1.08-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.38-.83-.73-1.38-1.64-1.54-1.91-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.18-.28.28-.47.09-.18.05-.35-.02-.49-.07-.14-.63-1.55-.88-2.12-.23-.55-.47-.47-.65-.48h-.54Z" />
              </svg>
              <span class="flex min-w-0 flex-col items-start text-left rtl:items-end rtl:text-right">
                <span class="text-sm font-semibold leading-tight">{{ t('product.copyWhatsapp') }}</span>
                <span class="mt-1 font-mono text-lg font-bold leading-tight tracking-normal">{{ whatsappContact }}</span>
              </span>
            </button>
            <button class="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-4 text-white shadow-sm transition-colors hover:bg-[#166FE5] hover:shadow-md" @click="copyToClipboard(`Facebook: ${facebookContact}`)">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="h-6 w-6 shrink-0 fill-current">
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.88v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
              </svg>
              <span class="flex min-w-0 flex-col items-start text-left rtl:items-end rtl:text-right">
                <span class="text-sm font-semibold leading-tight">{{ t('product.copyFacebook') }}</span>
                <span class="mt-1 font-mono text-lg font-bold leading-tight tracking-normal">Facebook: {{ facebookContact }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </ClientLayout>
</template>
