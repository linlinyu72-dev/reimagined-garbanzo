<script setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'gufeng_novels'

const novels = ref([])
const selectedNovel = ref(null)
const isPublishing = ref(false)

// 從 localStorage 取得或初始化小說列表
const fetchNovels = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      novels.value = JSON.parse(data)
    } else {
      novels.value = [
        {
          id: Date.now().toString(),
          title: '初遇',
          author: '佚名',
          tags: ['隨筆', '舊夢'],
          summary: '這是一段塵封的記憶...',
          content: '落花人獨立，微雨燕雙飛。\n\n當時明月在，曾照彩雲歸。',
          coverUrl: 'https://picsum.photos/seed/1/800/600?grayscale'
        }
      ]
      saveToStorage()
    }
  } catch (error) {
    console.error("無法取得小說資料：", error)
    novels.value = []
  }
}

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(novels.value))
}

onMounted(() => {
  fetchNovels()
})

const selectNovel = (novel) => {
  selectedNovel.value = novel
  isPublishing.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goBack = () => {
  selectedNovel.value = null
  isPublishing.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPublish = () => {
  selectedNovel.value = null
  form.value = { id: null, title: '', author: '', tags: '', summary: '', content: '', coverUrl: '' }
  isPublishing.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const editNovel = () => {
  if (!selectedNovel.value) return
  form.value = { 
    ...selectedNovel.value, 
    tags: Array.isArray(selectedNovel.value.tags) ? selectedNovel.value.tags.join(', ') : selectedNovel.value.tags 
  }
  isPublishing.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteNovel = () => {
  if (!selectedNovel.value) return
  if (!confirm(`確定要將《${selectedNovel.value.title}》付之一炬（刪除）嗎？此操作將無法復原。`)) return
  
  try {
    novels.value = novels.value.filter(n => n.id !== selectedNovel.value.id)
    saveToStorage()
    alert('已燒毀該卷宗。')
    goBack()
  } catch (error) {
    console.error(error)
    alert('操作失敗...')
  }
}

// 發布表單資料
const form = ref({
  id: null,
  title: '',
  author: '',
  tags: '',
  summary: '',
  content: '',
  coverUrl: ''
})
const isSubmitting = ref(false)

const submitNovel = () => {
  if (!form.value.title || !form.value.content) {
    alert('請至少填寫書名與正文！')
    return
  }
  isSubmitting.value = true
  
  // 模擬網路延遲
  setTimeout(() => {
    try {
      const isEdit = !!form.value.id
      let tagsArray = ['新作']
      if (form.value.tags) {
        tagsArray = form.value.tags.split(/[,、，]/).map(t => t.trim()).filter(Boolean)
      }

      const payload = {
        id: isEdit ? form.value.id : Date.now().toString(),
        title: form.value.title,
        author: form.value.author || '佚名',
        tags: tagsArray,
        summary: form.value.summary || '暫無簡介',
        content: form.value.content,
        coverUrl: form.value.coverUrl || `https://picsum.photos/seed/${Date.now()}/800/600?grayscale`
      }
      
      if (isEdit) {
        const index = novels.value.findIndex(n => n.id === payload.id)
        if (index !== -1) novels.value[index] = payload
        selectedNovel.value = payload
      } else {
        novels.value.unshift(payload)
      }
      
      saveToStorage()
      
      form.value = { id: null, title: '', author: '', tags: '', summary: '', content: '', coverUrl: '' }
      isPublishing.value = false
      alert(isEdit ? '修改成功！' : '發布成功！')
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      console.error(e)
      alert('發布失敗...')
    } finally {
      isSubmitting.value = false
    }
  }, 300)
}
</script>

<template>
  <div class="min-h-screen bg-[#f4f1e1] text-[#2c2b29] pb-20 overflow-x-hidden selection:bg-[#912d26]/20 selection:text-[#5e1913] gufeng-theme">
    
    <!-- Header (古風頂部導航) -->
    <header class="sticky top-0 z-50 bg-[#f4f1e1]/90 backdrop-blur-md border-b-[3px] border-double border-[#d3ccbc] shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <div class="flex items-center gap-4 cursor-pointer group" @click="goBack">
            <!-- 印章風格 Logo -->
            <div class="seal text-2xl group-hover:bg-[#912d26] group-hover:text-[#f4f1e1] transition-colors duration-500">
              文苑
            </div>
            <h1 class="text-xl tracking-[0.2em] font-bold text-[#3a4034] group-hover:text-[#912d26] transition-colors">
              私家藏書閣
            </h1>
          </div>
          <nav class="hidden md:flex gap-8 text-md font-medium text-[#645e55] items-center">
            <a href="#" @click.prevent="goBack" class="hover:text-[#912d26] transition-colors" :class="{'text-[#912d26] border-b border-[#912d26] pb-1': !selectedNovel && !isPublishing }">藏書譜</a>
            <a href="#" @click.prevent="goToPublish" class="text-[#912d26] border border-[#912d26] px-4 py-1.5 hover:bg-[#912d26] hover:text-[#f4f1e1] transition-colors duration-300">落筆著書 (發布)</a>
          </nav>
        </div>
      </div>
      <!-- 古風雲紋裝飾 (CSS 模擬或簡單線條) -->
      <div class="h-[2px] w-full bg-gradient-to-r from-transparent via-[#912d26]/30 to-transparent"></div>
      
      <!-- 手機版也加入「發布按鈕」 -->
      <div class="md:hidden flex justify-center py-2 bg-[#ece6d5] border-b border-[#d3ccbc]">
        <button @click="goToPublish" class="text-[#912d26] tracking-widest text-sm font-bold w-full h-full">
           ＋ 落筆著書 (發布新卷)
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <!-- 淡入淡出動畫 -->
      <transition enter-active-class="transition duration-700 ease-out" enter-from-class="opacity-0 translate-y-8" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4" mode="out-in">
        
        <!-- 書架視圖 -->
        <div v-if="!selectedNovel && !isPublishing" class="space-y-16">
          
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

          <!-- 古風卡片 Grid -->
          <div v-if="novels.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            <article 
              v-for="(novel, index) in novels" 
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
            尚無藏書，請點擊上方「落筆著書」發表第一篇作品。
          </div>
        </div>

        <!-- 發表表單視圖 (NEW) -->
        <div v-else-if="isPublishing" class="max-w-3xl mx-auto py-8 lg:py-16">
          <button 
            @click="form.id ? isPublishing = false : goBack()"
            class="mb-10 flex items-center gap-2 text-[#7e786d] hover:text-[#912d26] transition-all w-fit group"
          >
             <span class="text-xl group-hover:-translate-x-1 transition-transform">⟵</span>
             <span class="tracking-widest border-b border-transparent group-hover:border-[#912d26] pb-1">放棄落筆，返回前頁</span>
          </button>
          
          <article class="bg-[#fdfaf2] px-8 py-12 sm:px-16 sm:py-16 border-[3px] border-double border-[#d3ccbc] shadow-[15px_15px_30px_rgba(200,195,185,0.4)] relative">
            <header class="mb-12 text-center border-b-[2px] border-[#912d26]/20 pb-8 relative">
              <h1 class="text-4xl font-bold mb-4 text-[#2c2b29] tracking-[0.2em]">{{ form.id ? '重編此卷' : '落筆著書' }}</h1>
              <p class="text-[#645e55] tracking-widest text-sm">留下您的筆墨，系統將為其珍藏</p>
            </header>
            
            <form @submit.prevent="submitNovel" class="space-y-8">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-[#7a241d] tracking-widest">書卷名 <span class="text-xs font-normal text-red-500">(必填)</span></label>
                <input v-model="form.title" type="text" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide placeholder-[#a39d8f]" placeholder="如：霜刃" required />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-[#7a241d] tracking-widest">作者筆名</label>
                  <input v-model="form.author" type="text" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide placeholder-[#a39d8f]" placeholder="不填則為「佚名」" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-[#7a241d] tracking-widest">分類卷標 <span class="text-xs font-normal text-[#645e55]">(請以逗號分隔)</span></label>
                  <input v-model="form.tags" type="text" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide placeholder-[#a39d8f]" placeholder="如：仙俠, 修真" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-bold text-[#7a241d] tracking-widest">故事楔子 <span class="text-xs font-normal text-[#645e55]">(簡介)</span></label>
                <textarea v-model="form.summary" rows="3" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide leading-relaxed resize-none placeholder-[#a39d8f]" placeholder="故事大綱..."></textarea>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-bold text-[#7a241d] tracking-widest">書卷正文 <span class="text-xs font-normal text-red-500">(必填)</span></label>
                <textarea v-model="form.content" rows="15" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide leading-loose resize-y placeholder-[#a39d8f]" placeholder="請在此揮毫..." required></textarea>
              </div>

              <div class="pt-8 border-t border-dashed border-[#d3ccbc] text-center">
                <button type="submit" :disabled="isSubmitting" class="px-12 py-4 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] transition-colors duration-300 tracking-[0.4em] font-medium text-lg disabled:opacity-50 border border-[#5e1913] shadow-[4px_4px_0_#d3ccbc] active:translate-y-1 active:shadow-none">
                  {{ isSubmitting ? '正在為您裝訂...' : (form.id ? '重修入閣' : '藏錄入閣') }}
                </button>
              </div>
            </form>
          </article>
        </div>

        <!-- 閱讀視圖 (竹簡/書卷風) -->
        <div v-else-if="selectedNovel && !isPublishing" class="max-w-3xl mx-auto py-8 lg:py-16">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <button 
              @click="goBack"
              class="flex items-center gap-2 text-[#7e786d] hover:text-[#912d26] transition-all w-fit group"
            >
               <span class="text-xl group-hover:-translate-x-1 transition-transform">⟵</span>
               <span class="tracking-widest border-b border-transparent group-hover:border-[#912d26] pb-1">闔卷返回</span>
            </button>
            <div class="flex items-center gap-4">
              <button @click="editNovel" class="text-sm tracking-widest text-[#7e786d] hover:text-[#912d26] transition-colors border-b border-[#7e786d] hover:border-[#912d26] pb-1">重編此卷</button>
              <button @click="deleteNovel" class="text-sm tracking-widest text-[#912d26] hover:text-[#7a241d] transition-colors border-b border-[#912d26] hover:border-[#7a241d] pb-1 font-bold">付之一炬 (刪除)</button>
            </div>
          </div>

          <!-- 書頁本體 -->
          <article class="bg-[#fdfaf2] px-8 py-16 sm:px-16 sm:py-24 border-[3px] border-double border-[#d3ccbc] shadow-[15px_15px_30px_rgba(200,195,185,0.4)] relative">
             
            <!-- 書頁裝飾紋路 -->
            <div class="absolute left-4 top-4 bottom-4 w-[2px] bg-gradient-to-b from-transparent via-[#912d26]/20 to-transparent"></div>
            <div class="absolute right-4 top-4 bottom-4 w-[2px] bg-gradient-to-b from-transparent via-[#912d26]/20 to-transparent"></div>

            <header class="mb-20 text-center border-b-[2px] border-[#912d26]/20 pb-16 relative">
              <div class="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#912d26]"></div>
              
              <div class="flex justify-center gap-4 mb-10 text-[#7a241d] tracking-widest text-sm">
                 <span v-for="tag in selectedNovel.tags" :key="tag">
                   【 {{ tag }} 】
                 </span>
              </div>
              <h1 class="text-5xl sm:text-6xl font-bold mb-10 text-[#2c2b29] tracking-[0.2em] leading-normal vertical-border">
                {{ selectedNovel.title }}
              </h1>
              <div class="flex items-center justify-center gap-4 text-[#645e55]">
                <span class="seal p-1 px-2 border-2 border-[#912d26] font-bold text-[#912d26] rotate-[-5deg]">
                   著
                </span>
                <p class="tracking-[0.3em] ml-2 text-lg">{{ selectedNovel.author }}</p>
              </div>
            </header>

            <div class="prose prose-lg sm:prose-xl max-w-none text-justify content-area">
              <p v-for="(paragraph, index) in selectedNovel.content.split('\n\n')" :key="index" class="text-[#3a3732] leading-[2.5] tracking-wide mb-10 text-lg sm:text-xl">
                 <span v-if="index === 0" class="float-left text-6xl text-[#912d26] font-bold mr-4 mt-2 pr-2 border-r border-[#912d26]/30">
                   {{ paragraph.charAt(0) }}
                 </span>
                 <span v-if="index === 0">{{ paragraph.slice(1) }}</span>
                 <span v-else>{{ paragraph }}</span>
              </p>
            </div>

            <div class="mt-24 pt-10 border-t border-dashed border-[#d3ccbc] flex flex-col sm:flex-row items-center justify-between gap-6">
              <span class="text-[#7e786d] text-sm tracking-widest">（ 卷首 ）</span>
              <button class="px-10 py-3 bg-transparent border border-[#912d26] text-[#912d26] hover:bg-[#912d26] hover:text-[#f4f1e1] transition-colors duration-300 tracking-[0.3em] font-medium">
                翻閱下頁
              </button>
            </div>
          </article>
        </div>
      </transition>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500;700;900&display=swap');

.gufeng-theme {
  font-family: 'Noto Serif TC', "PMingLiU", serif;
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

/* 讓段落首行縮排，古書感更重 */
.content-area p {
  text-indent: 0;
}
.content-area p:not(:first-child) {
  text-indent: 2em; /* 兩字縮排 */
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
