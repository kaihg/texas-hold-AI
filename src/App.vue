<template>
  <div class="app">
    <header>
      <h1>德州撲克助手</h1>
    </header>
    
    <main>
      <GameSetup v-if="!gameStarted" @start-game="startGame" />
      <GamePlay v-else :game-config="gameConfig" @reset-game="resetGame" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GameSetup from './components/GameSetup.vue'
import GamePlay from './components/GamePlay.vue'

const gameStarted = ref(false)
const gameConfig = ref(null)

const startGame = (config) => {
  gameConfig.value = config
  gameStarted.value = true
}

const resetGame = () => {
  gameStarted.value = false
  gameConfig.value = null
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