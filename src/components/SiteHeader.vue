<script setup>
import { useRouter, useRoute } from 'vue-router'
import { currentUser, logoutUser } from '../store.js'

const router = useRouter()
const route = useRoute()

const handleLogout = () => {
  logoutUser()
  if (route.meta.requiresAuth) {
    router.push('/')
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-[#f4f1e1]/90 backdrop-blur-md border-b-[3px] border-double border-[#d3ccbc] shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <router-link to="/" class="flex items-center gap-4 cursor-pointer group">
          <!-- 印章風格 Logo -->
          <div class="seal text-2xl group-hover:bg-[#912d26] group-hover:text-[#f4f1e1] transition-colors duration-500">
            文苑
          </div>
          <h1 class="text-xl tracking-[0.2em] font-bold text-[#3a4034] group-hover:text-[#912d26] transition-colors">
            私家藏書閣
          </h1>
        </router-link>
        
        <nav class="hidden md:flex gap-8 text-md font-medium text-[#645e55] items-center">
          <router-link to="/" class="hover:text-[#912d26] transition-colors" active-class="text-[#912d26] border-b border-[#912d26] pb-1" exact>藏書譜</router-link>
          <router-link to="/board" class="hover:text-[#912d26] transition-colors" active-class="text-[#912d26] border-b border-[#912d26] pb-1">客棧佈告</router-link>
          
          <router-link to="/publish" class="text-[#912d26] border border-[#912d26] px-4 py-1.5 hover:bg-[#912d26] hover:text-[#f4f1e1] transition-colors duration-300">落筆著書</router-link>
          
          <div class="flex items-center gap-4 border-l border-[#d3ccbc] pl-8">
            <template v-if="currentUser">
              <span class="tracking-widest">歡迎，<router-link to="/profile" class="text-[#912d26] font-bold hover:underline">{{ currentUser }}</router-link></span>
              <button @click="handleLogout" class="text-sm border border-[#d3ccbc] px-3 py-1 hover:bg-[#ece6d5] transition">登出</button>
            </template>
            <template v-else>
              <router-link to="/login" class="text-[#912d26] font-bold tracking-widest border border-[#912d26] px-4 py-1.5 hover:bg-[#912d26] hover:text-[#f4f1e1] transition">客棧登記 (登入)</router-link>
            </template>
          </div>
        </nav>
      </div>
    </div>
    <!-- 古風雲紋裝飾 (CSS 模擬或簡單線條) -->
    <div class="h-[2px] w-full bg-gradient-to-r from-transparent via-[#912d26]/30 to-transparent"></div>
    
    <!-- 手機版也加入「發布按鈕」與「登入」 -->
    <div class="md:hidden flex justify-between px-4 py-2 bg-[#ece6d5] border-b border-[#d3ccbc] overflow-x-auto whitespace-nowrap gap-4">
      <router-link to="/" class="text-[#645e55] tracking-widest text-sm font-bold h-full">藏書譜</router-link>
      <router-link to="/board" class="text-[#645e55] tracking-widest text-sm font-bold h-full">客棧佈告</router-link>
      
      <router-link to="/publish" class="text-[#912d26] tracking-widest text-sm font-bold h-full">
          ＋ 落筆新卷
      </router-link>
      
      <div v-if="currentUser" class="text-sm tracking-widest flex items-center gap-2 text-[#645e55] ml-auto">
        <router-link to="/profile">{{ currentUser }}</router-link>
        <button @click="handleLogout" class="border border-[#d3ccbc] px-2 text-xs">登出</button>
      </div>
      <router-link v-else to="/login" class="text-[#912d26] tracking-widest text-sm font-bold h-full ml-auto">
          登入
      </router-link>
    </div>
  </header>
</template>
