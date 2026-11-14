<script setup lang="ts">
// 收藏页：列出本机浏览器里收藏的经文，可“继续阅读”或移除
import { onMounted } from 'vue'
import { withBase } from 'vitepress'
import { saved, loadSaved, removeSaved } from '../saved'
import { useI18n } from '../i18n'

const { t } = useI18n()

onMounted(loadSaved)
</script>

<template>
  <div class="pk-saved">
    <p v-if="!saved.length" class="pk-empty">{{ t('savedNone') }}</p>
    <ul v-else>
      <li v-for="s in saved" :key="s.path">
        <a class="pk-saved-title" :href="withBase(s.path) + '#resume'">{{ s.title }}</a>
        <div class="pk-saved-ops">
          <span v-if="s.pos > 0.01" class="pk-saved-pos">{{ Math.round(s.pos * 100) }}%</span>
          <a class="pk-btn-sm" :href="withBase(s.path) + '#resume'">{{ t('resume') }}</a>
          <button class="pk-btn-sm" type="button" @click="removeSaved(s.path)">{{ t('remove') }}</button>
        </div>
      </li>
    </ul>
    <p class="pk-note">{{ t('savedNote') }}</p>
  </div>
</template>
