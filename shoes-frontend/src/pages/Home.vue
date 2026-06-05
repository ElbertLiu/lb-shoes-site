<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-vue-next';
import ClientLayout from '../layouts/ClientLayout.vue';
import { useLanguage } from '../i18n';
import { useCategories } from '../stores/categories';
import { useProducts } from '../stores/products';
import { resolveProductImage } from '../utils/api';
import { formatProductPrice, getProductCardGalleryImages, getProductCardImage, getProductTitle } from '../utils/productDisplay';
import type { Product } from '../types';
import heroFactoryImage from '../assets/home-shoe-factory-hero.png';

const router = useRouter();
const searchId = ref('');
const { t, lang, langObj } = useLanguage();
const { categories, getCategoryName } = useCategories();
const { fetchProductsPage } = useProducts();
const homeProducts = ref<Product[]>([]);
const selectedImageByProduct = ref<Record<string, number>>({});
const buyers = computed(() => langObj.value.home.buyers as readonly string[]);
const firstCategoryPath = computed(() => categories.value[0] ? `/products?category=${categories.value[0].id}` : '/products');

const handleSearch = () => {
  if (searchId.value.trim()) {
    router.push(`/products?search=${encodeURIComponent(searchId.value.trim())}`);
  }
};
const selectCardImage = (product: Product, index: number) => {
  selectedImageByProduct.value = { ...selectedImageByProduct.value, [product.id]: index };
};
const shiftCardImage = (product: Product, direction: number) => {
  const gallery = getProductCardGalleryImages(product);
  if (gallery.length <= 1) {
    return;
  }
  const current = selectedImageByProduct.value[product.id] || 0;
  selectCardImage(product, (current + direction + gallery.length) % gallery.length);
};
const selectColor = (product: Product, thumbnail: string) => {
  const index = getProductCardGalleryImages(product).findIndex((image) => image === thumbnail);
  selectCardImage(product, index >= 0 ? index : 0);
};

onMounted(async () => {
  try {
    homeProducts.value = (await fetchProductsPage({ featured: true, page: 1, pageSize: 20 })).items;
  } catch (error) {
    console.warn(error);
  }
});
</script>

