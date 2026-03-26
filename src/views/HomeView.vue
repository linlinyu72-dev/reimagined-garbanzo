<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { novels } from '../store.js'

const router = useRouter()

const selectedCategory = ref('全部')
const allCategories = computed(() => {
  const tags = new Set()
  novels.value.forEach(novel => {
    if (novel.tags && Array.isArray(novel.tags)) {
      novel.tags.forEach(tag => tags.add(tag))
    }
  })
  return ['全部', ...Array.from(tags)]
})

const filteredNovels = computed(() => {
  if (selectedCategory.value === '全部') return novels.value
  return novels.value.filter(novel => novel.tags && novel.tags.includes(selectedCategory.value))
})

const selectNovel = (novel) => {
  router.push({ name: 'read', params: { id: novel.id } })
}
</script>

<template>
  <div class="space-y-16 fade-in px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 lg:py-16">
    
    <!-- Hero Banner Section -->
    <div class="text-center space-y-6 py-12 md:py-16 relative">
      <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.1em] text-[#3a4034] inline-block relative px-8 py-4 border-y border-[#d3ccbc]">
        <!-- 古風裝飾角 -->
        <span class="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#912d26]"></span>
        <span class="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#912d26]"></span>
        <span class="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#912d26]"></span>
        <span class="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#912d26]"></span>
        墨香拾遺
      </h2>
      <p class="text-[#645e55] max-w-2xl mx-auto text-lg pt-4 leading-[2.5] tracking-widest font-light">
        焚香煮茗，展卷長讀。<br class="hidden sm:block" />
        此間乃在下存放舊夢之所，看官隨意翻閱。
      </p>
    </div>

    <!-- 分類導航 -->
    <div class="flex flex-wrap justify-center gap-4 pt-4 pb-8 border-b border-dashed border-[#d3ccbc]">
      <button 
        v-for="cat in allCategories" :key="cat"
        @click="selectedCategory = cat"
        class="px-5 py-2 tracking-[0.15em] transition-all border block"
        :class="selectedCategory === cat ? 'bg-[#912d26] text-[#f4f1e1] border-[#912d26] shadow-sm' : 'bg-transparent text-[#645e55] border-[#d3ccbc] hover:border-[#912d26] hover:text-[#912d26]'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 古風卡片 Grid -->
    <div v-if="filteredNovels.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
      <article 
        v-for="novel in filteredNovels" 
        :key="novel.id"
        @click="selectNovel(novel)"
        class="group relative flex flex-col bg-[#fdfaf2] overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-500 shadow-[2px_2px_10px_rgba(100,80,60,0.05)] hover:shadow-[4px_8px_16px_rgba(100,80,60,0.1)] border border-[#e1dac8]"
      >
        <!-- 古風宣紙畫框設計 (模擬卷軸邊框) -->
        <div class="p-2 bg-[#ece6d5] border-b border-[#e1dac8]">
          <div class="aspect-[4/3] w-full relative overflow-hidden bg-[#3a4034] border border-[#d3ccbc]">
            <img :src="novel.coverUrl" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 sepia-[.3] group-hover:sepia-0 transition-all duration-[1500ms]" alt="Cover" />
          </div>
        </div>

        <!-- 內容資訊區 -->
        <div class="p-8 flex-1 flex flex-col relative">
          
          <!-- 直排書名 -->
          <div class="absolute right-6 top-8 vertical-text text-3xl font-bold tracking-[0.3em] text-[#2c2b29] group-hover:text-[#912d26] transition-colors border-l-2 border-[#912d26]/30 pl-3 min-h-[140px] max-h-[180px] overflow-hidden">
            {{ novel.title }}
          </div>

          <div class="pr-14 flex-1">
             <div class="mb-5 flex gap-2 flex-wrap text-sm text-[#912d26]">
              <span v-for="tag in novel.tags" :key="tag">
                「{{ tag }}」
              </span>
            </div>
            <p class="text-[#645e55] text-sm mb-6 line-clamp-[6] leading-[2.2] tracking-wide text-justify">
              {{ novel.summary }}
            </p>
          </div>

          <!-- 底部作者與連結 -->
          <div class="flex items-end justify-between mt-auto pt-6 border-t border-dashed border-[#d3ccbc]">
            <div class="flex items-center gap-2 text-sm text-[#7e786d]">
               <span class="seal text-xs px-1 border border-[#912d26] text-[#912d26] rotate-[-2deg]">撰</span>
               <span class="tracking-widest">{{ novel.author }}</span>
            </div>
            <span class="text-[#912d26] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-sm font-medium tracking-widest">
              展卷 ⇾
            </span>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="text-center py-20 text-[#645e55] tracking-widest border border-dashed border-[#d3ccbc] bg-[#fdfaf2]">
      {{ selectedCategory === '全部' ? '尚無藏卷，請登入後落筆著書。' : '此分類下並無藏卷。' }}
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
