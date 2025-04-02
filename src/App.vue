<template>
  <div class="app">
    <header>
      <h1>德州撲克助手</h1>
    </header>
    
    <main>
      <GameSetup v-if="!gameConfig" @start-game="startGame" />
      <GamePlay 
        v-else 
        :game-config="gameConfig"
        :game-state="gameState"
        @reset-game="resetGame" 
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GameSetup from './components/GameSetup.vue'
import GamePlay from './components/GamePlay.vue'
import { GameState } from './services/gameState'

const gameConfig = ref(null)
const gameState = ref(null)

const startGame = (config) => {
  gameConfig.value = config
  gameState.value = new GameState(config)
}

const resetGame = () => {
  gameConfig.value = null
  gameState.value = null
}
</script>

<style>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #2c3e50;
  font-size: 24px;
}

main {
  min-height: calc(100vh - 100px);
}
</style> 