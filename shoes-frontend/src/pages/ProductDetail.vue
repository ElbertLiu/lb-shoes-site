<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, MessageCircle, Share2 } from 'lucide-vue-next';
import ClientLayout from '../layouts/ClientLayout.vue';
import { useLanguage } from '../i18n';
import { useCategories } from '../stores/categories';
import { useProducts } from '../stores/products';
import { useToast } from '../composables/useToast';
import { resolveMediaUrl } from '../utils/api';

const route = useRoute();
const { t, lang } = useLanguage();
const { getCategoryName } = useCategories();
const { products } = useProducts();
const { success } = useToast();
const currentImageIndex = ref(0);
const product = computed(() => products.value.find((p) => p.id === route.params.id));
const isRtl = computed(() => lang.value === 'ar');

const nextImage = () => {
  if (product.value) {
    currentImageIndex.value = (currentImageIndex.value + 1) % product.value.images.length;
  }
};
const prevImage = () => {
  if (product.value) {
    currentImageIndex.value = currentImageIndex.value === 0 ? product.value.images.length - 1 : currentImageIndex.value - 1;
  }
};
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  success('Copied to clipboard');
};
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
            <img :src="resolveMediaUrl(product.images[currentImageIndex])" :alt="product.name" class="h-full w-full object-cover" />
            <button class="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100" @click="prevImage">
              <ChevronLeft class="h-5 w-5 rtl:rotate-180" />
            </button>
            <button class="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100" @click="nextImage">
              <ChevronRight class="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <button v-for="(img, idx) in product.images" :key="img" class="aspect-square overflow-hidden rounded-lg border-2 transition-colors" :class="currentImageIndex === idx ? 'border-gray-900' : 'border-transparent hover:border-gray-200'" @click="currentImageIndex = idx">
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
            <button class="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 font-medium text-white shadow-sm transition-colors hover:bg-gray-800 hover:shadow-md" @click="copyToClipboard('+86 138-0000-0000')">
              <MessageCircle class="h-5 w-5 ltr:mr-1 rtl:ml-1 rtl:mr-0" />
              {{ t('product.copyWhatsapp') }}
            </button>
            <button class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-4 font-medium text-gray-700 transition-colors hover:bg-gray-50" @click="copyToClipboard('Facebook: ShoeFactory123')">
              <Share2 class="h-5 w-5 ltr:mr-1 rtl:ml-1 rtl:mr-0" />
              {{ t('product.copyFacebook') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </ClientLayout>
</template>
