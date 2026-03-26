<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, boardComments, fetchBoardComments, addBoardComment } from '../store.js'

const router = useRouter()
const newComment = ref('')

onMounted(() => {
  fetchBoardComments()
})

const submitComment = () => {
  if (!newComment.value.trim() || !currentUser.value) return
  
  const comment = {
    id: Date.now().toString(),
    author: currentUser.value,
    text: newComment.value.trim(),
    date: new Date().toLocaleString('zh-TW')
  }
  
  addBoardComment(comment)
  newComment.value = ''
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 lg:py-16 px-4 fade-in">
    <div class="bg-[#fdfaf2] px-8 py-10 sm:px-12 sm:py-16 border-[3px] border-double border-[#d3ccbc] shadow-[15px_15px_30px_rgba(200,195,185,0.4)] relative">
      <header class="mb-12 text-center border-b-[2px] border-[#912d26]/20 pb-8 relative">
        <h1 class="text-4xl font-bold mb-4 text-[#2c2b29] tracking-[0.2em]">客棧佈告欄</h1>
        <p class="text-[#645e55] tracking-widest text-sm">天下風雲出我輩，在此廣結四海良緣</p>
      </header>
      
      <!-- 發表留言 -->
      <div class="mb-12 p-6 bg-[#ece6d5] border border-[#d3ccbc] shadow-inner">
        <div v-if="!currentUser" class="flex flex-col items-center justify-center py-6 gap-4">
          <p class="text-[#645e55] tracking-widest text-lg">欲留芳名，請先入座客棧登記。</p>
          <button @click="$router.push('/login?redirect=/board')" class="px-8 py-3 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] tracking-[0.2em] transition-colors font-bold shadow-[4px_4px_0_#d3ccbc] active:translate-y-1 active:shadow-none border border-[#5e1913]">客棧登記</button>
        </div>
        <div v-else class="flex flex-col sm:flex-row gap-4">
          <div class="w-12 h-12 rounded-sm bg-[#3a4034] text-[#f4f1e1] flex items-center justify-center font-bold tracking-widest shrink-0 text-xl mx-auto sm:mx-0">
             {{ currentUser.charAt(0) }}
          </div>
          <div class="flex-1 flex flex-col gap-4">
            <textarea 
              v-model="newComment"
              rows="3" 
              placeholder="在此留下您的江湖傳言..." 
              class="w-full bg-[#fdfaf2] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-wide resize-none"
            ></textarea>
            <div class="text-right">
              <button 
                @click="submitComment"
                :disabled="!newComment.trim()"
                class="px-8 py-2 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] transition-colors tracking-[0.2em] font-medium disabled:opacity-50 border border-[#5e1913] shadow-[2px_2px_0_#d3ccbc] active:translate-y-0.5 active:shadow-none"
              >
                張貼佈告
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 留言列表 -->
      <div class="space-y-8">
        <div v-if="boardComments.length === 0" class="text-[#a39d8f] tracking-widest text-center py-10 border border-dashed border-[#d3ccbc]">
          佈告欄空空如也，快來搶下首發吧。
        </div>
        <div v-else class="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-[#912d26]/40 before:via-[#912d26]/10 before:to-transparent">
          <div v-for="comment in boardComments" :key="comment.id" class="relative pl-16 animate-fade-in-down group">
            <div class="absolute left-[20px] top-6 w-3 h-3 rounded-full bg-[#fdfaf2] border-2 border-[#912d26] group-hover:scale-125 transition-transform"></div>
            
            <div class="bg-[#ece6d5]/50 p-6 border border-[#e1dac8] hover:shadow-md transition-shadow relative">
               <div class="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#912d26]/50"></div>
               <div class="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#912d26]/50"></div>
              
              <div class="flex items-center justify-between mb-4 border-b border-[#d3ccbc]/50 pb-2">
                  <span class="text-[#912d26] font-bold tracking-[0.1em] text-lg">{{ comment.author }}</span>
                  <span class="text-[#8e887d] text-xs font-mono tracking-wider">{{ comment.date }}</span>
              </div>
              <p class="text-[#3a3732] leading-[2] tracking-wide whitespace-pre-wrap text-justify">{{ comment.text }}</p>
            </div>
          </div>
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
</style>
