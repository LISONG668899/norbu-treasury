<script setup lang="ts">
// 目录：内容写在各页 frontmatter 的 catalog 里，不必改代码。
//
//   catalog:
//     style: list     # list = 长条按钮；grid = 两列按钮；shrine = 经龛（函号）
//     items:
//       - title: བཀའ་དང་བསྟན་བཅོས་ཀྱི་སྐོར།
//         link: /ka-bstan/
//         i18n: { zh: 佛语与论著, zht: 佛語與論著, en: "The Buddha's Word and Treatises" }
//
// 显示：只有首页目录随语言显示一种文字；从第二层开始一律藏文，切换语言不改变。
//
// 经龛（函号）的自动规则：
//   · 只显示“已有文章”的函；没有文章的函自动隐藏
//   · 只有一函有文章：不显示经龛，直接列出这一函的文章
//   · 两函以上：显示经龛，每行 4 个；
//       总数 2–4 个 → 一行居中
//       最后一行剩 1 个 → 居中；剩 2 个 → 一左一右；剩 3 个 → 左、中、右
import { computed } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { useI18n, localeOf, localePath, rootPathOf } from '../i18n'
import { data as pages } from '../catalog.data.mts'

interface Item { title: string; link?: string; i18n?: Record<string, string> }

const { frontmatter } = useData()
const route = useRoute()
const { lang, t, name: tr } = useI18n()
const isHome = computed(() => rootPathOf(route.path).replace(/index\.html$/, '') === '/')
const name = (bo: string, i18n?: Record<string, string>) => (isHome.value ? tr(bo, i18n) : bo)
const cat = computed(() => frontmatter.value.catalog || {})
const items = computed<Item[]>(() => cat.value.items || [])
const style = computed(() => cat.value.style || 'list')

// 链接对应的藏文页面信息
const info = (link?: string) => (link ? pages[rootPathOf(link)] : undefined)
const hasContent = (link?: string) => {
  const p = info(link)
  return !!p && (p.text || (p.items || []).some((x) => x.link))
}

// 经龛：只保留有内容的函
const volumes = computed(() => items.value.filter((it) => hasContent(it.link)))

// 只有一函：直接列出该函的文章（链接按当前语言网址处理；经文页始终是藏文网址）
const singleList = computed<Item[]>(() => {
  if (style.value !== 'shrine' || volumes.value.length !== 1) return []
  const p = info(volumes.value[0].link)
  const loc = localeOf(route.path)
  return (p?.items || []).map((x) => {
    if (!x.link || !loc) return x
    const target = pages[x.link]
    return target?.text ? x : { ...x, link: localePath(loc, x.link) }
  })
})

// 经龛排列：8 列网格，每个经龛占 2 列，用起始列控制位置
const placed = computed(() => {
  const v = volumes.value
  const n = v.length
  const cols: number[] = []
  if (n <= 4) {
    const starts: Record<number, number[]> = { 1: [4], 2: [3, 5], 3: [2, 4, 6], 4: [1, 3, 5, 7] }
    cols.push(...(starts[n] || []))
  } else {
    const full = n - (n % 4 || 4)
    for (let i = 0; i < full; i++) cols.push([1, 3, 5, 7][i % 4])
    const r = n - full
    const last: Record<number, number[]> = { 1: [4], 2: [1, 7], 3: [1, 4, 7], 4: [1, 3, 5, 7] }
    cols.push(...last[r])
  }
  return v.map((it, i) => ({ it, col: cols[i] }))
})

// 内容未定时先画空框：catalog.slots = 框的个数（style: list 单列，grid 两列），框里不写字
const slots = computed(() => Number(cat.value.slots) || 0)
const listItems = computed(() => (style.value === 'shrine' ? singleList.value : items.value))
const showShrines = computed(() => style.value === 'shrine' && volumes.value.length >= 2)
</script>

<template>
  <div class="pk-catalog" :class="[`is-${style}`, { 'is-home': isHome }]">
    <div v-if="showShrines" class="pk-shrines">
      <a
        v-for="(p, i) in placed"
        :key="i"
        class="pk-shrine"
        :href="withBase(p.it.link!)"
        :style="{ gridColumn: `${p.col} / span 2` }"
      >
        <!-- 经龛线描（按管理员手绘稿描成矢量，绛红色线条） -->
        <svg viewBox="250 205 980 718" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="miter">
            <path d="M338 213H1140L1219.5 270.5H257.5Z" />
            <rect x="257.5" y="270.5" width="962" height="60" />
            <path d="M316.5 330.5V822M1160.5 330.5V822" />
            <path d="M348.5 330.5V785H1128.5V330.5" />
            <path d="M444.5 330.5V708H1033.5V330.5" />
            <path d="M480.5 330.5V668H996.5V330.5" />
            <rect x="265.5" y="822" width="946" height="93" />
          </g>
        </svg>
        <span class="pk-shrine-letter">{{ p.it.title }}</span>
      </a>
    </div>

    <div v-else-if="slots" :class="style === 'grid' ? 'pk-grid' : 'pk-list'">
      <span v-for="i in slots" :key="i" class="pk-item is-slot" aria-hidden="true"></span>
    </div>

    <p v-else-if="!listItems.length" class="pk-empty">{{ t('empty') }}</p>

    <div v-else :class="style === 'grid' ? 'pk-grid' : 'pk-list'">
      <component
        :is="it.link ? 'a' : 'span'"
        v-for="(it, i) in listItems"
        :key="i"
        class="pk-item"
        :class="{ off: !it.link }"
        :href="it.link ? withBase(it.link) : undefined"
      >
        <span class="pk-item-name" :class="{ 'is-bo': /[\u0F00-\u0FFF]/.test(name(it.title, it.i18n)) }">{{ name(it.title, it.i18n) }}</span>
      </component>
    </div>
  </div>
</template>
