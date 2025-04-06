// 位置代號定義
const POSITIONS = {
  BTN: 'BTN',    // Button
  SB: 'SB',      // Small Blind
  BB: 'BB',      // Big Blind
  UTG: 'UTG',    // Under The Gun
  UTG1: 'UTG1',
  UTG2: 'UTG2',
  MP: 'MP',      // Middle Position
  MP1: 'MP1',
  MP2: 'MP2',
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
    this.stageHistory = {}
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

    if (playerCount < 3 || playerCount > 10) {
      throw new Error("Supported player count is from 3 to 10.");
    }

    if (playerIndex < 0 || playerIndex >= playerCount) {
      throw new Error("Invalid player index.");
    }

    const fixedPositions = [POSITIONS.BTN, POSITIONS.SB, POSITIONS.BB];
    const dynamicLabels = {
      3: [], // BTN, SB, BB only
      4: [POSITIONS.UTG],
      5: [POSITIONS.UTG, POSITIONS.CO],
      6: [POSITIONS.UTG, POSITIONS.HJ, POSITIONS.CO],
      7: [POSITIONS.UTG, POSITIONS.UTG1, POSITIONS.HJ, POSITIONS.CO],
      8: [POSITIONS.UTG, POSITIONS.UTG1, POSITIONS.MP, POSITIONS.HJ, POSITIONS.CO],
      9: [POSITIONS.UTG, POSITIONS.UTG1, POSITIONS.MP, POSITIONS.MP1, POSITIONS.HJ, POSITIONS.CO],
      10: [POSITIONS.UTG, POSITIONS.UTG1, POSITIONS.UTG2, POSITIONS.MP, POSITIONS.MP1, POSITIONS.HJ, POSITIONS.CO]
    };

    
  
    positions = [...fixedPositions, ...dynamicLabels[playerCount]];
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
    // 記錄當前階段的玩家動作
    this.stageHistory[this.currentStage] = this.players.map(player => ({
      name: player.name,
      position: this.getPosition(player.id - 1),
      action: player.action,
      raiseAmount: player.raiseAmount
    }))
    console.log(this.stageHistory)

    // 計算當前底池
    const currentBets = this.players.reduce((sum, player) => {
      if (player.action === 'FOLD') return sum
      return sum + (player.raiseAmount || 0)
    }, 0)
    this.pot += currentBets

    // 更新階段
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

    // 重置玩家動作（保留 FOLD）
    this.players.forEach(player => {
      if (player.action !== 'FOLD') {
        player.action = null
        player.raiseAmount = null
        player.hasActed = false
      }
    })
    this.currentBet = 0
    this.lastRaise = 0
    this.minRaise = this.config.bigBlind
  }

  // 重置遊戲
  resetGame() {
    this.pot = 0
    this.currentStage = STAGES.PREFLOP
    this.stageHistory = {}
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
      heroStack: hero?.stack || 0,
      stageHistory: this.stageHistory
    }
  }
}

export {
  GameState,
  STAGES,
  POSITIONS
} 