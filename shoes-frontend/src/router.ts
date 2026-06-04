import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/products', component: () => import('./pages/ProductList.vue') },
    { path: '/product/:id', component: () => import('./pages/ProductDetail.vue') },
    { path: '/contact', component: () => import('./pages/Contact.vue') },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
