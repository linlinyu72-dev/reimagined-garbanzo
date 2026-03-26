<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { currentUser, novels, deleteNovelById, deleteChapter, saveToStorage, manageCoAuthor } from '../store.js'

const router = useRouter()
const route = useRoute()

const novelId = route.params.id
const selectedNovel = ref(null)
const viewMode = ref('toc') // 'toc', 'read', or 'manage'
const currentChapter = ref(null)

onMounted(() => {
  const found = novels.value.find(n => n.id === novelId)
  if (found) {
    selectedNovel.value = { ...found }
    if (!selectedNovel.value.comments) selectedNovel.value.comments = []
    if (!selectedNovel.value.chapters) selectedNovel.value.chapters = []
    if (!selectedNovel.value.coAuthors) selectedNovel.value.coAuthors = []
  } else {
    alert("查無此卷，可能已被付之一炬。")
    router.push('/')
  }
})

// === 身分判斷 ===
const isMainAuthor = computed(() => selectedNovel.value?.author === currentUser.value)
const isCoAuthor = computed(() => selectedNovel.value?.coAuthors?.includes(currentUser.value))
const canAddChapter = computed(() => isMainAuthor.value || isCoAuthor.value)

// === 書卷管理 ===
const goBackHome = () => router.push('/')
const goBackToc = () => {
  viewMode.value = 'toc'
  currentChapter.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const editNovel = () => {
  router.push({ name: 'publish', query: { editId: selectedNovel.value.id } })
}

const deleteNovel = () => {
  if (!confirm(`確定要將《${selectedNovel.value.title}》全書付之一炬（刪除）嗎？此操作無法復原。`)) return
  try {
    deleteNovelById(selectedNovel.value.id)
    alert('已燒毀該卷宗。')
    router.push('/')
  } catch (error) {
    console.error(error)
    alert('操作失敗...')
  }
}

// === 共筆管理 ===
const newCoAuthor = ref('')
const handleAddCoAuthor = () => {
  if (!newCoAuthor.value.trim()) return
  if (newCoAuthor.value.trim() === currentUser.value) {
    alert('您已是原創作者！')
    return
  }
  manageCoAuthor(novelId, newCoAuthor.value.trim(), 'add')
  selectedNovel.value.coAuthors.push(newCoAuthor.value.trim())
  newCoAuthor.value = ''
}
const handleRemoveCoAuthor = (username) => {
  manageCoAuthor(novelId, username, 'remove')
  selectedNovel.value.coAuthors = selectedNovel.value.coAuthors.filter(u => u !== username)
}

// === 章節管理 ===
const createChapter = () => router.push({ name: 'chapter-new', params: { id: novelId } })

const editChapter = (chapId) => router.push({ name: 'chapter-edit', params: { id: novelId, chapterId: chapId } })

const requestDeleteChapter = (chapId, title) => {
  if (!confirm(`確定要刪除章節《${title}》嗎？`)) return
  deleteChapter(novelId, chapId)
  selectedNovel.value.chapters = selectedNovel.value.chapters.filter(c => c.id !== chapId)
  if (viewMode.value === 'read' && currentChapter.value?.id === chapId) goBackToc()
}

const openChapter = (chap) => {
  currentChapter.value = chap
  viewMode.value = 'read'
  currentPage.value = 0
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// === 電子書分頁邏輯 ===
const currentPage = ref(0)
const charsPerPage = 800

const pages = computed(() => {
  if (!currentChapter.value || !currentChapter.value.content) return []
  const text = currentChapter.value.content
  const result = []
  let currentChunk = ""
  for (const p of text.split('\n')) {
    if ((currentChunk.length + p.length) > charsPerPage && currentChunk.length > 0) {
      result.push(currentChunk)
      currentChunk = p + '\n'
    } else {
      currentChunk += p + '\n'
    }
  }
  if (currentChunk.trim().length > 0) result.push(currentChunk)
  return result.length > 0 ? result : [""]
})

const nextPage = () => {
  if (currentPage.value < pages.value.length - 1) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// === 單書留言板 ===
const newComment = ref('')
const submitComment = () => {
  if (!newComment.value.trim() || !currentUser.value || !selectedNovel.value) return
  
  const comment = {
    id: Date.now().toString(),
    author: currentUser.value,
    text: newComment.value.trim(),
    date: new Date().toLocaleString('zh-TW')
  }
  selectedNovel.value.comments.push(comment)
  const index = novels.value.findIndex(n => n.id === selectedNovel.value.id)
  if (index !== -1) {
    novels.value[index] = selectedNovel.value
    saveToStorage()
  }
  newComment.value = ''
}
</script>

<template>
  <div v-if="selectedNovel" class="max-w-4xl mx-auto py-8 lg:py-16 px-4 fade-in">
    
    <!-- 導覽操作列 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
      <button 
        @click="viewMode === 'read' || viewMode === 'manage' ? goBackToc() : goBackHome()"
        class="flex items-center gap-2 text-[#7e786d] hover:text-[#912d26] transition-all w-fit group"
      >
          <span class="text-xl group-hover:-translate-x-1 transition-transform">⟵</span>
          <span class="tracking-widest border-b border-transparent group-hover:border-[#912d26] pb-1">
            {{ viewMode === 'read' || viewMode === 'manage' ? '闔卷返回目錄' : '返回藏書譜' }}
          </span>
      </button>
      
      <div class="flex items-center gap-4 flex-wrap mt-4 sm:mt-0" v-if="viewMode === 'toc'">
        <button v-if="isMainAuthor" @click="viewMode = 'manage'" class="text-sm tracking-widest text-[#7e786d] hover:text-[#912d26] transition-colors border-b border-[#7e786d] hover:border-[#912d26] pb-1">邀請共筆</button>
        <button v-if="isMainAuthor" @click="editNovel" class="text-sm tracking-widest text-[#7e786d] hover:text-[#912d26] transition-colors border-b border-[#7e786d] hover:border-[#912d26] pb-1">更新資訊</button>
        <button v-if="canAddChapter" @click="createChapter" class="text-sm tracking-widest text-[#912d26] hover:text-[#7a241d] transition-colors border-b border-[#912d26] hover:border-[#7a241d] pb-1 font-bold">＋ 新增章節</button>
        <button v-if="isMainAuthor" @click="deleteNovel" class="text-sm border border-[#912d26] text-[#912d26] px-2 py-0.5 hover:bg-[#912d26] hover:text-[#f4f1e1] transition-colors ml-2">焚書</button>
      </div>

      <div class="flex items-center gap-4" v-if="(isMainAuthor || currentChapter?.author === currentUser) && viewMode === 'read'">
        <button @click="editChapter(currentChapter.id)" class="text-sm tracking-widest text-[#7e786d] hover:text-[#912d26] transition-colors border-b border-[#7e786d] hover:border-[#912d26] pb-1">重新潤飾此章</button>
        <button @click="requestDeleteChapter(currentChapter.id, currentChapter.title)" class="text-sm border border-[#912d26] text-[#912d26] px-2 py-0.5 hover:bg-[#912d26] hover:text-[#f4f1e1] transition-colors">刪除此章</button>
      </div>
    </div>

    <!-- 共筆管理模式 -->
    <article v-if="viewMode === 'manage'" class="bg-[#fdfaf2] px-8 py-12 border-[3px] border-double border-[#d3ccbc] shadow-[15px_15px_30px_rgba(200,195,185,0.4)] relative mb-16 animate-fade-in-down">
      <header class="mb-8 text-center border-b-[2px] border-[#912d26]/20 pb-8 relative">
        <h2 class="text-3xl font-bold tracking-[0.2em] text-[#2c2b29]">廣納賢才 (邀請共筆)</h2>
        <p class="text-[#645e55] tracking-widest text-sm mt-4">邀請其他客棧文人與您共同編纂此卷</p>
      </header>
      
      <div class="max-w-md mx-auto space-y-8">
        <div class="flex gap-4">
          <input v-model="newCoAuthor" type="text" placeholder="請輸入欲邀請的筆名..." class="flex-1 bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-2 text-[#2c2b29] tracking-wide" />
          <button @click="handleAddCoAuthor" class="px-6 py-2 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] tracking-widest transition-colors font-medium border border-[#5e1913]">邀請</button>
        </div>
        
        <div>
          <h4 class="text-sm font-bold text-[#7a241d] tracking-widest mb-4">現有共筆名錄</h4>
          <ul v-if="selectedNovel.coAuthors.length > 0" class="space-y-4">
            <li v-for="author in selectedNovel.coAuthors" :key="author" class="flex justify-between items-center bg-[#ece6d5] px-4 py-2 border border-[#d3ccbc]">
              <span class="tracking-widest text-[#2c2b29]">{{ author }}</span>
              <button @click="handleRemoveCoAuthor(author)" class="text-[#912d26] hover:underline text-sm tracking-widest">請離</button>
            </li>
          </ul>
          <p v-else class="text-[#a39d8f] tracking-widest text-sm text-center border border-dashed border-[#d3ccbc] py-4">尚無共筆作者</p>
        </div>
      </div>
    </article>

    <!-- 目錄模式 (TOC) -->
    <article v-else-if="viewMode === 'toc'" class="bg-[#fdfaf2] px-8 py-12 sm:px-16 sm:py-16 border-[3px] border-double border-[#d3ccbc] shadow-[15px_15px_30px_rgba(200,195,185,0.4)] relative mb-16 min-h-[50vh] animate-fade-in-down">
      <header class="mb-12 text-center border-b-[2px] border-[#912d26]/20 pb-12 relative">
        <div class="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#912d26]"></div>
        
        <div class="flex justify-center gap-4 mb-6 text-[#7a241d] tracking-widest text-sm">
            <span v-for="tag in selectedNovel.tags" :key="tag">【 {{ tag }} 】</span>
        </div>
        <h1 class="text-5xl font-bold mb-8 text-[#2c2b29] tracking-[0.2em] leading-normal vertical-border">
          {{ selectedNovel.title }}
        </h1>
        <div class="flex items-center justify-center gap-4 text-[#645e55] mb-2">
          <span class="seal p-1 px-2 border-2 border-[#912d26] font-bold text-[#912d26] rotate-[-5deg]">原創</span>
          <p class="tracking-[0.3em] ml-2 text-lg">{{ selectedNovel.author }}</p>
        </div>
        <div v-if="selectedNovel.coAuthors?.length > 0" class="text-[#8e887d] text-sm tracking-widest mb-8 text-center">
          共筆協作：{{ selectedNovel.coAuthors.join('、') }}
        </div>
        <div v-else class="mb-8"></div>
        
        <p class="text-[#645e55] max-w-2xl mx-auto leading-[2] tracking-wide text-justify">
          {{ selectedNovel.summary }}
        </p>
      </header>

      <section>
        <h3 class="text-2xl font-bold tracking-[0.2em] mb-8 text-[#2c2b29] text-center border-b border-[#d3ccbc] pb-4 w-1/3 mx-auto">卷宗目錄</h3>
        <div v-if="selectedNovel.chapters.length === 0" class="text-center py-10 text-[#a39d8f] tracking-widest border border-dashed border-[#d3ccbc]">
          此卷尚無任何章節，有待提筆。
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(chap, index) in selectedNovel.chapters" 
            :key="chap.id"
            @click="openChapter(chap)"
            class="flex items-baseline justify-between p-4 border border-[#e1dac8] hover:border-[#912d26] hover:bg-[#ece6d5]/50 transition-colors cursor-pointer group relative"
          >
            <span class="text-[#912d26] font-mono text-sm tracking-widest opacity-50 block w-8 shrink-0">{{ String(index + 1).padStart(2, '0') }}.</span>
            <span class="flex-1 text-lg font-bold tracking-widest text-[#2c2b29] group-hover:text-[#912d26] truncate px-2">{{ chap.title }}</span>
            <span v-if="chap.author !== selectedNovel.author" class="text-xs text-[#a39d8f] border border-[#d3ccbc] px-1 absolute -top-2 right-4 bg-[#fdfaf2]">文/{{ chap.author }}</span>
            <span class="text-[#a39d8f] text-sm group-hover:opacity-100 opacity-0 transition-opacity tracking-widest shrink-0">展卷 ⇾</span>
          </div>
        </div>
      </section>
    </article>

    <!-- 閱讀模式 (Reading Book) -->
    <article v-else-if="viewMode === 'read' && currentChapter" class="bg-[#f0ece1] px-4 py-8 sm:px-12 sm:py-16 border-[1px] border-[#d3ccbc] shadow-[0_20px_50px_rgba(145,45,38,0.05)] relative min-h-[85vh] flex flex-col mb-16 animate-fade-in-down rounded-sm overflow-hidden">
      <!-- 書頁裝飾紋理 -->
      <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(#d3ccbc 1px, transparent 1px); background-size: 20px 20px;"></div>
      
      <header v-if="currentPage === 0" class="mb-12 text-center relative z-10">
        <div class="text-[#912d26] tracking-[0.3em] text-sm mb-4 font-bold">《 {{ selectedNovel.title }} 》</div>
        <h1 class="text-4xl sm:text-5xl font-bold mb-6 text-[#2c2b29] tracking-[0.2em] leading-relaxed font-serif">{{ currentChapter.title }}</h1>
        <div class="flex justify-center items-center gap-4">
          <div class="h-[1px] w-12 bg-[#912d26]/30"></div>
          <div class="text-[#645e55] tracking-widest text-sm font-serif">執筆：{{ currentChapter.author || selectedNovel.author }}</div>
          <div class="h-[1px] w-12 bg-[#912d26]/30"></div>
        </div>
      </header>
      
      <div v-else class="text-center text-[#912d26] opacity-70 tracking-[0.3em] font-serif text-sm mb-10 relative z-10 flex items-center justify-center gap-4">
        <div class="h-[1px] w-8 bg-[#912d26]/30"></div>
        {{ selectedNovel.title }} <span>·</span> {{ currentChapter.title }}
        <div class="h-[1px] w-8 bg-[#912d26]/30"></div>
      </div>

      <div class="flex-1 w-full mx-auto relative z-10 shadow-inner bg-[#fdfaf2] border border-[#e1dac8] p-6 sm:p-10 rounded-sm">
        <div class="w-full h-full overflow-x-auto overflow-y-hidden flex justify-end items-center custom-scrollbar" dir="rtl">
          <div class="prose max-w-none h-[50vh] sm:h-[60vh] mx-auto min-w-max" style="writing-mode: vertical-rl;">
            <p v-for="(paragraph, index) in pages[currentPage].split('\n')" :key="index" v-show="paragraph.trim()" class="text-[#2c2b29] leading-[2.2] tracking-[0.15em] ml-8 sm:ml-12 text-lg sm:text-2xl font-serif text-justify" style="text-indent: 2em; line-break: strict; min-height: 100%;">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 w-full max-w-3xl mx-auto">
        <button @click="nextPage" :disabled="currentPage === pages.length - 1" class="px-8 py-3 w-full sm:w-auto bg-[#fdfaf2] border border-[#d3ccbc] text-[#912d26] hover:border-[#912d26] hover:bg-[#912d26] hover:text-[#fdfaf2] disabled:opacity-40 disabled:hover:bg-[#fdfaf2] disabled:hover:text-[#912d26] disabled:hover:border-[#d3ccbc] shadow-sm transition-all tracking-[0.2em] font-serif disabled:cursor-not-allowed">⟵ 下一頁</button>
        <div class="flex flex-col items-center">
          <span class="text-[#7e786d] text-sm tracking-[0.2em] font-serif">第 {{ currentPage + 1 }} 頁 / 共 {{ pages.length }} 頁</span>
          <div class="w-full h-px mt-2 bg-gradient-to-r from-transparent via-[#d3ccbc] to-transparent"></div>
        </div>
        <button @click="prevPage" :disabled="currentPage === 0" class="px-8 py-3 w-full sm:w-auto bg-[#fdfaf2] border border-[#d3ccbc] text-[#912d26] hover:border-[#912d26] hover:bg-[#912d26] hover:text-[#fdfaf2] disabled:opacity-40 disabled:hover:bg-[#fdfaf2] disabled:hover:text-[#912d26] disabled:hover:border-[#d3ccbc] shadow-sm transition-all tracking-[0.2em] font-serif disabled:cursor-not-allowed">上一頁 ⟶</button>
      </div>
    </article>
    
    <!-- 書卷留言區 -->
    <div class="bg-[#fdfaf2] px-8 py-10 border border-[#d3ccbc] shadow-sm relative">
      <h3 class="text-2xl font-bold tracking-[0.2em] mb-8 text-[#2c2b29] border-b border-[#d3ccbc] pb-4 flex items-center gap-2">
        <span class="w-2 h-6 bg-[#912d26] inline-block"></span>書卷迴響
      </h3>
      <div class="space-y-6 mb-10">
        <div v-if="!selectedNovel.comments || selectedNovel.comments.length === 0" class="text-[#a39d8f] tracking-widest text-center py-6">
          暫無看官留言，來做第一位提筆的人吧。
        </div>
        <div v-else class="space-y-6">
          <div v-for="comment in selectedNovel.comments" :key="comment.id" class="bg-[#ece6d5]/50 p-4 border border-[#e1dac8] flex gap-4 animate-fade-in-down text-sm sm:text-base">
            <div class="w-10 h-10 rounded-sm bg-[#3a4034] text-[#f4f1e1] flex items-center justify-center font-bold tracking-widest shrink-0">{{ comment.author.charAt(0) }}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                  <span class="text-[#912d26] font-bold tracking-widest">{{ comment.author }}</span>
                  <span class="text-[#a39d8f] text-xs font-mono">{{ comment.date }}</span>
              </div>
                <p class="text-[#645e55] leading-relaxed tracking-wide whitespace-pre-wrap">{{ comment.text }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="p-4 bg-[#ece6d5] border border-[#d3ccbc]">
        <div v-if="!currentUser" class="flex flex-col items-center justify-center py-6 gap-4">
          <p class="text-[#645e55] tracking-widest">請先客棧登記(登入)後方可留下筆墨。</p>
          <button @click="$router.push('/login')" class="px-6 py-2 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] tracking-[0.2em] transition-colors">前往登入</button>
        </div>
        <div v-else class="flex gap-4">
          <textarea v-model="newComment" rows="2" placeholder="留下您對此書的見解..." class="flex-1 bg-[#fdfaf2] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide resize-none"></textarea>
          <button @click="submitComment" :disabled="!newComment.trim()" class="px-6 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] transition-colors tracking-[0.2em] font-medium disabled:opacity-50 border border-[#5e1913] writing-vertical" style="writing-mode: vertical-rl;">提筆留墨</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in-down {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
.seal { display: inline-flex; border-radius: 2px; }
.content-area p { text-indent: 0; }
.content-area p:not(:first-child) { text-indent: 2em; }
.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d3ccbc; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #912d26; }
</style>
