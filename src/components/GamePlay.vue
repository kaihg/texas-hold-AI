<template>
  <div class="game-play">
    <div class="game-info">
      <div class="info-item">
        <span class="label">位置：</span>
        <span class="value">{{ position }}</span>
      </div>
      <div class="info-item">
        <span class="label">底池：</span>
        <span class="value">{{ pot }}</span>
      </div>
      <div class="info-item">
        <span class="label">對手動作：</span>
        <span class="value">{{ opponentAction }}</span>
      </div>
    </div>

    <div class="players-list">
      <Player
        v-for="player in players"
        :key="player.id"
        :name="player.name"
        :stack="player.stack"
        :is-active="player.isActive"
        @action="handlePlayerAction(player.id, $event)"
      />
    </div>

    <div class="game-state">
      <h2>當前牌局狀態</h2>
      <div class="input-group">
        <label>手牌：</label>
        <div class="cards-matrix">
          <div class="cards-row" v-for="(row, rowIndex) in cardMatrix" :key="rowIndex">
            <button
              v-for="card in row"
              :key="card"
              class="card-btn"
              :class="{
                'selected': selectedCards.includes(card),
                'disabled': selectedCards.length === 2 && !selectedCards.includes(card)
              }"
              @click="handleCardSelect(card)"
            >
              {{ card }}
            </button>
          </div>
        </div>
        <div class="selected-cards" v-if="selectedCards.length > 0">
          已選擇：{{ selectedCards.join(' ') }}
        </div>
      </div>

      <div class="input-group">
        <label>公共牌：</label>
        <div class="community-cards">
          <select v-for="(_, index) in 5" :key="index" v-model="communityCards[index]">
            <option value="">未發</option>
            <option v-for="card in cards" :key="card" :value="card">{{ card }}</option>
          </select>
        </div>
      </div>
    </div>

    <button class="submit-btn" @click="getAdvice">獲取建議</button>
    
    <div v-if="advice" class="advice">
      <h3>AI 建議：</h3>
      <p>{{ advice }}</p>
    </div>

    <button class="reset-btn" @click="$emit('reset-game')">重新設定</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Player from './Player.vue'

const props = defineProps({
  gameConfig: {
    type: Object,
    required: true
  }
})

const cards = ['A♠', 'K♠', 'Q♠', 'J♠', '10♠', '9♠', '8♠', '7♠', '6♠', '5♠', '4♠', '3♠', '2♠',
               'A♥', 'K♥', 'Q♥', 'J♥', '10♥', '9♥', '8♥', '7♥', '6♥', '5♥', '4♥', '3♥', '2♥',
               'A♦', 'K♦', 'Q♦', 'J♦', '10♦', '9♦', '8♦', '7♦', '6♦', '5♦', '4♦', '3♦', '2♦',
               'A♣', 'K♣', 'Q♣', 'J♣', '10♣', '9♣', '8♣', '7♣', '6♣', '5♣', '4♣', '3♣', '2♣']

const position = ref('BB')
const selectedCards = ref([])
const communityCards = ref(['', '', '', '', ''])
const pot = ref(0)
const opponentAction = ref('check')
const advice = ref('')

// 將牌組轉換為 4x13 的矩陣
const cardMatrix = computed(() => {
  const matrix = []
  for (let i = 0; i < 4; i++) {
    matrix.push(cards.slice(i * 13, (i + 1) * 13))
  }
  return matrix
})

const handleCardSelect = (card) => {
  if (selectedCards.value.includes(card)) {
    // 如果已經選中，則取消選中
    selectedCards.value = selectedCards.value.filter(c => c !== card)
  } else if (selectedCards.value.length < 2) {
    // 如果未選中且未選滿兩張，則選中
    selectedCards.value.push(card)
  }
}

// 計算玩家列表
const players = computed(() => {
  const { players: playerCount, initialStack, bigBlind } = props.gameConfig
  return Array.from({ length: playerCount }, (_, i) => ({
    id: i + 1,
    name: `玩家${i + 1}`,
    stack: Math.floor(initialStack / bigBlind),
    isActive: true
  }))
})

const handlePlayerAction = (playerId, action) => {
  console.log(`玩家 ${playerId} 執行動作:`, action)
  // TODO: 處理玩家動作
}

const getAdvice = async () => {
  // TODO: 實現 API 調用
  advice.value = '正在分析...'
}
</script>

<style scoped>
.game-play {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.game-info {
  display: flex;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  color: #6c757d;
}

.value {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.players-list {
  margin-bottom: 20px;
}

.game-state {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #495057;
}

.cards-matrix {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}

.cards-row {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 2px;
}

.card-btn {
  padding: 4px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  text-align: center;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-btn:hover:not(.disabled) {
  background: #f8f9fa;
}

.card-btn.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.card-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected-cards {
  margin-top: 10px;
  padding: 8px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 14px;
}

.community-cards {
  display: flex;
  gap: 10px;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.submit-btn, .reset-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 10px;
}

.submit-btn {
  background: #007bff;
  color: white;
}

.submit-btn:hover {
  background: #0056b3;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover {
  background: #5a6268;
}

.advice {
  margin-top: 20px;
  padding: 15px;
  background: #e9ecef;
  border-radius: 4px;
}

.advice h3 {
  margin-top: 0;
  color: #2c3e50;
}
</style> 