<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, logoutUser, novels, deleteNovelById } from '../store.js'

const router = useRouter()

onMounted(() => {
  if (!currentUser.value) {
    router.push('/login')
  }
})

const handleLogout = () => {
  logoutUser()
  router.push('/')
}

const myNovels = computed(() => {
  if (!currentUser.value) return []
  return novels.value.filter(n => 
    n.author === currentUser.value || 
    n.coAuthors?.includes(currentUser.value)
  )
})

const editNovel = (id) => {
  router.push({ name: 'publish', query: { editId: id } })
}

const readNovel = (id) => {
  router.push({ name: 'read', params: { id } })
}

const deleteNovel = (novel) => {
  if (!confirm(`確定要將《${novel.title}》付之一炬（刪除）嗎？`)) return
  deleteNovelById(novel.id)
}
</script>

<template>
  <div v-if="currentUser" class="max-w-5xl mx-auto py-8 lg:py-16 px-4 fade-in">
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      <!-- 左側：會員資訊 -->
      <aside class="col-span-1 border-[3px] border-double border-[#d3ccbc] p-8 bg-[#fdfaf2] shadow-sm relative self-start">
        <div class="text-center mb-6">
          <div class="w-20 h-20 mx-auto rounded-full bg-[#3a4034] text-[#f4f1e1] flex items-center justify-center font-bold tracking-[0.2em] text-3xl mb-4 border-4 border-[#ece6d5] shadow-inner">
             {{ currentUser.charAt(0) }}
          </div>
          <h2 class="text-2xl font-bold tracking-[0.2em] text-[#2c2b29] mb-1">{{ currentUser }}</h2>
          <p class="text-xs text-[#912d26] tracking-widest seal border border-[#912d26] px-2 py-0.5 mt-2">身份：客棧駐客</p>
        </div>
        
        <div class="pt-6 border-t border-dashed border-[#d3ccbc]">
          <div class="flex justify-between items-center text-[#645e55] tracking-widest text-sm mb-4">
            <span>已著叢書</span>
            <span class="font-bold text-[#912d26] text-lg">{{ myNovels.length }}</span>
          </div>
        </div>

        <div class="pt-6 mt-6 border-t border-dashed border-[#d3ccbc] flex justify-center">
          <button @click="handleLogout" class="px-6 py-2 border border-[#912d26] text-[#912d26] hover:bg-[#912d26] hover:text-[#f4f1e1] transition-colors tracking-[0.2em] text-sm font-bold w-full">整理行囊 (登出)</button>
        </div>
      </aside>

      <!-- 右側：我的作品 -->
      <main class="col-span-1 lg:col-span-3">
        <h3 class="text-2xl font-bold tracking-[0.2em] mb-6 text-[#2c2b29] border-b-[2px] border-[#912d26]/20 pb-4 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-[#912d26] inline-block"></span>我的私家藏書
        </h3>

        <div v-if="myNovels.length === 0" class="bg-[#fdfaf2] border border-[#d3ccbc] p-12 text-center text-[#645e55] tracking-widest">
           尚未有任何著作落筆，何不現在去<router-link to="/publish" class="text-[#912d26] underline mx-1">落筆著書</router-link>？
        </div>

        <div v-else class="space-y-6">
          <div v-for="novel in myNovels" :key="novel.id" class="bg-[#fdfaf2] border border-[#d3ccbc] p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
            <div class="w-full sm:w-32 h-40 bg-[#3a4034] shrink-0 overflow-hidden cursor-pointer" @click="readNovel(novel.id)">
               <img :src="novel.coverUrl" class="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
            </div>
            
            <div class="flex-1 flex flex-col">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <h4 class="text-2xl font-bold tracking-widest text-[#2c2b29] hover:text-[#912d26] cursor-pointer" @click="readNovel(novel.id)">{{ novel.title }}</h4>
                  <span v-if="novel.author !== currentUser.value" class="text-[10px] seal border border-[#a39d8f] text-[#a39d8f] px-1 py-0.5 whitespace-nowrap">客座共筆</span>
                </div>
                <div class="flex items-center gap-3">
                  <button v-if="novel.author === currentUser.value" @click="editNovel(novel.id)" class="text-sm border border-[#7e786d] text-[#7e786d] px-3 py-1 hover:bg-[#ece6d5] transition-colors">編</button>
                  <button v-if="novel.author === currentUser.value" @click="deleteNovel(novel)" class="text-sm border border-[#912d26] text-[#912d26] px-3 py-1 hover:bg-[#912d26] hover:text-[#f4f1e1] transition-colors">焚</button>
                </div>
              </div>
              
              <div class="flex gap-2 flex-wrap text-xs text-[#912d26] mb-4">
                <span v-for="tag in novel.tags" :key="tag">「{{ tag }}」</span>
              </div>
              
              <p class="text-[#645e55] text-sm line-clamp-2 leading-relaxed tracking-wide mt-auto text-justify">
                {{ novel.summary }}
              </p>
            </div>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
.seal { display: inline-flex; border-radius: 2px; }
</style>
