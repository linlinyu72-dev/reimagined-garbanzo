<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loginUser } from '../store.js'

const router = useRouter()
const route = useRoute()

const isRegisterMode = ref(false)
const username = ref('')
const password = ref('')
const errorMsg = ref('')

const handleSubmit = () => {
  errorMsg.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '請填寫筆名與暗號！'
    return
  }

  const ACCOUNTS_KEY = 'gufeng_accounts'
  let accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}')

  if (isRegisterMode.value) {
    if (accounts[username.value]) {
      errorMsg.value = '此筆名已有墨客使用，請另尋佳名。'
      return
    }
    accounts[username.value] = password.value
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    alert('客棧登記成功！將自動為您入座。')
  } else {
    // Login Mode
    if (!accounts[username.value]) {
      // 若帳號不存在，為求方便體驗，提示去註冊
      errorMsg.value = '查無此筆名，是否尚未登記？'
      return
    }
    if (accounts[username.value] !== password.value) {
      errorMsg.value = '暗號有誤，請再試一次。'
      return
    }
  }

  // 成功登入
  loginUser(username.value)
  const redirectPath = route.query.redirect || '/'
  router.push(redirectPath)
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 fade-in">
    <div class="bg-[#fdfaf2] p-8 md:p-12 border-[3px] border-double border-[#d3ccbc] shadow-[10px_10px_20px_rgba(100,80,60,0.1)] w-full max-w-md relative overflow-hidden">
      <!-- 裝飾 -->
      <div class="absolute -top-16 -right-16 w-32 h-32 bg-[#912d26]/5 rounded-full blur-2xl"></div>
      
      <h2 class="text-3xl font-bold tracking-[0.2em] mb-2 text-center text-[#2c2b29]">
        {{ isRegisterMode ? '初來乍到，請賜芳名' : '客棧登記' }}
      </h2>
      <p class="text-center text-[#645e55] tracking-widest text-sm mb-8 border-b border-[#912d26]/20 pb-6">
        {{ isRegisterMode ? '為自己選個筆名與暗號吧' : '請輸入您的筆名與暗號以入座' }}
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-bold text-[#7a241d] tracking-widest mb-2">筆名</label>
          <input 
            v-model="username" 
            type="text" 
            class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-widest text-center" 
            placeholder="輸入筆名..." 
            required
            autofocus
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-[#7a241d] tracking-widest mb-2">暗號 (密碼)</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full bg-[#ece6d5] border border-[#d3ccbc] focus:border-[#912d26] outline-none px-4 py-3 text-[#2c2b29] tracking-widest text-center font-sans tracking-[0.3em]" 
            placeholder="••••••" 
            required
          />
        </div>

        <p v-if="errorMsg" class="text-red-600 text-sm tracking-widest text-center">{{ errorMsg }}</p>

        <button type="submit" class="w-full py-4 bg-[#912d26] text-[#f4f1e1] hover:bg-[#7a241d] transition-colors tracking-[0.3em] font-medium text-lg border border-[#5e1913] shadow-[4px_4px_0_#d3ccbc] active:translate-y-1 active:shadow-none mt-4">
          {{ isRegisterMode ? '確認登記' : '入座客棧' }}
        </button>
      </form>

      <div class="mt-8 text-center text-sm text-[#645e55] tracking-widest">
        <span v-if="isRegisterMode">已是客棧常客？</span>
        <span v-else>初次造訪本客棧？</span>
        <button @click="isRegisterMode = !isRegisterMode; errorMsg = ''" class="ml-2 border-b border-[#912d26] text-[#912d26] hover:text-[#7a241d] pb-0.5">
          {{ isRegisterMode ? '前去入座' : '立即登記' }}
        </button>
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
