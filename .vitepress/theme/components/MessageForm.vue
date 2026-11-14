<script setup lang="ts">
// 留言给管理员：只发送留言文字（和读者自愿填写的联系方式），不记录 IP 等信息。
// 后端：functions/api/message.js（Cloudflare Pages Function），存入 KV。
import { ref } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const text = ref('')
const contact = ref('')
const trap = ref('')          // 防机器人：真人看不到这个栏位
const state = ref<'idle' | 'sending' | 'ok' | 'fail'>('idle')

async function send() {
  if (text.value.trim().length < 2 || state.value === 'sending') return
  state.value = 'sending'
  try {
    const r = await fetch('/api/message', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: text.value, contact: contact.value, website: trap.value })
    })
    const j = await r.json().catch(() => ({}))
    if (r.ok && j.ok) {
      state.value = 'ok'
      text.value = ''
      contact.value = ''
    } else state.value = 'fail'
  } catch {
    state.value = 'fail'
  }
}
</script>

<template>
  <form class="pk-msg" @submit.prevent="send">
    <textarea v-model="text" rows="7" maxlength="3000" :placeholder="t('msgText')" required></textarea>
    <input v-model="contact" type="text" maxlength="200" :placeholder="t('msgContact')" />
    <input v-model="trap" class="pk-trap" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
    <button type="submit" :disabled="state === 'sending'">
      {{ state === 'sending' ? t('msgSending') : t('msgSend') }}
    </button>
    <p v-if="state === 'ok'" class="pk-msg-ok">{{ t('msgOk') }}</p>
    <p v-if="state === 'fail'" class="pk-msg-fail">{{ t('msgFail') }}</p>
    <p class="pk-note">{{ t('msgNote') }}</p>
  </form>
</template>
