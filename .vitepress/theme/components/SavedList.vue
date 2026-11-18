<script setup lang="ts">
// 收藏页：上面是收藏的经典（可“继续阅读”），下面是收藏的译文（选段机器翻译的结果）
// 右上角“导出全部”：把收藏的经典清单和译文（藏文原文 + 译文）导出为 PDF / Word / TXT
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { saved, loadSaved, removeSaved, savedTr, loadSavedTr, removeTr } from '../saved'
import { useI18n } from '../i18n'

const { t } = useI18n()
const menu = ref(false)

const fmt = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const url = (p: string) => location.origin + p
const fileBase = () => `PUNDARIKA-${fmt(Date.now())}`

function download(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1000)
}

function exportPdf() {
  menu.value = false
  // 打印时只保留收藏内容（见 custom.css 末尾的 @media print），在打印窗口里选“存为 PDF”
  setTimeout(() => window.print(), 50)
}

function exportWord() {
  menu.value = false
  let b = `<h1>${esc(t('siteName'))} · ${esc(t('savedTitle'))}</h1><p class="sub">${fmt(Date.now())}　${esc(location.origin)}</p>`
  if (saved.value.length) {
    b += `<h2>${esc(t('savedTexts'))}</h2>`
    for (const s of saved.value) b += `<p class="bo">${esc(s.title)}</p><p class="src">${esc(url(s.path))}</p>`
  }
  if (savedTr.value.length) {
    b += `<h2>${esc(t('savedTr'))}</h2>`
    for (const s of savedTr.value) {
      b += `<p class="bo t">${esc(s.title)}</p><p class="src">${esc(url(s.path))}</p>` +
        `<p class="bo">${esc(s.source)}</p><p class="out">${esc(s.text).replace(/\n/g, '<br>')}</p>`
    }
    b += `<p class="src">${esc(t('mtNote'))}</p>`
  }
  const html =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    `<head><meta charset="utf-8"><title>${esc(t('savedTitle'))}</title><style>` +
    'body{font-family:"Microsoft Himalaya","Noto Serif Tibetan","Songti SC","SimSun",serif;font-size:12pt;line-height:1.8}' +
    'h1{font-size:18pt;text-align:center}h2{font-size:14pt;margin-top:18pt;border-bottom:1px solid #b28e46}' +
    '.sub{text-align:center;color:#888;font-size:9pt}.src{color:#888;font-size:9pt;margin-top:0}' +
    '.bo{font-family:"Microsoft Himalaya","Noto Serif Tibetan",serif;font-size:16pt;line-height:1.9}.t{margin-top:14pt;margin-bottom:0}' +
    '.out{border-left:3pt solid #b28e46;padding-left:8pt;font-family:"Songti SC","SimSun",serif}' +
    `</style></head><body>${b}</body></html>`
  download(new Blob(['﻿' + html], { type: 'application/msword' }), fileBase() + '.doc')
}

function exportTxt() {
  menu.value = false
  let s = `${t('siteName')} · ${t('savedTitle')}\n${fmt(Date.now())}　${location.origin}\n`
  if (saved.value.length) {
    s += `\n━━━━━━━━━━\n${t('savedTexts')}\n`
    for (const x of saved.value) s += `\n${x.title}\n${url(x.path)}\n`
  }
  if (savedTr.value.length) {
    s += `\n━━━━━━━━━━\n${t('savedTr')}\n`
    for (const x of savedTr.value) s += `\n${x.title}\n${url(x.path)}\n${x.source}\n${x.text}\n`
    s += `\n${t('mtNote')}\n`
  }
  download(new Blob(['﻿' + s.replace(/\r?\n/g, '\r\n')], { type: 'text/plain;charset=utf-8' }), fileBase() + '.txt')
}

function onDocClick(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.pk-export')) menu.value = false
}
onMounted(() => { loadSaved(); loadSavedTr(); document.addEventListener('click', onDocClick) })
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="pk-saved">
    <p class="pk-how">{{ t('savedHow') }}</p>
    <p v-if="!saved.length && !savedTr.length" class="pk-empty">{{ t('savedNone') }}</p>

    <div v-else class="pk-export-bar">
      <div class="pk-export">
        <button class="pk-btn-sm pk-btn-export" :class="{ open: menu }" type="button" :aria-expanded="menu" @click="menu = !menu">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" /></svg>
          <span>{{ t('exportAll') }}</span>
        </button>
        <div v-if="menu" class="pk-export-menu" role="menu">
          <button type="button" role="menuitem" @click="exportPdf"><b>PDF</b><span>{{ t('expPdf') }}</span></button>
          <button type="button" role="menuitem" @click="exportWord"><b>Word</b><span>{{ t('expWord') }}</span></button>
          <button type="button" role="menuitem" @click="exportTxt"><b>TXT</b><span>{{ t('expTxt') }}</span></button>
        </div>
      </div>
    </div>

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
