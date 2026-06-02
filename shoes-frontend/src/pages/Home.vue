<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Search } from 'lucide-vue-next';
import ClientLayout from '../layouts/ClientLayout.vue';
import { useLanguage } from '../i18n';
import { useCategories } from '../stores/categories';
import { useProducts } from '../stores/products';
import { resolveMediaUrl } from '../utils/api';
import heroFactoryImage from '../assets/home-shoe-factory-hero.png';

const router = useRouter();
const searchId = ref('');
const { t, langObj } = useLanguage();
const { categories, getCategoryName } = useCategories();
const { products } = useProducts();
const buyers = computed(() => langObj.value.home.buyers as readonly string[]);
const firstCategoryPath = computed(() => categories.value[0] ? `/products?category=${categories.value[0].id}` : '/products');
const homeProducts = computed(() => products.value.filter((product) => product.featured).slice(0, 20));

const handleSearch = () => {
  if (searchId.value.trim()) {
    router.push(`/products?search=${encodeURIComponent(searchId.value.trim())}`);
  }
};
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
        <RouterLink
          v-for="product in homeProducts"
          :key="product.id"
          :to="`/product/${product.id}`"
          class="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-gray-50">
            <img :src="resolveMediaUrl(product.images[0])" :alt="product.id" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          </div>
          <div class="flex flex-grow flex-col p-4 text-center lg:text-left rtl:lg:text-right">
            <p class="mb-1 font-mono text-xs text-gray-400">{{ product.id }}</p>
            <h3 class="mb-1 line-clamp-1 text-sm font-medium text-gray-900">
              {{ t('products.newProduct', { cat: getCategoryName(product.category), style: product.brief }) }}
            </h3>
            <div class="mt-auto hidden items-center justify-center rounded-md border border-gray-200 py-2 text-xs font-medium text-gray-700 transition-colors group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white lg:flex">
              {{ t('home.viewDetails') }}
            </div>
          </div>
        </RouterLink>
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
