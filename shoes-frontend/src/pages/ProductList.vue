<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight, Search } from 'lucide-vue-next';
import ClientLayout from '../layouts/ClientLayout.vue';
import { useLanguage } from '../i18n';
import { useCategories } from '../stores/categories';
import { useProducts } from '../stores/products';
import { resolveProductImage } from '../utils/api';
import type { Product } from '../types';
import { formatProductPrice, getProductCardGalleryImages, getProductCardImage, getProductTitle } from '../utils/productDisplay';

const ITEMS_PER_PAGE = 20;
const route = useRoute();
const router = useRouter();
const { t, lang } = useLanguage();
const { categories, getCategoryName } = useCategories();
const { fetchProductsPage } = useProducts();
const searchInput = ref((route.query.search as string) || '');
const pageProducts = ref<Product[]>([]);
const selectedImageByProduct = ref<Record<string, number>>({});
const totalItems = ref(0);
const totalPages = ref(0);
const isLoading = ref(false);

const categoryParam = computed(() => route.query.category as string | undefined);
const searchParam = computed(() => route.query.search as string | undefined);
const currentPage = computed(() => {
  const rawPage = Number.parseInt(String(route.query.page || '1'), 10);
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
});
const title = computed(() => {
  if (categoryParam.value) {
    return getCategoryName(categoryParam.value);
  }
  if (searchParam.value) {
    return t('products.searchResults', { query: searchParam.value });
  }
  return t('products.allProducts');
});

watch(() => route.query.search, (value) => {
  searchInput.value = (value as string) || '';
});

const setQuery = (query: Record<string, string>) => {
  router.push({ path: '/products', query });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
const handleSearch = () => setQuery(searchInput.value ? { search: searchInput.value } : {});
const selectCategory = (catId: string) => setQuery({ category: catId });
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
const goPage = (page: number) => {
  const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages.value, 1));
  const query: Record<string, string> = {};
  if (categoryParam.value) {
    query.category = categoryParam.value;
  }
  if (searchParam.value) {
    query.search = searchParam.value;
  }
  if (nextPage > 1) {
    query.page = String(nextPage);
  }
  router.push({ path: '/products', query });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const loadProductsPage = async () => {
  isLoading.value = true;
  try {
    const result = await fetchProductsPage({
      category: categoryParam.value,
      search: searchParam.value,
      page: currentPage.value,
      pageSize: ITEMS_PER_PAGE,
    });
    pageProducts.value = result.items;
    totalItems.value = result.pagination.total;
    totalPages.value = result.pagination.totalPages;
  } catch (error) {
    console.warn(error);
    pageProducts.value = [];
    totalItems.value = 0;
    totalPages.value = 0;
  } finally {
    isLoading.value = false;
  }
};

watch([categoryParam, searchParam, currentPage], () => {
  void loadProductsPage();
}, { immediate: true });
</script>

<template>
  <ClientLayout>
    <div class="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div class="no-scrollbar mb-6 flex gap-3 overflow-x-auto border-b border-gray-100 pb-4 md:hidden">
        <button class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors" :class="!categoryParam && !searchParam ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'" @click="setQuery({})">
          {{ t('products.all') }}
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors"
          :class="categoryParam === cat.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'"
          @click="selectCategory(cat.id)"
        >
          {{ getCategoryName(cat.id) }}
        </button>
      </div>

      <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ t('products.foundProducts', { count: totalItems }) }}</p>
        </div>

        <form class="relative w-full md:w-80" @submit.prevent="handleSearch">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
          <input v-model="searchInput" type="text" :placeholder="t('products.searchPlaceholder')" class="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 rtl:pl-4 rtl:pr-10" />
        </form>
      </div>

      <div v-if="!isLoading && pageProducts.length === 0" class="py-20 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <Search class="h-6 w-6 text-gray-300" />
        </div>
        <h3 class="text-lg font-medium text-gray-900">{{ t('products.noProducts') }}</h3>
        <p class="mt-1 text-gray-500">{{ t('products.tryAnother') }}</p>
        <button class="mt-6 rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800" @click="setQuery({})">
          {{ t('products.allProducts') }}
        </button>
      </div>

      <template v-else>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
          <div v-for="product in pageProducts" :key="product.id" class="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
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

        <div v-if="totalPages > 1" class="mt-12 flex items-center justify-center gap-2" dir="ltr">
          <button :disabled="currentPage === 1" class="flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent" @click="goPage(currentPage - 1)">
            <ChevronLeft class="h-4 w-4" />
          </button>
          <button v-for="page in totalPages" :key="page" class="h-8 w-8 rounded text-sm font-medium transition-colors" :class="currentPage === page ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'" @click="goPage(page)">
            {{ page }}
          </button>
          <button :disabled="currentPage === totalPages" class="flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent" @click="goPage(currentPage + 1)">
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </template>
    </div>
  </ClientLayout>
</template>
