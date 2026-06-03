import { createRouter, createWebHistory } from 'vue-router';
import AdminProducts from './pages/admin/AdminProducts.vue';
import AdminCategories from './pages/admin/AdminCategories.vue';
import Login from './pages/Login.vue';
import { hasAuthToken } from './stores/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/admin/products' },
    { path: '/admin', redirect: '/admin/products' },
    { path: '/login', component: Login },
    { path: '/admin/products', component: AdminProducts, meta: { requiresAuth: true } },
    { path: '/admin/categories', component: AdminCategories, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !hasAuthToken()) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.path === '/login' && hasAuthToken()) {
    return '/admin/products';
  }
  return true;
});
