<template>
  <div class="player-card">
    <div class="player-info">
      <span class="player-name">{{ name }}</span>
      <span class="player-stack">{{ stack }}BB</span>
    </div>

    <div class="action-buttons">
      <button 
        v-for="action in actions" 
        :key="action.type"
        :class="[
          'action-btn', 
          action.type,
          { 'selected': selectedAction === action.type }
        ]"
        @click="handleAction(action.type)"
      >
        {{ getActionLabel(action) }}
      </button>
    </div>

    <!-- Raise 選擇視窗 -->
    <div v-if="showRaiseOptions" class="raise-options">
      <div class="raise-header">
        <span>選擇加注量</span>
        <button class="close-btn" @click="closeRaiseOptions">×</button>
      </div>
      <div class="raise-buttons">
        <button 
          v-for="bb in raiseOptions" 
          :key="bb"
          class="raise-btn"
          :class="{ 'selected': selectedRaise === bb }"
          @click="handleRaise(bb)"
        >
          {{ bb }}BB
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
    default: false
  }
})

const emit = defineEmits(['action'])

const showRaiseOptions = ref(false)
const selectedAction = ref('')
const selectedRaise = ref(null)
const raiseOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10]

const actions = [
  { type: 'check', label: 'CHECK' },
  { type: 'call', label: 'CALL' },
  { type: 'fold', label: 'FOLD' },
  { type: 'raise', label: 'RAISE +' }
]

const getActionLabel = (action) => {
  if (action.type === 'raise' && selectedRaise.value) {
    return `RAISE ${selectedRaise.value}BB`
  }
  return action.label
}

const handleAction = (type) => {
  if (type === 'raise') {
    showRaiseOptions.value = true
    selectedAction.value = type
  } else {
    selectedAction.value = type
    selectedRaise.value = null
    emit('action', { type })
  }
}

const handleRaise = (bb) => {
  selectedRaise.value = bb
  emit('action', { type: 'raise', value: bb })
  closeRaiseOptions()
}

const closeRaiseOptions = () => {
  showRaiseOptions.value = false
  if (!selectedRaise.value) {
    selectedAction.value = ''
  }
}
</script>

<style scoped>
.player-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  position: relative;
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.player-name {
  font-weight: bold;
  color: #2c3e50;
}

.player-stack {
  color: #6c757d;
  font-size: 0.9em;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-btn {
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.action-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  opacity: 0;
  transition: opacity 0.2s;
}

.action-btn:hover::after {
  opacity: 1;
}

.action-btn.selected {
  transform: scale(0.95);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-btn.check {
  background: #28a745;
}

.action-btn.call {
  background: #17a2b8;
}

.action-btn.fold {
  background: #dc3545;
}

.action-btn.raise {
  background: #ffc107;
  color: #000;
}

.raise-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 10px;
  margin-top: 5px;
  z-index: 100;
}

.raise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.raise-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.raise-btn {
  padding: 5px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.raise-btn.selected {
  background: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.raise-btn:hover {
  background: #f8f9fa;
}
</style> 