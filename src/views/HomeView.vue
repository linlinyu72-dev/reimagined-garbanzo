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

    <!-- 古籍書架 Grid -->
    <div v-if="filteredNovels.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-10">
      <article 
        v-for="novel in filteredNovels" 
        :key="novel.id"
        @click="selectNovel(novel)"
        class="group flex flex-col items-center cursor-pointer w-full"
      >
        <!-- 實體書本體 (2:3 比例，傳統線裝書外觀) -->
        <div class="relative w-full aspect-[2/3] bg-[#e4dcc7] rounded-l-sm rounded-r-lg shadow-[4px_4px_15px_rgba(0,0,0,0.1)] group-hover:shadow-[8px_15px_25px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 transition-all duration-500 border border-[#d3ccbc] overflow-hidden">
          
          <!-- 封面圖片 (做為書皮底圖) -->
          <img :src="novel.coverUrl" v-if="novel.coverUrl" class="absolute inset-0 w-full h-full object-cover opacity-60 sepia-[0.3] group-hover:opacity-80 transition-opacity duration-500" />
          
          <!-- 紋理遮罩 (讓封面具備古樸質感) -->
          <div class="absolute inset-0 bg-gradient-to-br from-[#fdfaf2]/90 via-[#fdfaf2]/60 to-[#d3ccbc]/80 mix-blend-multiply pointer-events-none"></div>

          <!-- 線裝書縫線 (右側 binding) -->
          <div class="absolute top-0 right-0 bottom-0 w-8 sm:w-10 border-l border-[#2c2b29]/10 bg-gradient-to-l from-black/20 via-black/5 to-transparent flex flex-col justify-between items-center py-6 sm:py-8 z-10 pointer-events-none">
            <div class="relative w-full h-full">
              <!-- 垂直主線 -->
              <div class="absolute right-[30%] sm:right-3 top-0 bottom-0 w-[1px] bg-[#3a4034]/40 shadow-sm"></div> 
              <!-- 綁線點 -->
              <div class="absolute right-[20%] sm:right-2 top-[10%] w-3 sm:w-4 h-[2px] bg-[#3a4034]/60 shadow-sm transform -rotate-2"></div>
              <div class="absolute right-[20%] sm:right-2 top-[35%] w-3 sm:w-4 h-[2px] bg-[#3a4034]/60 shadow-sm transform -rotate-2"></div>
              <div class="absolute right-[20%] sm:right-2 top-[60%] w-3 sm:w-4 h-[2px] bg-[#3a4034]/60 shadow-sm transform -rotate-2"></div>
              <div class="absolute right-[20%] sm:right-2 top-[85%] w-3 sm:w-4 h-[2px] bg-[#3a4034]/60 shadow-sm transform -rotate-2"></div>
              <!-- 書脊高光 -->
              <div class="absolute right-0 top-0 bottom-0 w-[2px] bg-white/40 mix-blend-overlay"></div>
            </div>
          </div>

          <!-- 書名標籤 (書簽箋) -->
          <div class="absolute top-[8%] right-10 sm:right-14 bottom-[15%] bg-[#fdfaf2] border border-[#2c2b29]/30 w-10 sm:w-12 flex justify-center py-4 sm:py-6 shadow-md group-hover:bg-[#fffdf7] group-hover:border-[#912d26]/50 transition-colors z-20">
            <!-- 內框線 -->
            <div class="absolute inset-[3px] border border-[#912d26]/20 pointer-events-none"></div>
            <h3 class="text-xl sm:text-2xl font-bold font-serif tracking-[0.3em] text-[#2c2b29] group-hover:text-[#912d26] transition-colors leading-loose" style="writing-mode: vertical-rl; max-height: 100%; overflow: hidden;">
              {{ novel.title }}
            </h3>
          </div>

          <!-- 作者 (左下角) -->
          <div class="absolute bottom-6 sm:bottom-8 left-4 sm:left-6 text-[#2c2b29] flex flex-col items-center z-20">
            <span class="text-[10px] sm:text-xs bg-[#7a241d] text-[#fdfaf2] py-1 px-0.5 border border-[#5e1913] mb-1.5 leading-none shadow-sm" style="writing-mode: vertical-rl;">撰</span>
            <span class="text-sm sm:text-base font-serif tracking-[0.2em] font-medium" style="writing-mode: vertical-rl;">{{ novel.author }}</span>
          </div>
        </div>

        <!-- 書本下方資訊 (標籤與簡介) -->
        <div class="w-full mt-4 sm:mt-6 text-center px-1">
          <div class="flex justify-center flex-wrap gap-1.5 mb-2 sm:mb-3">
            <span v-for="tag in novel.tags" :key="tag" class="text-[10px] sm:text-xs text-[#912d26] border border-[#912d26]/30 px-1.5 py-0.5 bg-[#912d26]/5 rounded-sm font-serif">
              {{ tag }}
            </span>
          </div>
          <p class="text-[#645e55] text-xs sm:text-sm line-clamp-2 leading-[1.8] tracking-widest font-serif">
            {{ novel.summary }}
          </p>
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
