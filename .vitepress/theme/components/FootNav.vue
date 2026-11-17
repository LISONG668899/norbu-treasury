<script setup lang="ts">
// 页面最底部：金刚杵 + 版权，下面一条明黄色带，放 关于我们 · 收藏 · 词典 · 留言。
// 图标下方一律显示文字，任何设备都一样。
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { useI18n, localePath, rootPathOf } from '../i18n'

const route = useRoute()
const { lang, t } = useI18n()
const here = computed(() => rootPathOf(route.path))
const on = (p: string) => here.value.startsWith(p)
const link = (p: string) => withBase(localePath(lang.value, p))
</script>

<template>
  <footer class="pk-footer">
    <img class="pk-footer-icon" :src="withBase('/logo-vajra.png')" alt="" />
    <div class="pk-footer-text">© 2026 PUNDARIKA</div>
  </footer>
  <div class="pk-band pk-band-bottom" :class="`ui-${lang}`">
    <nav class="pk-nav pk-footnav" :aria-label="t('about')">
      <a class="pk-nav-btn" :class="{ on: on('/about') }" :href="link('/about/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="9" cy="7.25" r="3.25" /><path d="M2.75 20v-1.5a6.25 6.25 0 0 1 12.5 0V20ZM16 4.25a3.25 3.25 0 0 1 0 6.5M17.75 13a5.5 5.5 0 0 1 3.5 5.15V20h-3" />
        </svg>
        <span>{{ t('about') }}</span>
      </a>
      <a class="pk-nav-btn" :class="{ on: on('/saved') }" :href="link('/saved/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6.25 3.25h11.5v17.5L12 16.5l-5.75 4.25Z" />
        </svg>
        <span>{{ t('saved') }}</span>
      </a>
      <a class="pk-nav-btn" :class="{ on: on('/dictionary') }" :href="link('/dictionary/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5.25 18.25V5a2 2 0 0 1 2-2h12.5v14.5H7.25a1.75 1.75 0 0 0 0 3.5h12.5M19.75 17.5V21M8 3v14.5" />
          <path d="m10.5 13 1.6-5.5 1.6 5.5m-2.65-1.8h2.1m4.5-1.8V13m0-2.9c-.8-1.1-2.35-.6-2.35 1.05s1.55 2.15 2.35 1.05" />
        </svg>
        <span>{{ t('dictionary') }}</span>
      </a>
      <a class="pk-nav-btn" :class="{ on: on('/message') }" :href="link('/message/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m8 15 2-7 6.25-4.5 4.25 4.25L16 14l-8 1Zm0 0 5.25-5.25M10 8l6 6M3.5 20c2.3-2.3 4.4-2.6 6.2-1.4s3.1 1.55 5.2.6c1.55-.7 3.3-.9 5.6-.45" />
        </svg>
        <span>{{ t('message') }}</span>
      </a>
    </nav>
  </div>
</template>
