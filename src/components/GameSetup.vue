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

      <button class="submit-btn" @click="startGame">開始遊戲</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const players = ref(6)
const initialStack = ref(1000)
const smallBlind = ref(10)
const bigBlind = ref(20)

const emit = defineEmits(['start-game'])

const startGame = () => {
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
</style> 