<template>
  <ClientLayout>
    <section class="relative flex min-h-[500px] w-full items-center overflow-hidden bg-white md:min-h-[600px]">
      <div class="absolute inset-0 z-0">
        <div class="absolute right-0 top-0 h-full w-full md:w-[60%]">
          <img
            :src="heroFactoryImage"
            alt="Bright modern shoe factory production line"
            class="h-full w-full object-cover object-center"
          />
        </div>
        <div class="absolute inset-0 z-10 hidden bg-gradient-to-r from-white via-white/80 to-transparent md:block" />
        <div class="absolute inset-0 z-10 bg-gradient-to-t from-white via-white/60 to-transparent md:hidden" />
      </div>

      <div class="relative z-20 mx-auto w-full max-w-7xl px-6 py-20 md:py-0">
        <div class="flex w-full flex-col justify-center md:w-[55%]">
          <div class="mb-8 inline-flex items-center gap-2 self-start rounded-full border border-blue-100 bg-blue-50 px-3 py-1">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{{ t('home.direct') }}</span>
          </div>

          <h1 class="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 md:text-7xl">
            {{ t('home.slogan1') }}<br />
            <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {{ t('home.slogan2') }}
            </span>
          </h1>

          <div class="mt-4 md:mt-8">
            <h3 class="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{{ t('home.serve') }}</h3>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="audience in buyers"
                :key="audience"
                class="flex items-center rounded-xl border border-gray-100 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-[0_2px_10px_rgb(0,0,0,0.04)] transition-transform hover:-translate-y-0.5"
              >
                <div class="mr-2.5 h-1.5 w-1.5 rounded-full bg-gray-300 rtl:ml-2.5 rtl:mr-0" />
                {{ audience }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto my-12 max-w-7xl px-4 md:px-6">
      <div class="mx-auto max-w-2xl">
        <form class="relative flex items-center" @submit.prevent="handleSearch">
          <Search class="absolute left-4 h-5 w-5 text-gray-400 rtl:left-auto rtl:right-4" />
          <input
            v-model="searchId"
            type="text"
            :placeholder="t('home.searchPlaceholder')"
            class="w-full rounded-full border border-gray-200 bg-white py-4 pl-12 pr-32 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 md:text-base rtl:pl-32 rtl:pr-12"
          />
          <button type="submit" class="absolute bottom-2 right-2 top-2 rounded-full bg-gray-900 px-6 text-sm font-medium text-white transition-colors hover:bg-gray-800 rtl:left-2 rtl:right-auto">
            {{ t('home.searchAction') }}
          </button>
        </form>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 pb-20 md:px-6">
      <div class="mb-8 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">{{ t('home.featuredProducts') }}</h2>
      </div>

      <div v-if="homeProducts.length" class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
        <div
          v-for="product in homeProducts"
          :key="product.id"
          class="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
          <RouterLink :to="`/product/${product.id}`" class="relative block aspect-square overflow-hidden bg-gray-50">
            <img :src="resolveProductImage([getProductCardImage(product, selectedImageByProduct[product.id])])" :alt="product.id" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            <button v-if="getProductCardGalleryImages(product).length > 1" type="button" class="absolute left-0 top-1/2 flex h-8 w-7 -translate-y-1/2 cursor-pointer items-center justify-center bg-white/70 text-gray-900 opacity-0 shadow-sm transition-opacity hover:bg-white/90 group-hover:opacity-100" @click.prevent.stop="shiftCardImage(product, -1)">
              <ChevronLeft class="h-5 w-5" />
            </button>
            <button v-if="getProductCardGalleryImages(product).length > 1" type="button" class="absolute right-0 top-1/2 flex h-8 w-7 -translate-y-1/2 cursor-pointer items-center justify-center bg-white/70 text-gray-900 opacity-0 shadow-sm transition-opacity hover:bg-white/90 group-hover:opacity-100" @click.prevent.stop="shiftCardImage(product, 1)">
              <ChevronRight class="h-5 w-5" />
            </button>
          </RouterLink>
          <div v-if="getProductCardGalleryImages(product).length > 1" class="flex gap-1 px-2 pt-1.5">
            <button
              v-for="(_, index) in getProductCardGalleryImages(product)"
              :key="index"
              type="button"
              class="h-1 w-full rounded-full transition-colors"
              :class="(selectedImageByProduct[product.id] || 0) === index ? 'bg-gray-500' : 'bg-gray-200'"
              :aria-label="`Go to product image ${index + 1}`"
              @click.prevent.stop="selectCardImage(product, index)"
            />
          </div>
          <div class="flex flex-grow flex-col p-4 text-center lg:text-left rtl:lg:text-right">
            <p class="mb-1 font-mono text-xs text-gray-400">ID: {{ product.id }}</p>
            <h3 class="mb-1 line-clamp-1 text-sm font-medium text-gray-900">
              {{ getProductTitle(product, getCategoryName(product.category), lang) }}
            </h3>
            <p class="mt-auto pt-3 text-sm font-semibold text-blue-600">{{ formatProductPrice(product.price) }}</p>
            <div v-if="product.colorOptions.length" class="mt-3 flex items-center justify-center gap-2 lg:justify-start rtl:lg:justify-end">
              <button
                v-for="(color, index) in product.colorOptions.slice(0, 4)"
                :key="`${product.id}-${color.thumbnail}-${index}`"
                type="button"
                class="h-8 w-8 overflow-hidden rounded border bg-gray-100 transition-colors"
                :class="getProductCardImage(product, selectedImageByProduct[product.id]) === color.thumbnail ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'"
                :title="`c${index + 1}`"
                @click.prevent.stop="selectColor(product, color.thumbnail)"
              >
                <img :src="resolveProductImage([color.thumbnail])" alt="" class="h-full w-full object-cover" loading="lazy" />
              </button>
              <span v-if="product.colorOptions.length > 4" class="text-xs font-medium text-gray-500">+{{ product.colorOptions.length - 4 }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
        暂无首页精选产品
      </div>

      <div class="mt-16 text-center">
        <RouterLink :to="firstCategoryPath" class="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-4 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900">
          {{ t('home.viewAll') }}
          <ArrowRight class="h-4 w-4 rtl:rotate-180" />
        </RouterLink>
      </div>
    </section>
  </ClientLayout>
</template>
