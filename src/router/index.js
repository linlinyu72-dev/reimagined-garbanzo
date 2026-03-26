import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('../views/PublishView.vue')
    },
    {
      path: '/read/:id',
      name: 'read',
      component: () => import('../views/ReadView.vue')
    },
    {
      path: '/book/:id/chapter/new',
      name: 'chapter-new',
      component: () => import('../views/ChapterEditView.vue')
    },
    {
      path: '/book/:id/chapter/:chapterId/edit',
      name: 'chapter-edit',
      component: () => import('../views/ChapterEditView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/board',
      name: 'board',
      component: () => import('../views/BoardView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router
