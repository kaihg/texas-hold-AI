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
    this.smallBlindIndex = 0
    this.initializePlayers()
  }

  initializePlayers() {
    this.players = []
    for (let i = 0; i < this.config.players; i++) {
      this.players.push({
        id: i + 1,
        name: i === 0 ? 'Hero' : (this.config.playerNames?.[i-1] || `玩家${i}`),
        stack: this.config.initialStack,
        isSmallBlind: i === this.smallBlindIndex,
        hasActed: false,
        action: null,
        raiseAmount: 0
      })
    }
  }

  // 獲取玩家位置代號
  getPosition(index) {
    const { players: playerCount } = this.config
    const relativeIndex = (index - this.smallBlindIndex + playerCount) % playerCount
    
    switch (relativeIndex) {
      case 0: return POSITIONS.SB
      case 1: return POSITIONS.BB
      case 2: return POSITIONS.UTG
      case 3: return POSITIONS.UTG1
      case 4: return POSITIONS.UTG2
      case 5: return POSITIONS.MP
      case 6: return POSITIONS.MP1
      case 7: return POSITIONS.MP2
      case 8: return POSITIONS.CO
      case 9: return POSITIONS.HJ
      case 10: return POSITIONS.LJ
      case 11: return POSITIONS.BTN
      default: return 'Unknown'
    }
  }

  // 獲取 Hero 資訊
  get hero() {
    return this.players.find(p => p.isHero)
  }

  // 獲取 Hero 位置
  get heroPosition() {
    return this.hero.position
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
    return {
      players: this.players,
      pot: this.pot,
      currentStage: this.currentStage,
      heroPosition: this.heroPosition,
      heroStack: this.heroStack,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      bigBlind: this.config.bigBlind
    }
  }
}

export {
  GameState,
  STAGES,
  POSITIONS
} 