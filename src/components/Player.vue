<template>
  <div class="player" :class="{ 'active': isActive }">
    <div class="player-info">
      <div class="player-name">
        {{ name }}
        <span v-if="isSmallBlind" class="small-blind">SB</span>
      </div>
      <div class="player-stack">{{ stack }}BB</div>
    </div>
    <div class="player-actions">
      <button 
        v-for="action in actions" 
        :key="action"
        class="action-btn"
        :class="{ 'selected': selectedAction === action }"
        @click="handleActionClick(action)"
      >
        {{ action }}
      </button>
      <button 
        v-if="selectedAction === 'RAISE'"
        class="action-btn raise-amount"
        :class="{ 'selected': selectedRaise }"
        @click="showRaiseWindow = true"
      >
        {{ getActionLabel }}
      </button>
    </div>

    <!-- 加注選擇視窗 -->
    <div v-if="showRaiseWindow" class="raise-window">
      <div class="raise-options">
        <button 
          v-for="amount in raiseAmounts" 
          :key="amount"
          class="raise-option"
          :class="{ 'selected': selectedRaise === amount }"
          @click="selectRaiseAmount(amount)"
        >
          {{ amount }}BB
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  stack: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSmallBlind: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action'])

const actions = ['CHECK', 'CALL', 'FOLD', 'RAISE']
const selectedAction = ref('')
const selectedRaise = ref(null)
const showRaiseWindow = ref(false)
const raiseAmounts = [2, 3, 4, 5, 6]

const getActionLabel = computed(() => {
  if (selectedRaise.value) {
    return `RAISE ${selectedRaise.value}BB`
  }
  return 'RAISE +'
})

const handleActionClick = (action) => {
  if (action === 'RAISE') {
    showRaiseWindow.value = true
    selectedAction.value = action
  } else {
    selectedAction.value = action
    selectedRaise.value = null
    emit('action', { type: action })
  }
}

const selectRaiseAmount = (amount) => {
  selectedRaise.value = amount
  showRaiseWindow.value = false
  emit('action', { type: 'RAISE', amount })
}

// 重置玩家狀態
const resetState = () => {
  selectedAction.value = ''
  selectedRaise.value = null
  showRaiseWindow.value = false
}

// 暴露重置方法給父組件
defineExpose({
  resetState
})
</script>

<style scoped>
.player {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.player.active {
  background: #e9ecef;
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.player-name {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.small-blind {
  background: #ffc107;
  color: #000;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.player-stack {
  color: #6c757d;
}

.player-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  white-space: nowrap;
}

.action-btn:hover {
  background: #f8f9fa;
}

.action-btn.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.raise-window {
  margin-top: 10px;
  padding: 10px;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.raise-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.raise-option {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.raise-option:hover {
  background: #f8f9fa;
}

.raise-option.selected {
  background: #ffc107;
  border-color: #ffc107;
  color: #000;
}
</style> 