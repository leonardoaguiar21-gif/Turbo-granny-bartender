import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

// -------------------- Routes --------------------
// Add new pages here. Each route maps a URL path to a Vue component.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./pages/HomePage.vue'),
    },
    // Add more routes below:
    // { path: '/items', component: () => import('./pages/ItemsPage.vue') },
  ],
})

createApp(App).use(router).mount('#app')