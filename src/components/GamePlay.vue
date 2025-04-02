<template>
  <div class="game-play">
    <div class="game-content">
      <div class="players-section">
        <div class="players-header">
          <h3>玩家列表</h3>
          <div class="header-buttons">
            <button class="rotate-sb-btn" @click="rotateSmallBlind">
              輪換小盲位置
            </button>
            <button class="new-hand-btn" @click="startNewHand">
              重新開始一局
            </button>
          </div>
        </div>
        <div class="players-list">
          <Player
            v-for="player in gameState?.players"
            :key="player.id"
            :name="player.name"
            :stack="player.stack"
            :is-active="player.hasActed"
            :is-small-blind="player.id === gameState?.smallBlindIndex + 1"            
            @action="handlePlayerAction(player.id, $event)"
          />
        </div>
      </div>

      <div class="game-state-section">
        <div class="game-state">
          <h2>當前牌局狀態</h2>
          <div class="game-info">
            <div class="pot-info">
              <span class="label">底池：</span>
              <span class="value">{{ gameState?.pot }}BB</span>
            </div>
            <div class="stage-info">
              <span class="label">階段：</span>
              <span class="value">{{ getStageLabel(gameState?.currentStage) }}</span>
            </div>
          </div>
          <div class="input-group">
            <label>手牌：</label>
            <div class="cards-matrix">
              <div class="cards-row" v-for="(row, rowIndex) in cardMatrix" :key="rowIndex">
                <div class="suit-label" :class="{ 'red': rowIndex === 1 || rowIndex === 2 }">
                  {{ getSuitLabel(rowIndex) }}
                </div>
                <button
                  v-for="card in row"
                  :key="card"
                  class="card-btn"
                  :class="{
                    'selected': selectedCards.includes(card),
                    'disabled': selectedCards.length === 2 && !selectedCards.includes(card),
                    'red': rowIndex === 1 || rowIndex === 2
                  }"
                  @click="handleCardSelect(card)"
                >
                  {{ getCardLabel(card) }}
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
              <!-- 前三張牌 -->
              <div class="flop-cards">
                <div v-if="!showFlopMatrix" class="flop-display">
                  <button 
                    v-for="(card, index) in communityCards.slice(0, 3)" 
                    :key="index"
                    class="community-card-btn"
                    @click="showFlopMatrix = true"
                  >
                    {{ card || '選擇前三張' }}
                  </button>
                </div>
                <div v-else class="cards-matrix">
                  <div class="cards-row" v-for="(row, rowIndex) in cardMatrix" :key="rowIndex">
                    <button
                      v-for="card in row"
                      :key="card"
                      class="card-btn"
                      :class="{
                        'selected': selectedFlopCards.includes(card),
                        'disabled': selectedFlopCards.length === 3 && !selectedFlopCards.includes(card)
                      }"
                      @click="handleFlopCardSelect(card)"
                    >
                      {{ card }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 後兩張牌 -->
              <div class="turn-river-cards">
                <select v-model="communityCards[3]">
                  <option value="">轉牌</option>
                  <option v-for="card in cards" :key="card" :value="card">{{ card }}</option>
                </select>
                <select v-model="communityCards[4]">
                  <option value="">河牌</option>
                  <option v-for="card in cards" :key="card" :value="card">{{ card }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button class="submit-btn" @click="getAdvice">獲取建議</button>
        
        <div v-if="advice" class="advice">
          <h3>AI 建議：</h3>
          <div class="advice-content" v-html="formatAdvice(advice)"></div>
        </div>

        <button class="reset-btn" @click="$emit('reset-game')">重新設定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Player from './Player.vue'
import { getAdvice as getAdviceFromService } from '../services/advice'
import { GameState, STAGES } from '../services/gameState'

const props = defineProps({
  gameConfig: {
    type: Object,
    required: true
  },
  gameState: {
    type: Object,
    required: true
  }
})

const cards = ['A♠', 'K♠', 'Q♠', 'J♠', '10♠', '9♠', '8♠', '7♠', '6♠', '5♠', '4♠', '3♠', '2♠',
               'A♥', 'K♥', 'Q♥', 'J♥', '10♥', '9♥', '8♥', '7♥', '6♥', '5♥', '4♥', '3♥', '2♥',
               'A♦', 'K♦', 'Q♦', 'J♦', '10♦', '9♦', '8♦', '7♦', '6♦', '5♦', '4♦', '3♦', '2♦',
               'A♣', 'K♣', 'Q♣', 'J♣', '10♣', '9♣', '8♣', '7♣', '6♣', '5♣', '4♣', '3♣', '2♣']

const selectedCards = ref([])
const communityCards = ref(['', '', '', '', ''])
const advice = ref('')
const showFlopMatrix = ref(false)
const selectedFlopCards = ref([])

// 初始化 playerRefs 陣列
const playerRefs = ref(Array(props.gameConfig.players).fill(null))

// 監聽 props 變化
watch(() => props.gameConfig.players, (newPlayers) => {
  playerRefs.value = Array(newPlayers).fill(null)
})

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
    selectedCards.value = selectedCards.value.filter(c => c !== card)
  } else if (selectedCards.value.length < 2) {
    selectedCards.value.push(card)
  }
}

