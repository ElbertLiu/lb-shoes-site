import { createRouter, createWebHistory } from 'vue-router';
import AdminProducts from './pages/admin/AdminProducts.vue';
import AdminCategories from './pages/admin/AdminCategories.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/admin/products' },
    { path: '/admin', redirect: '/admin/products' },
    { path: '/admin/products', component: AdminProducts },
    { path: '/admin/categories', component: AdminCategories },
  ],
});
