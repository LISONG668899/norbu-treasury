<script setup lang="ts">
// 目录：内容写在各页 frontmatter 的 catalog 里，不必改代码。
//
//   catalog:
//     style: list     # list = 首页长条；grid = 两列按钮；shrine = 经龛（函号）
//     items:
//       - title: ཀུན་མཁྱེན་བཀའ་འབུམ།
//         link: /gsung-bum/kun-mkhyen/
//         i18n: { zh: 遍知全集, zht: 遍知全集, en: Collected Works of the Omniscient }
//       - title: ཀ              # 没有 link 的项目显示为灰色、暂不可点
//
// 新增一项只要加一行；某函内容做好后补上 link 即可。
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { useI18n } from '../i18n'

interface Item { title: string; link?: string; i18n?: Record<string, string> }

const { frontmatter } = useData()
const { lang, t, tr } = useI18n()
const cat = computed(() => frontmatter.value.catalog || {})
const items = computed<Item[]>(() => cat.value.items || [])
const style = computed(() => cat.value.style || 'list')
</script>

<template>
  <div class="pk-catalog" :class="`is-${style}`">
    <p v-if="!items.length" class="pk-empty">{{ t('empty') }}</p>

    <div v-else-if="style === 'shrine'" class="pk-shrines">
      <component
        :is="it.link ? 'a' : 'span'"
        v-for="(it, i) in items"
        :key="i"
        class="pk-shrine"
        :class="{ off: !it.link }"
        :href="it.link ? withBase(it.link) : undefined"
      >
        <!-- 经龛线描（按管理员手绘稿描成矢量，深浅色调自动变色） -->
        <svg viewBox="250 205 980 718" aria-hidden="true">
          <g fill="var(--pk-shrine-face)" stroke="currentColor" stroke-width="9" stroke-linejoin="miter">
            <path d="M338 213H1140L1219.5 270.5H257.5Z" />
            <rect x="257.5" y="270.5" width="962" height="60" />
            <path d="M316.5 330.5V822M1160.5 330.5V822" fill="none" />
            <path d="M348.5 330.5V785H1128.5V330.5" />
            <path d="M444.5 330.5V708H1033.5V330.5" />
            <path d="M480.5 330.5V668H996.5V330.5" />
            <rect x="265.5" y="822" width="946" height="93" />
          </g>
        </svg>
        <span class="pk-shrine-letter">{{ it.title }}</span>
      </component>
    </div>

    <div v-else :class="style === 'grid' ? 'pk-grid' : 'pk-list'">
      <component
        :is="it.link ? 'a' : 'span'"
        v-for="(it, i) in items"
        :key="i"
        class="pk-item"
        :class="{ off: !it.link }"
        :href="it.link ? withBase(it.link) : undefined"
      >
        <!-- 藏文网址：只显示藏文；语言网址：译名在上、藏文在下 -->
        <template v-if="tr(it.i18n)">
          <span class="pk-item-main">{{ tr(it.i18n) }}</span>
          <span class="pk-item-sub">{{ it.title }}</span>
        </template>
        <span v-else class="pk-item-bo">{{ it.title }}</span>
      </component>
    </div>
  </div>
</template>
