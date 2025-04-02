<template>
  <div class="game-setup">
    <h2>遊戲設定</h2>
    
    <div class="setup-form">
      <div class="form-group">
        <label>玩家人數：</label>
        <select v-model="config.players">
          <option v-for="n in 9" :key="n" :value="n">{{ n }}人</option>
        </select>
      </div>

      <div class="form-group">
        <label>初始籌碼：</label>
        <input type="number" v-model="config.initialStack" min="100" step="100">
      </div>

      <div class="form-group">
        <label>小盲：</label>
        <input type="number" v-model="config.smallBlind" min="1">
      </div>

      <div class="form-group">
        <label>大盲：</label>
        <input type="number" v-model="config.bigBlind" min="2">
      </div>

      <div class="form-group player-names">
        <label>玩家名稱：</label>
        <div class="player-name-list">
          <div v-for="i in config.players - 1" :key="i" class="player-name-item">
            <input 
              type="text" 
              v-model="playerNames[i-1]" 
              :placeholder="`玩家${i}`"
              class="name-input"
            >
            <div class="quick-names">
              <button 
                v-for="name in quickNames" 
                :key="name"
                class="quick-name-btn"
                @click="playerNames[i-1] = name"
              >
                {{ name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>常用名稱：</label>
        <div class="quick-names-editor">
          <div class="quick-names-list">
            <div v-for="(name, index) in quickNames" :key="index" class="quick-name-item">
              <input type="text" v-model="quickNames[index]" class="quick-name-input">
              <button class="remove-btn" @click="removeQuickName(index)">×</button>
            </div>
          </div>
          <button class="add-btn" @click="addQuickName">新增常用名稱</button>
        </div>
      </div>

      <button class="start-btn" @click="startGame">開始遊戲</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getApiKey, setApiKey } from '../services/api'

const emit = defineEmits(['start-game'])

const config = ref({
  players: 6,
  initialStack: 1000,
  smallBlind: 10,
  bigBlind: 20
})

const playerNames = ref([])
const quickNames = ref(['魚', '松凶', '緊凶', '松弱', '緊弱', '常客'])
const apiKey = ref('')
const hasApiKey = ref(false)

// 處理 API Key 變更
const handleApiKeyChange = () => {
  setApiKey(apiKey.value)
  hasApiKey.value = !!apiKey.value
}

// 初始化玩家名稱
const initializePlayerNames = () => {
  playerNames.value = Array(config.value.players - 1).fill('').map((_, i) => `玩家${i + 1}`)
}

// 監聽玩家人數變化
watch(() => config.value.players, (newPlayers) => {
  const currentNames = [...playerNames.value]
  playerNames.value = Array(newPlayers - 1).fill('').map((_, i) => currentNames[i] || `玩家${i + 1}`)
})

// 初始化
onMounted(() => {
  initializePlayerNames()
  apiKey.value = getApiKey() || ''
  hasApiKey.value = !!apiKey.value
})

// 新增常用名稱
const addQuickName = () => {
  quickNames.value.push('')
}

// 移除常用名稱
const removeQuickName = (index) => {
  quickNames.value.splice(index, 1)
}

// 開始遊戲
const startGame = () => {
  if (!hasApiKey.value) {
    alert('請先設定 API Key')
    return
  }
  emit('start-game', {
    ...config.value,
    playerNames: playerNames.value
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

.player-names {
  margin-top: 20px;
}

.player-name-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-name-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.name-input {
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.quick-names {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.quick-name-btn {
  padding: 4px 8px;
  background: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-name-btn:hover {
  background: #dee2e6;
}

.quick-names-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-names-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-name-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-name-input {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  width: 80px;
}

.remove-btn {
  padding: 2px 6px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.remove-btn:hover {
  background: #c82333;
}

.add-btn {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;
}

.add-btn:hover {
  background: #218838;
}
</style> 