<script setup lang="ts">
import { ref } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useLanguage } from '../i18n';
import type { Product } from '../types';
import { resolveProductImage } from '../utils/api';
import { formatProductPrice, getProductCardGalleryImages, getProductCardImage, getProductTitle } from '../utils/productDisplay';

const props = defineProps<{
  product: Product;
  categoryName: string;
}>();

const { lang } = useLanguage();
const selectedImageIndex = ref(0);

const selectCardImage = (index: number) => {
  selectedImageIndex.value = index;
};

const shiftCardImage = (direction: number) => {
  const gallery = getProductCardGalleryImages(props.product);
  if (gallery.length <= 1) {
    return;
  }
  selectedImageIndex.value = (selectedImageIndex.value + direction + gallery.length) % gallery.length;
};

const selectColor = (thumbnail: string) => {
  const index = getProductCardGalleryImages(props.product).findIndex((image) => image === thumbnail);
  selectCardImage(index >= 0 ? index : 0);
};
</script>

<template>
  <div class="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
    <RouterLink :to="`/product/${product.id}`" class="relative block aspect-square overflow-hidden bg-gray-50">
      <img :src="resolveProductImage([getProductCardImage(product, selectedImageIndex)])" :alt="product.id" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      <button v-if="getProductCardGalleryImages(product).length > 1" type="button" class="absolute left-0 top-1/2 flex h-8 w-7 -translate-y-1/2 cursor-pointer items-center justify-center bg-white/70 text-gray-900 opacity-0 shadow-sm transition-opacity hover:bg-white/90 group-hover:opacity-100" @click.prevent.stop="shiftCardImage(-1)">
        <ChevronLeft class="h-5 w-5" />
      </button>
      <button v-if="getProductCardGalleryImages(product).length > 1" type="button" class="absolute right-0 top-1/2 flex h-8 w-7 -translate-y-1/2 cursor-pointer items-center justify-center bg-white/70 text-gray-900 opacity-0 shadow-sm transition-opacity hover:bg-white/90 group-hover:opacity-100" @click.prevent.stop="shiftCardImage(1)">
        <ChevronRight class="h-5 w-5" />
      </button>
    </RouterLink>

    <div v-if="getProductCardGalleryImages(product).length > 1" class="hidden gap-1 px-2 pt-1.5 lg:flex">
      <button
        v-for="(_, index) in getProductCardGalleryImages(product)"
        :key="index"
        type="button"
        class="h-1 w-full rounded-full transition-colors"
        :class="selectedImageIndex === index ? 'bg-gray-500' : 'bg-gray-200'"
        :aria-label="`Go to product image ${index + 1}`"
        @click.prevent.stop="selectCardImage(index)"
      />
    </div>

    <div class="flex flex-grow flex-col p-4 text-center lg:text-left rtl:lg:text-right">
      <p class="mb-1 font-mono text-xs text-gray-400">ID: {{ product.id }}</p>
      <h3 class="mb-1 line-clamp-1 text-sm font-medium text-gray-900">
        {{ getProductTitle(product, categoryName, lang) }}
      </h3>
      <p class="mt-auto pt-3 text-sm font-semibold text-blue-600">{{ formatProductPrice(product.price) }}</p>
      <div v-if="product.colorOptions.length" class="mt-3 flex items-center justify-center gap-2 lg:justify-start rtl:lg:justify-end">
        <button
          v-for="(color, index) in product.colorOptions.slice(0, 4)"
          :key="`${product.id}-${color.thumbnail}-${index}`"
          type="button"
          class="h-8 w-8 overflow-hidden rounded border bg-gray-100 transition-colors"
          :class="getProductCardImage(product, selectedImageIndex) === color.thumbnail ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'"
          :title="`c${index + 1}`"
          @click.prevent.stop="selectColor(color.thumbnail)"
        >
          <img :src="resolveProductImage([color.thumbnail])" alt="" class="h-full w-full object-cover" loading="lazy" />
        </button>
        <span v-if="product.colorOptions.length > 4" class="text-xs font-medium text-gray-500">+{{ product.colorOptions.length - 4 }}</span>
      </div>
    </div>
  </div>
</template>
