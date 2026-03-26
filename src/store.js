import { ref, computed } from 'vue'

const STORAGE_KEY = 'gufeng_novels'
const USER_KEY = 'gufeng_user'

// ========================
// User State
// ========================
export const currentUser = ref(localStorage.getItem(USER_KEY))

export const loginUser = (username) => {
  currentUser.value = username
  localStorage.setItem(USER_KEY, username)
}

export const logoutUser = () => {
  currentUser.value = null
  localStorage.removeItem(USER_KEY)
}

// ========================
// Novels State
// ========================
export const novels = ref([])

export const fetchNovels = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      novels.value = parsed.map(n => {
        // 向下相容機制：將舊的單篇 content 轉換為首個章節
        if (!n.chapters) {
          n.chapters = n.content ? [{ id: Date.now().toString(), title: '第一章', content: n.content, author: n.author }] : []
        }
        if (!n.coAuthors) {
          n.coAuthors = []
        }
        return n
      })
    } else {
      novels.value = [
        {
          id: Date.now().toString(),
          title: '初遇',
          author: '佚名',
          tags: ['隨筆', '舊夢'],
          summary: '這是一段塵封的記憶...',
          coAuthors: [],
          chapters: [
            { id: Date.now().toString(), title: '第一卷 初見', content: '落花人獨立，微雨燕雙飛。\n\n當時明月在，曾照彩雲歸。', author: '佚名' }
          ],
          coverUrl: 'https://picsum.photos/seed/1/800/600?grayscale',
          comments: []
        }
      ]
      saveToStorage()
    }
  } catch (error) {
    console.error("無法取得小說資料：", error)
    novels.value = []
  }
}

export const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(novels.value))
}

export const addOrUpdateNovel = (payload) => {
  const isEdit = novels.value.some(n => n.id === payload.id)
  if (isEdit) {
    const index = novels.value.findIndex(n => n.id === payload.id)
    if (index !== -1) novels.value[index] = payload
  } else {
    novels.value.unshift(payload)
  }
  saveToStorage()
}

export const deleteNovelById = (id) => {
  novels.value = novels.value.filter(n => n.id !== id)
  saveToStorage()
}

export const addOrUpdateChapter = (bookId, payload) => {
  const book = novels.value.find(n => n.id === bookId)
  if (!book) return
  if (!book.chapters) book.chapters = []
  
  const isEdit = book.chapters.some(c => c.id === payload.id)
  if (isEdit) {
    const index = book.chapters.findIndex(c => c.id === payload.id)
    if (index !== -1) book.chapters[index] = payload
  } else {
    book.chapters.push(payload)
  }
  saveToStorage()
}

export const deleteChapter = (bookId, chapterId) => {
  const book = novels.value.find(n => n.id === bookId)
  if (!book || !book.chapters) return
  book.chapters = book.chapters.filter(c => c.id !== chapterId)
  saveToStorage()
}

export const manageCoAuthor = (bookId, username, action) => {
  const book = novels.value.find(n => n.id === bookId)
  if (!book) return
  if (!book.coAuthors) book.coAuthors = []
  
  if (action === 'add') {
    if (!book.coAuthors.includes(username)) {
      book.coAuthors.push(username)
    }
  } else if (action === 'remove') {
    book.coAuthors = book.coAuthors.filter(u => u !== username)
  }
  saveToStorage()
}

// ========================
// Board Comments (全站留言)
// ========================
const BOARD_KEY = 'gufeng_board'
export const boardComments = ref([])

export const fetchBoardComments = () => {
  try {
    const data = localStorage.getItem(BOARD_KEY)
    if (data) {
      boardComments.value = JSON.parse(data)
    }
  } catch (e) {
    boardComments.value = []
  }
}

export const addBoardComment = (comment) => {
  boardComments.value.unshift(comment)
  localStorage.setItem(BOARD_KEY, JSON.stringify(boardComments.value))
}
