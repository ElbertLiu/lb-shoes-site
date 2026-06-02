<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Box, ChevronDown, Globe, Home, Phone, Search } from 'lucide-vue-next';
import { languages, type LanguageCode, useLanguage } from '../i18n';
import { useCategories } from '../stores/categories';
import { useProducts } from '../stores/products';
import ToastHost from '../components/ToastHost.vue';

const route = useRoute();
const { lang, setLang, t } = useLanguage();
const { categories, getCategoryName, startCategorySync } = useCategories();
const { products, startProductSync } = useProducts();
const showLangMenu = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const productId = computed(() => (route.name ? undefined : route.params.id as string | undefined));
const currentProduct = computed(() => productId.value ? products.value.find((p) => p.id === productId.value) : undefined);
const currentCategory = computed(() => (route.query.category as string | undefined) || currentProduct.value?.category);
const isContactPage = computed(() => route.path === '/contact');
const isProductsTabActive = computed(() => route.path.startsWith('/products') || route.path.startsWith('/product/'));
const direction = computed(() => lang.value === 'ar' ? 'rtl' : 'ltr');
const firstCategoryPath = computed(() => categories.value[0] ? `/products?category=${categories.value[0].id}` : '/products');

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
const closeOnOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showLangMenu.value = false;
  }
};
const chooseLanguage = (code: string) => {
  setLang(code as LanguageCode);
  showLangMenu.value = false;
};

onMounted(() => {
  startCategorySync();
  startProductSync();
  document.addEventListener('mousedown', closeOnOutside);
});
onBeforeUnmount(() => document.removeEventListener('mousedown', closeOnOutside));
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16 pt-16 md:pb-0 md:pt-0" :dir="direction">
    <ToastHost />

    <header class="fixed left-0 right-0 top-0 z-50 hidden bg-white shadow-sm md:block">
      <div class="border-b border-gray-100">
        <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div class="flex items-center gap-8">
            <RouterLink to="/" class="text-xl font-bold tracking-wider text-gray-900" @click="scrollTop">
              SHOE<span class="text-blue-600">FACTORY</span>
            </RouterLink>
            <nav class="flex gap-1" :dir="direction">
              <RouterLink to="/" class="rounded-md px-4 py-2 text-sm font-medium transition-colors" :class="route.path === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'" @click="scrollTop">
                {{ t('nav.home') }}
              </RouterLink>
              <RouterLink :to="firstCategoryPath" class="rounded-md px-4 py-2 text-sm font-medium transition-colors" :class="isProductsTabActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'" @click="scrollTop">
                {{ t('nav.products') }}
              </RouterLink>
              <RouterLink to="/contact" class="rounded-md px-4 py-2 text-sm font-medium transition-colors" :class="route.path === '/contact' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'" @click="scrollTop">
                {{ t('nav.contact') }}
              </RouterLink>
            </nav>
          </div>

          <div ref="dropdownRef" class="relative">
            <button class="flex items-center rounded-full bg-gray-50 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900" @click="showLangMenu = !showLangMenu">
              <Globe class="mr-1.5 h-4 w-4" />
              <span class="mr-1">{{ languages[lang] }}</span>
              <ChevronDown class="h-3.5 w-3.5" />
            </button>

            <div v-if="showLangMenu" class="absolute right-0 top-full z-50 mt-1 w-32 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
              <button
                v-for="(name, code) in languages"
                :key="code"
                class="w-full px-4 py-2 text-left text-sm transition-colors"
                :class="lang === code ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-700 hover:bg-gray-50'"
                @click="chooseLanguage(code)"
              >
                {{ name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isContactPage" class="no-scrollbar mx-auto flex h-12 max-w-7xl items-center gap-6 overflow-x-auto px-6" :dir="direction">
        <RouterLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?category=${cat.id}`"
          class="relative flex h-full items-center whitespace-nowrap text-sm transition-colors"
          :class="currentCategory === cat.id ? 'font-medium text-blue-600' : 'text-gray-600 hover:text-blue-600'"
          @click="scrollTop"
        >
          {{ getCategoryName(cat.id) }}
          <span v-if="currentCategory === cat.id" class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-sm bg-blue-600" />
        </RouterLink>
      </div>
    </header>

    <header class="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
      <RouterLink to="/" class="flex items-center text-lg font-bold leading-none text-gray-900" @click="scrollTop">
        SHOE<span class="text-blue-600">FACTORY</span>
      </RouterLink>
      <div class="flex items-center gap-2">
        <select :value="lang" class="relative rounded-full border-0 bg-gray-100 py-1.5 pl-3 pr-6 text-xs text-gray-700 outline-none" @change="chooseLanguage(($event.target as HTMLSelectElement).value)">
          <option v-for="(_, code) in languages" :key="code" :value="code">{{ String(code).toUpperCase() }}</option>
        </select>
        <RouterLink :to="firstCategoryPath" class="rounded-full p-2 text-gray-600 hover:bg-gray-100">
          <Search class="h-5 w-5" />
        </RouterLink>
      </div>
    </header>

    <main class="relative min-h-screen" :class="!isContactPage ? 'md:pt-[104px]' : 'md:pt-14'">
      <slot />
    </main>

    <nav class="pb-safe fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-200 bg-white md:hidden">
      <RouterLink to="/" class="flex flex-col items-center px-6 py-3" :class="route.path === '/' ? 'text-blue-600' : 'text-gray-500'" @click="scrollTop">
        <Home class="mb-1 h-5 w-5" />
        <span class="text-[10px] font-medium">{{ t('nav.home') }}</span>
      </RouterLink>
      <RouterLink :to="firstCategoryPath" class="flex flex-col items-center px-6 py-3" :class="isProductsTabActive ? 'text-blue-600' : 'text-gray-500'" @click="scrollTop">
        <Box class="mb-1 h-5 w-5" />
        <span class="text-[10px] font-medium">{{ t('nav.products') }}</span>
      </RouterLink>
      <RouterLink to="/contact" class="flex flex-col items-center px-6 py-3" :class="route.path === '/contact' ? 'text-blue-600' : 'text-gray-500'" @click="scrollTop">
        <Phone class="mb-1 h-5 w-5" />
        <span class="text-[10px] font-medium">{{ t('nav.contact') }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
