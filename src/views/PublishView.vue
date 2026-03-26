<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { currentUser, novels, addOrUpdateNovel } from '../store.js'

const router = useRouter()
const route = useRoute()

const form = ref({
  id: null,
  title: '',
  author: '',
  tags: '',
  summary: '',
  coverUrl: ''
})

const isSubmitting = ref(false)

onMounted(() => {
  if (!currentUser.value) {
    alert('需登入後方可落筆，將為您牽馬至客棧。')
    router.push('/login?redirect=/publish')
    return
  }
  
  // if edit mode
  if (route.query.editId) {
    const existing = novels.value.find(n => n.id === route.query.editId)
    if (existing) {
      form.value = {
        ...existing,
        tags: Array.isArray(existing.tags) ? existing.tags.join(', ') : existing.tags
      }
    }
  } else {
    form.value.author = currentUser.value
  }
})

const goBack = () => {
  if (route.query.editId) {
    router.push({ name: 'read', params: { id: route.query.editId } })
  } else {
    router.push('/')
  }
}

const submitNovel = () => {
  if (!form.value.title) {
    alert('請填寫書卷名！')
    return
  }

  isSubmitting.value = true
  
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
        author: form.value.author || currentUser.value || '佚名',
        tags: tagsArray,
        summary: form.value.summary || '暫無簡介',
        coverUrl: form.value.coverUrl || `https://picsum.photos/seed/${Date.now()}/800/600?grayscale`,
        comments: isEdit ? (novels.value.find(n => n.id === form.value.id)?.comments || []) : [],
        chapters: isEdit ? (novels.value.find(n => n.id === form.value.id)?.chapters || []) : []
      }
      
      addOrUpdateNovel(payload)
      
      alert(isEdit ? '重修入閣成功！' : '藏錄入閣成功！')
      router.push({ name: 'read', params: { id: payload.id } })
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
  <div class="max-w-3xl mx-auto py-8 lg:py-16 px-4 fade-in">
    <button 
      @click="goBack"
      class="mb-10 flex items-center gap-2 text-[#7e786d] hover:text-[#912d26] transition-all w-fit group"
    >
        <span class="text-xl group-hover:-translate-x-1 transition-transform">⟵</span>
        <span class="tracking-widest border-b border-transparent group-hover:border-[#912d26] pb-1">放棄落筆，返回前頁</span>
    </button>
    
    <article class="bg-[#fdfaf2] px-8 py-12 sm:px-16 sm:py-16 border-[3px] border-double border-[#d3ccbc] shadow-[15px_15px_30px_rgba(200,195,185,0.4)] relative">
      <header class="mb-12 text-center border-b-[2px] border-[#912d26]/20 pb-8 relative">
        <h1 class="text-4xl font-bold mb-4 text-[#2c2b29] tracking-[0.2em]">{{ form.id ? '重編書卷基本資料' : '開宗立派 (建立新書)' }}</h1>
        <p class="text-[#645e55] tracking-widest text-sm">於此定下書名大綱，系統將為其珍藏</p>
      </header>
      
      <form @submit.prevent="submitNovel" class="space-y-8">
        <div class="space-y-2">
          <label class="block text-sm font-bold text-[#7a241d] tracking-widest">書卷名 <span class="text-xs font-normal text-red-500">(必填)</span></label>
          <input v-model="form.title" type="text" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide placeholder-[#a39d8f]" placeholder="如：霜刃" required />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-[#7a241d] tracking-widest">作者筆名</label>
            <input v-model="form.author" type="text" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide placeholder-[#a39d8f]" :placeholder="currentUser || '佚名'" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-[#7a241d] tracking-widest">分類卷標 <span class="text-xs font-normal text-[#645e55]">(請以逗號分隔)</span></label>
            <input v-model="form.tags" type="text" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide placeholder-[#a39d8f]" placeholder="如：仙俠, 修真" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-[#7a241d] tracking-widest">故事楔子 <span class="text-xs font-normal text-[#645e55]">(簡介)</span></label>
          <textarea v-model="form.summary" rows="5" class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide leading-relaxed resize-none placeholder-[#a39d8f]" placeholder="故事大綱..."></textarea>
        </div>

        <div class="pt-8 border-t border-dashed border-[#d3ccbc] text-center">
          <button type="submit" :disabled="isSubmitting" class="px-12 py-4 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] transition-colors duration-300 tracking-[0.4em] font-medium text-lg disabled:opacity-50 border border-[#5e1913] shadow-[4px_4px_0_#d3ccbc] active:translate-y-1 active:shadow-none">
            {{ isSubmitting ? '正在為您裝訂...' : (form.id ? '更新書卷資訊' : '建立書卷') }}
          </button>
        </div>
      </form>
    </article>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
