<script setup lang="ts">
// 目录页：内容全部写在该页的 frontmatter 里，不必改 HTML。
//
//   catalog:
//     style: list          # list = 长条按钮（首页、一般目录）；medallion = 圆章（函号）
//     items:
//       - title: ཀ
//         link: /chos-mdzod/ka/
//
// 新增一函、一部、一篇，只要在 items 里加一行。
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { frontmatter } = useData()
const cat = computed(() => frontmatter.value.catalog || {})
const items = computed<{ title: string; link: string; sub?: string }[]>(() => cat.value.items || [])
const style = computed(() => cat.value.style || 'list')
</script>

<template>
  <div class="rz-catalog" :class="`is-${style}`">
    <template v-if="items.length">
      <div v-if="style === 'medallion'" class="rz-medals">
        <a v-for="it in items" :key="it.link" class="rz-medal" :href="withBase(it.link)">
          <span class="rz-medal-ring"><span class="rz-medal-letter">{{ it.title }}</span></span>
          <span v-if="it.sub" class="rz-medal-sub">{{ it.sub }}</span>
        </a>
      </div>
      <div v-else class="rz-list">
        <a v-for="it in items" :key="it.link" class="rz-item" :href="withBase(it.link)">
          <img class="rz-item-mark" :src="withBase('/wheel-sm.png')" alt="" aria-hidden="true" />
          <span class="rz-item-title">{{ it.title }}</span>
          <span v-if="it.sub" class="rz-item-sub">{{ it.sub }}</span>
        </a>
      </div>
    </template>
    <p v-else class="rz-empty">ཡིག་ཆ་རྗེས་སུ་འགོད་རྒྱུ།</p>
  </div>
</template>
