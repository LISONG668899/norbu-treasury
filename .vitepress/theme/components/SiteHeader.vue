<script setup lang="ts">
// 全站顶部栏（按首页示意图）：标志 · 全文搜索 · 色调切换 · 关于我们
// 内页额外显示“返回上一层”，方便在四层目录间往返。
import { computed, defineAsyncComponent, ref } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'

const SearchBox = defineAsyncComponent(() => import('../../components/SiteSearchBox.vue'))

const { isDark } = useData()
const route = useRoute()
const showSearch = ref(false)

const path = computed(() => decodeURIComponent(route.path).replace(/index\.html$/, ''))
const isHome = computed(() => path.value === '/')
const parent = computed(() => {
  const p = path.value.replace(/\.html$/, '').replace(/\/$/, '')
  const up = p.slice(0, p.lastIndexOf('/') + 1)
  return up || '/'
})

function toggleTone() {
  isDark.value = !isDark.value
}
</script>

<template>
  <header class="rz-header">
    <a class="rz-logo" :href="withBase('/')" aria-label="མ་ངོས།">
      <img :src="withBase('/logo.png')" alt="" />
    </a>

    <button class="rz-btn rz-search" type="button" @click="showSearch = true">
      <span class="tib">དཔེ་ཆ་འཚོལ་བ།</span>
    </button>

    <button
      class="rz-btn rz-tone"
      type="button"
      aria-label="མདོག་བསྒྱུར།"
      title="མདོག་བསྒྱུར།"
      @click="toggleTone"
    >
      <svg class="ic-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="currentColor" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5 1 3h-2l1-3zm0 20-1-3h2l-1 3zM2 12l3-1v2l-3-1zm20 0-3 1v-2l3 1zM4.9 4.9l2.8 1.4-1.4 1.4-1.4-2.8zm14.2 14.2-2.8-1.4 1.4-1.4 1.4 2.8zM4.9 19.1l1.4-2.8 1.4 1.4-2.8 1.4zM19.1 4.9l-1.4 2.8-1.4-1.4 2.8-1.4z"/>
      </svg>
      <svg class="ic-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path fill="currentColor" d="M20.7 14.6A8.5 8.5 0 0 1 9.4 3.3a8.5 8.5 0 1 0 11.3 11.3z"/>
      </svg>
      <span class="tib">མདོག་བསྒྱུར།</span>
    </button>

    <a class="rz-btn rz-about" :href="withBase('/about/')">
      <span class="tib">ང་ཚོའི་སྐོར།</span>
    </a>
  </header>

  <nav v-if="!isHome" class="rz-crumb">
    <a :href="withBase(parent)">‹ ཕྱིར་ལོག</a>
  </nav>

  <SearchBox v-if="showSearch" @close="showSearch = false" />
</template>
