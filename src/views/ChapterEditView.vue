<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { currentUser, novels, addOrUpdateChapter } from '../store.js'

const router = useRouter()
const route = useRoute()

const bookId = route.params.id
const chapterId = route.params.chapterId // for edit mode
const book = ref(null)

const form = ref({
  id: null,
  title: '',
  content: ''
})

const isSubmitting = ref(false)

onMounted(() => {
  if (!currentUser.value) {
    alert('需登入後方可落筆，將為您牽馬至客棧。')
    router.push('/login?redirect=' + route.fullPath)
    return
  }

  const foundBook = novels.value.find(n => n.id === bookId)
  if (!foundBook) {
    alert('查無此書卷，可能已被焚毀。')
    router.push('/')
    return
  }
  
  if (foundBook.author !== currentUser.value && !foundBook.coAuthors?.includes(currentUser.value)) {
    alert('此卷非您所撰，無權續寫！')
    router.push(`/read/${bookId}`)
    return
  }
  
  book.value = foundBook

  if (chapterId) {
    const existingChapter = book.value.chapters?.find(c => c.id === chapterId)
    if (existingChapter) {
      if (foundBook.author !== currentUser.value && existingChapter.author !== currentUser.value) {
         alert('您無權重修他人所撰的篇章！')
         router.push(`/read/${bookId}`)
         return
      }
      form.value = { ...existingChapter }
    } else {
      alert('查無此章節！')
      router.push(`/read/${bookId}`)
    }
  }
})

const goBack = () => {
  router.push(`/read/${bookId}`)
}

const submitChapter = () => {
  if (!form.value.title || !form.value.content) {
    alert('請填妥章節名稱與正文內容！')
    return
  }

  isSubmitting.value = true
  
  setTimeout(() => {
    try {
      const isEdit = !!form.value.id
      const payload = {
        id: isEdit ? form.value.id : Date.now().toString(),
        title: form.value.title,
        content: form.value.content,
        author: isEdit ? form.value.author : currentUser.value
      }
      
      addOrUpdateChapter(bookId, payload)
      
      alert(isEdit ? '已重新潤飾此章！' : '新章節已落筆！')
      router.push({ name: 'read', params: { id: bookId } })
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
  <div v-if="book" class="max-w-3xl mx-auto py-8 lg:py-16 px-4 fade-in">
    <button 
      @click="goBack"
      class="mb-10 flex items-center gap-2 text-[#7e786d] hover:text-[#912d26] transition-all w-fit group"
    >
        <span class="text-xl group-hover:-translate-x-1 transition-transform">⟵</span>
        <span class="tracking-widest border-b border-transparent group-hover:border-[#912d26] pb-1">返回目錄</span>
    </button>
    
    <article class="bg-[#fdfaf2] px-8 py-12 sm:px-16 sm:py-16 border-[3px] border-double border-[#d3ccbc] shadow-[15px_15px_30px_rgba(200,195,185,0.4)] relative">
      <header class="mb-12 text-center border-b-[2px] border-[#912d26]/20 pb-8 relative">
        <div class="text-[#7a241d] tracking-widest text-sm mb-4">《 {{ book.title }} 》</div>
        <h1 class="text-4xl font-bold mb-4 text-[#2c2b29] tracking-[0.2em]">{{ form.id ? '重新潤飾' : '撰寫新章' }}</h1>
        <p class="text-[#645e55] tracking-widest text-sm">輕拂素箋，題下新篇</p>
      </header>
      
      <form @submit.prevent="submitChapter" class="space-y-8">
        <div class="space-y-2">
          <label class="block text-sm font-bold text-[#7a241d] tracking-widest">章節名稱 <span class="text-xs font-normal text-red-500">(必填)</span></label>
          <input v-model="form.title" type="text" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide placeholder-[#a39d8f]" placeholder="如：第一卷 風起" required />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-[#7a241d] tracking-widest">章節正文 <span class="text-xs font-normal text-red-500">(必填)</span></label>
          <textarea v-model="form.content" rows="15" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide leading-loose resize-y placeholder-[#a39d8f]" placeholder="請在此揮毫..." required></textarea>
        </div>

        <div class="pt-8 border-t border-dashed border-[#d3ccbc] text-center">
          <button type="submit" :disabled="isSubmitting" class="px-12 py-4 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] transition-colors duration-300 tracking-[0.4em] font-medium text-lg disabled:opacity-50 border border-[#5e1913] shadow-[4px_4px_0_#d3ccbc] active:translate-y-1 active:shadow-none">
            {{ isSubmitting ? '正在為您裝訂...' : (form.id ? '重修入卷' : '加入書卷') }}
          </button>
        </div>
      </form>
    </article>
  </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
