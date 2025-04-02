<template>
  <div class="game-setup">
    <h2>牌局設定</h2>
    <div class="setup-form">
      <div class="input-group">
        <label>牌桌人數：</label>
        <select v-model="players">
          <option v-for="n in 9" :key="n" :value="n">{{ n }}人</option>
        </select>
      </div>

      <div class="input-group">
        <label>每人初始籌碼：</label>
        <input type="number" v-model="initialStack" min="100" step="100">
      </div>

      <div class="input-group">
        <label>小盲注：</label>
        <input type="number" v-model="smallBlind" min="10" step="10">
      </div>

      <div class="input-group">
        <label>大盲注：</label>
        <input type="number" v-model="bigBlind" min="20" step="10">
      </div>

      <div class="input-group">
        <label>API Key：</label>
        <input 
          type="password" 
          v-model="apiKey" 
          placeholder="請輸入 API Key"
          @input="handleApiKeyChange"
        >
        <span class="api-key-status" :class="{ 'valid': hasApiKey }">
          {{ hasApiKey ? '已設定' : '未設定' }}
        </span>
      </div>

      <button class="submit-btn" @click="startGame">開始遊戲</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getApiKey, setApiKey } from '../services/api'

const emit = defineEmits(['start-game'])

const players = ref(6)
const initialStack = ref(1000)
const smallBlind = ref(10)
const bigBlind = ref(20)
const apiKey = ref('')
const hasApiKey = ref(false)

// 處理 API Key 變更
const handleApiKeyChange = () => {
  if (apiKey.value) {
    setApiKey(apiKey.value)
    hasApiKey.value = true
  } else {
    localStorage.removeItem('apiKey')
    hasApiKey.value = false
  }
}

// 檢查是否已有 API Key
onMounted(() => {
  const savedApiKey = getApiKey()
  if (savedApiKey) {
    apiKey.value = savedApiKey
    hasApiKey.value = true
  }
})

const startGame = () => {
  if (!hasApiKey.value) {
    alert('請先設定 API Key')
    return
  }
  emit('start-game', {
    players: players.value,
    initialStack: initialStack.value,
    smallBlind: smallBlind.value,
    bigBlind: bigBlind.value
  })
}
</script>

<style scoped>
.game-setup {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.setup-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.input-group {
  position: relative;
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #495057;
}

select, input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #0056b3;
}

.api-key-status {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #dc3545;
}

.api-key-status.valid {
  color: #28a745;
}
</style> 