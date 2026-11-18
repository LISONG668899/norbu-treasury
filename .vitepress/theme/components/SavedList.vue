<script setup lang="ts">
// 收藏页：上面是收藏的经典（可“继续阅读”），下面是收藏的译文（选段机器翻译的结果）
import { onMounted } from 'vue'
import { withBase } from 'vitepress'
import { saved, loadSaved, removeSaved, savedTr, loadSavedTr, removeTr } from '../saved'
import { useI18n } from '../i18n'

const { t } = useI18n()

onMounted(() => { loadSaved(); loadSavedTr() })
</script>

<template>
  <div class="pk-saved">
    <p v-if="!saved.length && !savedTr.length" class="pk-empty">{{ t('savedNone') }}</p>

    <template v-if="saved.length">
      <h2 v-if="savedTr.length" class="pk-saved-h">{{ t('savedTexts') }}</h2>
      <ul>
        <li v-for="s in saved" :key="s.path">
          <a class="pk-saved-title" :href="withBase(s.path) + '#resume'">{{ s.title }}</a>
          <div class="pk-saved-ops">
            <span v-if="s.pos > 0.01" class="pk-saved-pos">{{ Math.round(s.pos * 100) }}%</span>
            <a class="pk-btn-sm" :href="withBase(s.path) + '#resume'">{{ t('resume') }}</a>
            <button class="pk-btn-sm" type="button" @click="removeSaved(s.path)">{{ t('remove') }}</button>
          </div>
        </li>
      </ul>
    </template>

    <template v-if="savedTr.length">
      <h2 class="pk-saved-h">{{ t('savedTr') }}</h2>
      <ul class="pk-saved-tr">
        <li v-for="s in savedTr" :key="s.id">
          <a class="pk-saved-title" :href="withBase(s.path)">{{ s.title }}</a>
          <p class="pk-saved-src">{{ s.source }}</p>
          <p class="pk-saved-out">{{ s.text }}</p>
          <div class="pk-saved-ops">
            <span class="pk-saved-pos">{{ t('trNote') }}</span>
            <button class="pk-btn-sm" type="button" @click="removeTr(s.id)">{{ t('remove') }}</button>
          </div>
        </li>
      </ul>
    </template>

    <p class="pk-note">{{ t('savedNote') }}</p>
  </div>
</template>