const handleFlopCardSelect = (card) => {
  if (selectedFlopCards.value.includes(card)) {
    selectedFlopCards.value = selectedFlopCards.value.filter(c => c !== card)
  } else if (selectedFlopCards.value.length < 3) {
    selectedFlopCards.value.push(card)
  }
  
  // 當選擇了三張牌時，更新 communityCards 並關閉矩陣
  if (selectedFlopCards.value.length === 3) {
    communityCards.value = [...selectedFlopCards.value, communityCards.value[3], communityCards.value[4]]
    showFlopMatrix.value = false
    props.gameState.nextStage() // 進入翻牌圈
  }
}

// 處理玩家動作
const handlePlayerAction = (playerId, action, raiseAmount = null) => {
  props.gameState.updatePlayerAction(playerId, action, raiseAmount)
}

// 輪換小盲位置
const rotateSmallBlind = () => {
  props.gameState.rotateSmallBlind()
}

// 重置遊戲狀態
const resetGameState = () => {
  selectedCards.value = []
  communityCards.value = ['', '', '', '', '']
  advice.value = ''
  showFlopMatrix.value = false
  selectedFlopCards.value = []
  props.gameState.resetGame()
  
  // 重置所有玩家狀態
  playerRefs.value.forEach(playerRef => {
    playerRef.resetState()
  })
}

// 開始新一局
const startNewHand = () => {
  resetGameState()
  rotateSmallBlind()
}

// 整理遊戲狀態資訊
const getGameState = () => {
  const state = props.gameState.getGameState()
  
  // 整理公共牌資訊
  const communityCardsInfo = {
    flop: communityCards.value.slice(0, 3),
    turn: communityCards.value[3],
    river: communityCards.value[4]
  }

  return {
    ...state,
    handCards: selectedCards.value,
    communityCards: communityCardsInfo
  }
}

const getAdvice = async () => {
  try {
    advice.value = '正在分析...'
    
    // 整理遊戲狀態
    const gameState = getGameState()
    
    // 使用 advice service 獲取建議
    advice.value = await getAdviceFromService(gameState)
  } catch (error) {
    console.error('獲取建議時發生錯誤:', error)
    advice.value = error.message || '獲取建議時發生錯誤，請稍後再試'
  }
}

// 獲取花色標籤
const getSuitLabel = (rowIndex) => {
  const suits = ['♠', '♥', '♦', '♣']
  return suits[rowIndex]
}

// 獲取牌面標籤（移除花色符號）
const getCardLabel = (card) => {
  return card.slice(0, -1)
}

// 格式化建議文字
const formatAdvice = (text) => {
  if (!text) return ''
  return text
    .split('\n')
    .map(line => {
      // 處理粗體
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return line
    })
    .join('<br>')
}

// 獲取階段標籤
const getStageLabel = (stage) => {
  const stageLabels = {
    preflop: '翻牌前',
    flop: '翻牌圈',
    turn: '轉牌圈',
    river: '河牌圈'
  }
  return stageLabels[stage] || stage
}
</script>

<style scoped>
.game-play {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.game-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.players-section {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.players-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.players-header h3 {
  margin: 0;
  color: #2c3e50;
}

.rotate-sb-btn {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.rotate-sb-btn:hover {
  background: #218838;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-state-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-state {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.game-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.pot-info, .stage-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #e9ecef;
  border-radius: 4px;
  flex: 1;
}

.pot-info .label, .stage-info .label {
  font-size: 16px;
  color: #495057;
}

.pot-info .value, .stage-info .value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
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
  grid-template-columns: auto repeat(13, 1fr);
  gap: 2px;
  align-items: center;
}

.suit-label {
  font-size: 16px;
  font-weight: bold;
  padding: 4px;
  text-align: center;
  color: #495057;
}

.suit-label.red {
  color: #dc3545;
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
  color: #495057;
}

.card-btn.red {
  color: #dc3545;
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
  flex-direction: column;
  gap: 15px;
}

.flop-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flop-display {
  display: flex;
  gap: 10px;
}

.community-card-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  text-align: center;
}

.community-card-btn:hover {
  background: #f8f9fa;
}

.turn-river-cards {
  display: flex;
  gap: 10px;
}

select {
  flex: 1;
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

.advice-content {
  white-space: pre-line;
  line-height: 1.6;
  color: #2c3e50;
}

.advice-content :deep(strong) {
  color: #dc3545;
  font-weight: 600;
}
</style> 