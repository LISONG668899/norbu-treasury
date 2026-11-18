// ============================================================
// 收藏（不注册、不上传）：全部存在读者自己浏览器的 localStorage 里。
// 每条：{ path, title, savedAt, pos }  pos = 上次读到的位置（0–1 的比例）
// 换手机、清除浏览器数据会丢失——这是“不收集读者信息”的代价。
// ============================================================
import { ref } from 'vue'

export interface SavedItem {
  path: string
  title: string
  savedAt: number
  pos: number
}

const KEY = 'pk-saved'
export const saved = ref<SavedItem[]>([])

export function loadSaved() {
  try {
    const raw = localStorage.getItem(KEY)
    saved.value = raw ? JSON.parse(raw) : []
  } catch {
    saved.value = []
  }
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(saved.value)) } catch {}
}

export function isSaved(path: string) {
  return saved.value.some((s) => s.path === path)
}

export function toggleSaved(path: string, title: string) {
  if (isSaved(path)) {
    saved.value = saved.value.filter((s) => s.path !== path)
  } else {
    saved.value = [{ path, title, savedAt: Date.now(), pos: 0 }, ...saved.value]
  }
  persist()
}

export function removeSaved(path: string) {
  saved.value = saved.value.filter((s) => s.path !== path)
  persist()
}

/** 记录阅读位置（只对已收藏的经文记录） */
export function updatePos(path: string, pos: number) {
  const it = saved.value.find((s) => s.path === path)
  if (!it) return
  it.pos = Math.max(0, Math.min(1, pos))
  persist()
}

export function getPos(path: string) {
  return saved.value.find((s) => s.path === path)?.pos || 0
}

// ============================================================
// 收藏的译文（选段机器翻译的结果），同样只存在本机浏览器
// 每条：{ id, path, title, source, text, lang, savedAt }
// ============================================================
export interface SavedTr {
  id: string
  path: string
  title: string
  source: string
  text: string
  lang: string
  savedAt: number
}

const TR_KEY = 'pk-saved-tr'
export const savedTr = ref<SavedTr[]>([])

export function loadSavedTr() {
  try {
    const raw = localStorage.getItem(TR_KEY)
    savedTr.value = raw ? JSON.parse(raw) : []
  } catch {
    savedTr.value = []
  }
}

function persistTr() {
  try { localStorage.setItem(TR_KEY, JSON.stringify(savedTr.value)) } catch {}
}

export const trId = (path: string, source: string, lang: string) => `${lang}|${path}|${source}`

export function isTrSaved(id: string) {
  return savedTr.value.some((s) => s.id === id)
}

export function toggleTr(item: Omit<SavedTr, 'savedAt'>) {
  if (isTrSaved(item.id)) savedTr.value = savedTr.value.filter((s) => s.id !== item.id)
  else savedTr.value = [{ ...item, savedAt: Date.now() }, ...savedTr.value]
  persistTr()
}

export function removeTr(id: string) {
  savedTr.value = savedTr.value.filter((s) => s.id !== id)
  persistTr()
}
