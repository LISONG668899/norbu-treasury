<script setup lang="ts">
// 顶部：第一行 左边莲花标志 + 网站名，右边导航图标（含色调、语言）；第二行 搜索框独占一行；
// 第三行 本页标题（首页不重复显示）。经文页（text: true）：标题行换成“翻译”“收藏”按钮，并记录阅读位置。
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute, useRouter, withBase } from 'vitepress'
import { useI18n, loadPref, setPref, localeOf, rootPathOf, localePath, type Lang } from '../i18n'
import { loadSaved, isSaved, toggleSaved, updatePos, getPos } from '../saved'
import TranslateTool from './TranslateTool.vue'
import TopNav from './TopNav.vue'
import { data as pages } from '../catalog.data.mts'

const SearchBox = defineAsyncComponent(() => import('../../components/SiteSearchBox.vue'))

const { isDark, frontmatter, page } = useData()
const route = useRoute()
const router = useRouter()
const { lang, t, name } = useI18n()
const showSearch = ref(false)

const isHome = computed(() => rootPathOf(route.path).replace(/index\.html$/, '') === '/')
const isText = computed(() => frontmatter.value.text === true)
const title = computed(() => String(frontmatter.value.title || page.value.title || ''))
// 本页标题：就用上一层目录里给这一页起的名字（按钮上写什么，标题就是什么），不加任何括号装饰。
// 从第二层开始全部只用藏文，切换语言不改变；只有界面页（关于、收藏、词典、留言）随语言显示。
const parentItem = computed(() => {
  const me = rootPathOf(route.path).replace(/index\.html$/, '')
  for (const p of Object.values(pages)) {
    const hit = (p.items || []).find((x) => x.link === me)
    if (hit) return hit
  }
  return undefined
})
const isUi = computed(() => frontmatter.value.ui_page === true)
const pageTitle = computed(() => {
  if (isUi.value) return name(String(frontmatter.value.title_bo || title.value), frontmatter.value.title_i18n)
  return parentItem.value ? parentItem.value.title : String(frontmatter.value.title_bo || title.value)
})
const path = computed(() => route.path)
const homeLink = computed(() => withBase(localePath(lang.value, '/')))

const savedNow = ref(false)
function refreshSaved() { savedNow.value = isSaved(path.value) }
function onToggleSave() {
  toggleSaved(path.value, title.value)
  refreshSaved()
}

// 阅读位置：滚动时（节流）记下比例；从收藏页带 #resume 进来时回到上次位置
let timer: number | undefined
function onScroll() {
  if (!isText.value || !savedNow.value || timer) return
  timer = window.setTimeout(() => {
    timer = undefined
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (max > 0) updatePos(path.value, window.scrollY / max)
  }, 1200)
}
function resumeIfAsked() {
  if (!isText.value || location.hash !== '#resume') return
  const pos = getPos(path.value)
  const go = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: pos * max })
  }
  const fonts = (document as any).fonts
  fonts?.ready ? fonts.ready.then(go) : setTimeout(go, 300)
}

// 进入某语言网址时，记住这个语言（经文页的按钮随之显示该语言）
function rememberLocale() {
  const l = localeOf(route.path)
  if (l) setPref(l)
  else if (!isText.value) setPref('bo')
}

onMounted(() => {
  loadPref()
  rememberLocale()
  loadSaved()
  refreshSaved()
  resumeIfAsked()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
watch(path, () => { rememberLocale(); refreshSaved(); setTimeout(resumeIfAsked, 50) })

// 关掉搜索后让搜索框失去焦点（否则 iPad 上会留下焦点框）
function closeSearch() {
  showSearch.value = false
  setTimeout(() => (document.activeElement as HTMLElement | null)?.blur(), 0)
}

function toggleTone() { isDark.value = !isDark.value }

// 切换语言：目录页跳到对应语言的网址；经文页只换按钮语言，正文不变
function onLang(v: Lang) {
  setPref(v)
  if (isText.value) return
  router.go(withBase(localePath(v, rootPathOf(route.path))))
}
</script>

<template>
  <div class="pk-band pk-band-top" :class="`ui-${lang}`">
  <header class="pk-top">
    <a class="pk-brand" :href="homeLink">
      <img :src="withBase('/logo-flower.png')" alt="" />
      <span class="pk-brand-name">{{ t('siteName') }}</span>
    </a>
    <TopNav @lang="onLang" />
  </header>
  </div>

  <div class="pk-searchrow">
    <button class="pk-searchbox" type="button" @click="showSearch = true">
      <svg class="pk-search-ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8" />
        <path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <span class="pk-search-label">{{ t('search') }}</span>
    </button>
  </div>

  <div v-if="!isText && !isHome" class="pk-pagetitle">
    <h1 class="pk-title-main" :class="{ 'is-bo': /[\u0F00-\u0FFF]/.test(pageTitle) }">
      {{ pageTitle }}
    </h1>
  </div>

  <div v-if="isText" class="pk-textbar">
    <TranslateTool />
    <button class="pk-save" :class="{ on: savedNow }" type="button" @click="onToggleSave">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true">
        <path d="M6.25 3.25h11.5v17.5L12 16.5l-5.75 4.25Z" :fill="savedNow ? 'currentColor' : 'none'" />
      </svg>
      <span>{{ savedNow ? t('unsave') : t('save') }}</span>
    </button>
  </div>

  <SearchBox v-if="showSearch" @close="closeSearch" />
</template>
