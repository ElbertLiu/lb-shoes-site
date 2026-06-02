import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import ProductList from './pages/ProductList.vue';
import ProductDetail from './pages/ProductDetail.vue';
import Contact from './pages/Contact.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/products', component: ProductList },
    { path: '/product/:id', component: ProductDetail },
    { path: '/contact', component: Contact },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
