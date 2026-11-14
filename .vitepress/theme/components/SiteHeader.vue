<script setup lang="ts">
// 顶部（按示意图）：搜索框 · 色调 · 语言；下面一行：莲花标志 + 本页标题
// 经文页（frontmatter text: true）：标题行换成“翻译”和“收藏”按钮，并记录阅读位置
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute, useRouter, withBase } from 'vitepress'
import { LANGS, useI18n, loadPref, setPref, localeOf, rootPathOf, localePath, type Lang } from '../i18n'
import { loadSaved, isSaved, toggleSaved, updatePos, getPos } from '../saved'
import TranslateTool from './TranslateTool.vue'

const SearchBox = defineAsyncComponent(() => import('../../components/SiteSearchBox.vue'))

const { isDark, frontmatter, page } = useData()
const route = useRoute()
const router = useRouter()
const { lang, t } = useI18n()
const showSearch = ref(false)

const isHome = computed(() => rootPathOf(route.path).replace(/index\.html$/, '') === '/')
const isText = computed(() => frontmatter.value.text === true)
const title = computed(() => String(frontmatter.value.title || page.value.title || ''))
// 语言网址的目录页：frontmatter.title 是译名，title_bo 是藏文原名
const titleBo = computed(() => String(frontmatter.value.title_bo || ''))
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

function toggleTone() { isDark.value = !isDark.value }

// 切换语言：目录页跳到对应语言的网址；经文页只换按钮语言，正文不变
function onLang(e: Event) {
  const v = (e.target as HTMLSelectElement).value as Lang
  setPref(v)
  if (isText.value) return
  router.go(withBase(localePath(v, rootPathOf(route.path))))
}
</script>

<template>
  <header class="pk-header">
    <button class="pk-searchbox" type="button" @click="showSearch = true">
      <span class="pk-search-label">{{ t('search') }}</span>
      <svg class="pk-search-ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M15 15l6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
      </svg>
    </button>

    <button class="pk-tone" type="button" :title="t('tone')" @click="toggleTone">
      <span class="pk-tone-label">{{ t('tone') }}</span>
      <svg class="ic-sun" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <circle cx="12" cy="12" r="5" fill="currentColor" />
        <g stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" />
        </g>
      </svg>
      <svg class="ic-moon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path fill="currentColor" d="M20.7 14.6A8.5 8.5 0 0 1 9.4 3.3a8.5 8.5 0 1 0 11.3 11.3z" />
      </svg>
    </button>

    <label class="pk-lang" :title="t('language')">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
        <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" fill="none" stroke="currentColor" stroke-width="1.4" />
      </svg>
      <select :aria-label="t('language')" @change="onLang">
        <option v-for="l in LANGS" :key="l.code" :value="l.code" :selected="l.code === lang">{{ l.label }}</option>
      </select>
    </label>
  </header>

  <div v-if="!isText" class="pk-titlerow" :class="{ 'is-home': isHome }">
    <a class="pk-logo" :href="homeLink" aria-label="PUNDARIKA">
      <img :src="withBase('/logo-lotus.png')" alt="PUNDARIKA" />
    </a>
    <div class="pk-title">
      <h1 class="pk-title-main" :class="{ 'is-bo': lang === 'bo' || !titleBo }">
        <template v-if="isHome">{{ title }}</template>
        <template v-else-if="lang === 'bo' || !titleBo">༼{{ title }}༽</template>
        <template v-else>{{ title }}</template>
      </h1>
      <p v-if="titleBo" class="pk-title-sub">{{ titleBo }}</p>
    </div>
  </div>

  <div v-else class="pk-textbar">
    <a class="pk-logo-sm" :href="homeLink" aria-label="PUNDARIKA">
      <img :src="withBase('/logo-lotus.png')" alt="" />
    </a>
    <div class="pk-textbar-ops">
      <TranslateTool />
      <button class="pk-save" :class="{ on: savedNow }" type="button" @click="onToggleSave">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 3h12v18l-6-4-6 4z" :fill="savedNow ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        </svg>
        <span>{{ savedNow ? t('unsave') : t('save') }}</span>
      </button>
    </div>
  </div>

  <SearchBox v-if="showSearch" @close="showSearch = false" />
</template>
