<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { House, ShoppingBag, SwitchButton } from '@element-plus/icons-vue';
import { useLanguage } from '../i18n';
import { useAuth } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const { t, lang } = useLanguage();
const { username, logout } = useAuth();
const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';
const direction = computed(() => lang.value === 'ar' ? 'rtl' : 'ltr');
const menu = computed(() => [
  { name: 'Categories', path: '/admin/categories', icon: House },
  { name: t('admin.productsManagement'), path: '/admin/products', icon: ShoppingBag },
]);

const handleSelect = (path: string) => router.push(path);
const handleLogout = () => {
  logout();
  router.replace('/login');
};
</script>

<template>
  <el-container class="min-h-screen bg-[#f0f2f5]" :dir="direction">
    <el-aside width="256px" class="hidden bg-white shadow-[2px_0_8px_0_rgba(29,35,41,.05)] md:block">
      <div class="flex h-16 items-center justify-center border-b border-[#f0f0f0] text-lg font-bold text-gray-800">
        ShoeFactory Admin
      </div>
      <el-menu :default-active="route.path" class="border-r-0" @select="handleSelect">
        <el-menu-item v-for="item in menu" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="h-screen overflow-hidden">
      <el-header height="56px" class="flex items-center justify-between bg-white px-6 shadow-sm">
        <span class="text-sm text-[#606266]">{{ t('admin.system') }}</span>
        <div class="flex items-center gap-4 text-sm text-[#606266]">
          <a :href="frontendUrl" class="transition-colors hover:text-[#409eff]">{{ t('admin.goBack') }}</a>
          <span>{{ username || 'admin' }}</span>
          <el-avatar :size="32">{{ (username || 'A').slice(0, 1).toUpperCase() }}</el-avatar>
          <el-button text :icon="SwitchButton" @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main class="overflow-auto p-6">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>
