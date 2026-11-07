<script setup lang="ts">
// 唐卡等图片的统一显示组件：先显示浏览图，可下载原图。
// 用法：<MediaImage id="thangka/0001" caption="ཀྱེ་རྡོ་རྗེའི་དཀྱིལ་འཁོར།" />
import { computed } from 'vue'
import { imageSet } from '../media'

const props = defineProps<{ id: string; caption?: string }>()
const set = computed(() => imageSet(props.id))
</script>

<template>
  <figure class="rz-media">
    <a :href="set.display" target="_blank" rel="noopener">
      <img
        :src="set.display"
        :srcset="`${set.thumb} 480w, ${set.display} 2000w`"
        sizes="(max-width: 720px) 100vw, 720px"
        :alt="caption || ''"
        loading="lazy"
        decoding="async"
      />
    </a>
    <figcaption v-if="caption">
      <span class="rz-media-cap">{{ caption }}</span>
      <a class="rz-media-dl" :href="set.original" download>མ་ཕྱི།</a>
    </figcaption>
  </figure>
</template>
