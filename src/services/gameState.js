// 位置代號定義
const POSITIONS = {
  BTN: 'BTN',    // Button
  SB: 'SB',      // Small Blind
  BB: 'BB',      // Big Blind
  UTG: 'UTG',    // Under The Gun
  UTG1: 'UTG+1',
  UTG2: 'UTG+2',
  MP: 'MP',      // Middle Position
  MP1: 'MP+1',
  MP2: 'MP+2',
  CO: 'CO',      // Cut Off
  HJ: 'HJ',      // Hijack
  LJ: 'LJ'       // Lojack
}

// 遊戲階段定義
const STAGES = {
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river'
}

class GameState {
  constructor(config) {
    this.config = config
    this.players = []
    this.pot = 0
    this.currentStage = STAGES.PREFLOP
    this.smallBlindIndex = 1
    this.initializePlayers()
  }

  initializePlayers() {
    this.players = []
    for (let i = 0; i < this.config.players; i++) {
      this.players.push({
        id: i + 1,
        name: i === 0 ? 'Hero' : (this.config.playerNames?.[i - 1] || `玩家${i}`),
        stack: this.config.initialStack,
        isSmallBlind: i === this.smallBlindIndex,
        hasActed: false,
        action: null,
        raiseAmount: 0
      })
    }
  }

  // 獲取玩家位置
  getPosition(playerIndex) {
    const { players: playerCount } = this.config
    const positions = []

    // 根據玩家數量決定位置
    if (playerCount >= 4 && playerCount <= 10) {
      // 基本位置（所有牌桌都有的位置）
      positions.push(POSITIONS.BTN)
      positions.push(POSITIONS.SB)
      positions.push(POSITIONS.BB)

      // 根據玩家數量添加額外位置
      if (playerCount >= 4) positions.push(POSITIONS.UTG)
      if (playerCount >= 5) positions.push(POSITIONS.UTG1)
      if (playerCount >= 6) positions.push(POSITIONS.UTG2)
      if (playerCount >= 7) positions.push(POSITIONS.MP)
      if (playerCount >= 8) positions.push(POSITIONS.MP1)
      if (playerCount >= 9) positions.push(POSITIONS.MP2)
      if (playerCount >= 10) positions.push(POSITIONS.HJ)
      if (playerCount >= 10) positions.push(POSITIONS.LJ)
      if (playerCount >= 10) positions.push(POSITIONS.CO)
    }

    // 根據小盲位置調整位置順序
    const adjustedPositions = [
      ...positions.slice(this.smallBlindIndex - 1),
      ...positions.slice(0, this.smallBlindIndex - 1)
    ]

    return adjustedPositions[playerIndex]
  }

  // 獲取 Hero 資訊
  get hero() {
    return this.players.find(p => p.isHero)
  }

  // 獲取 Hero 位置
  get heroPosition() {
    const hero = this.players.find(p => p.id === 1)
    if (!hero) return null
    return this.getPosition(0)
  }

  // 獲取 Hero 籌碼
  get heroStack() {
    return this.hero.stack
  }

  // 輪換小盲位置
  rotateSmallBlind() {
    const { players: playerCount } = this.config
    this.smallBlindIndex = (this.smallBlindIndex + 1) % playerCount
    this.initializePlayers()
  }

  // 更新玩家動作
  updatePlayerAction(playerId, action, raiseAmount = null) {
    const player = this.players.find(p => p.id === playerId)
    if (player) {
      player.action = action
      player.raiseAmount = raiseAmount
      player.hasActed = true

      // 更新底池和加注資訊
      if (action === 'RAISE') {
        this.lastRaise = raiseAmount
        this.minRaise = Math.max(this.minRaise, raiseAmount * 2)
      }
    }
  }

  // 重置玩家動作
  resetPlayerActions() {
    this.players.forEach(player => {
      player.action = ''
      player.raiseAmount = null
      player.hasActed = false
    })
    this.currentBet = 0
    this.lastRaise = 0
    this.minRaise = this.config.bigBlind
  }

  // 進入下一階段
  nextStage() {
    switch (this.currentStage) {
      case STAGES.PREFLOP:
        this.currentStage = STAGES.FLOP
        break
      case STAGES.FLOP:
        this.currentStage = STAGES.TURN
        break
      case STAGES.TURN:
        this.currentStage = STAGES.RIVER
        break
      case STAGES.RIVER:
        // 遊戲結束，重置狀態
        this.resetGame()
        break
    }
    this.resetPlayerActions()
  }

  // 重置遊戲
  resetGame() {
    this.pot = 0
    this.currentStage = STAGES.PREFLOP
    this.initializePlayers()
  }

  // 獲取遊戲狀態摘要
  getGameState() {
    const hero = this.players.find(p => p.id === 1)
    return {
      players: this.players.map(player => ({
        id: player.id,
        name: player.name,
        stack: player.stack,
        position: this.getPosition(player.id - 1),
        isSmallBlind: player.isSmallBlind,
        action: player.action,
        raiseAmount: player.raiseAmount
      })),
      pot: this.pot,
      bigBlind: this.config.bigBlind,
      currentStage: this.currentStage,
      heroPosition: hero ? this.getPosition(hero.id - 1) : null,
      heroStack: hero?.stack || 0
    }
  }
}

export {
  GameState,
  STAGES,
  POSITIONS
} 