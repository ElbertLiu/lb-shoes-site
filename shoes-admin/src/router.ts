import { createRouter, createWebHistory } from 'vue-router';
import { hasAuthToken } from './stores/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/admin/products' },
    { path: '/admin', redirect: '/admin/products' },
    { path: '/login', component: () => import('./pages/Login.vue') },
    { path: '/admin/products', component: () => import('./pages/admin/AdminProducts.vue'), meta: { requiresAuth: true } },
    { path: '/admin/categories', component: () => import('./pages/admin/AdminCategories.vue'), meta: { requiresAuth: true } },
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
