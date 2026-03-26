<script setup>
import { onMounted } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import { fetchNovels, fetchBoardComments } from './store.js'

onMounted(() => {
  fetchNovels()
  fetchBoardComments()
})
</script>

<template>
  <div class="min-h-screen bg-[#f4f1e1] text-[#2c2b29] pb-20 overflow-x-hidden selection:bg-[#912d26]/20 selection:text-[#5e1913] gufeng-theme relative">
    
    <!-- 導航列 -->
    <SiteHeader />

    <!-- 頁面路由區 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <router-view v-slot="{ Component }">
        <transition 
          enter-active-class="transition duration-700 ease-out" 
          enter-from-class="opacity-0 translate-y-8" 
          enter-to-class="opacity-100 translate-y-0" 
          leave-active-class="transition duration-300 ease-in" 
          leave-from-class="opacity-100 translate-y-0" 
          leave-to-class="opacity-0 -translate-y-4" 
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@300;400;700&display=swap');

.gufeng-theme {
  font-family: 'LXGW WenKai TC', 'Kaiti TC', 'BiauKai', 'Kaiti SC', 'STKaiti', serif;
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.1em;
}

.seal {
  display: inline-flex;
  border-radius: 2px;
}

/* 簡單的宣紙背景紋理模擬 */
.gufeng-theme::before {
  content: "";
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

main, header {
  position: relative;
  z-index: 10;
}
</style>
