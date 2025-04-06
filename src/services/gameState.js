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

// 行動類型定義
const ACTIONS = {
  FOLD: 'FOLD',
  CHECK: 'CHECK',
  CALL: 'CALL',
  RAISE: 'RAISE',
  SMALL_BLIND: 'SMALL_BLIND',
  BIG_BLIND: 'BIG_BLIND'
}

class GameState {
  constructor(config) {
    this.config = config
    this.players = []
    this.pot = 0
    this.currentStage = STAGES.PREFLOP
    this.smallBlindIndex = 1
    this.actionHistory = {
      [STAGES.PREFLOP]: [],
      [STAGES.FLOP]: [],
      [STAGES.TURN]: [],
      [STAGES.RIVER]: []
    }
    this.currentBet = 0
    this.lastRaise = 0
    this.minRaise = this.config.bigBlind
    this.initializePlayers()
    this.initializeBlinds()
  }

  initializePlayers() {
    this.players = []
    for (let i = 0; i < this.config.players; i++) {
      this.players.push({
        id: i + 1,
        name: i === 0 ? 'Hero' : (this.config.playerNames?.[i - 1] || `玩家${i}`),
        stack: this.config.initialStack,
        position: this.getPosition(i),
        hasActed: false,
        action: null,
        raiseAmount: 0,
        isFolded: false
      })
    }
  }

  initializeBlinds() {
    const sbPlayer = this.players[this.smallBlindIndex]
    const bbPlayer = this.players[(this.smallBlindIndex + 1) % this.config.players]
    
    // 設置小盲注
    this.updatePlayerAction(sbPlayer.id, ACTIONS.SMALL_BLIND, this.config.bigBlind / 2)
    
    // 設置大盲注
    this.updatePlayerAction(bbPlayer.id, ACTIONS.BIG_BLIND, this.config.bigBlind)
  }

  // 獲取玩家位置
  getPosition(playerIndex) {
    const { players: playerCount } = this.config
    const positions = []

    if (playerCount < 3 || playerCount > 10) {
      throw new Error("Supported player count is from 3 to 10.")
    }

    if (playerIndex < 0 || playerIndex >= playerCount) {
      throw new Error("Invalid player index.")
    }

    const fixedPositions = [POSITIONS.BTN, POSITIONS.SB, POSITIONS.BB]
    const dynamicLabels = {
      3: [], // BTN, SB, BB only
      4: [POSITIONS.UTG],
      5: [POSITIONS.UTG, POSITIONS.CO],
      6: [POSITIONS.UTG, POSITIONS.HJ, POSITIONS.CO],
      7: [POSITIONS.UTG, POSITIONS.UTG1, POSITIONS.HJ, POSITIONS.CO],
      8: [POSITIONS.UTG, POSITIONS.UTG1, POSITIONS.MP, POSITIONS.HJ, POSITIONS.CO],
      9: [POSITIONS.UTG, POSITIONS.UTG1, POSITIONS.MP, POSITIONS.MP1, POSITIONS.HJ, POSITIONS.CO],
      10: [POSITIONS.UTG, POSITIONS.UTG1, POSITIONS.UTG2, POSITIONS.MP, POSITIONS.MP1, POSITIONS.HJ, POSITIONS.CO]
    }

    const allPositions = [...fixedPositions, ...dynamicLabels[playerCount]]
    // 根據小盲位置調整位置順序
    const adjustedPositions = [
      ...allPositions.slice(this.smallBlindIndex - 1),
      ...allPositions.slice(0, this.smallBlindIndex - 1)
    ]

    return adjustedPositions[playerIndex]
  }

  // 獲取 Hero 資訊
  get hero() {
    return this.players.find(p => p.id === 1)
  }

  // 獲取 Hero 位置
  get heroPosition() {
    return this.hero?.position || null
  }

  // 獲取 Hero 籌碼
  get heroStack() {
    return this.hero?.stack || 0
  }

  // 輪換小盲位置
  rotateSmallBlind() {
    const { players: playerCount } = this.config
    this.smallBlindIndex = (this.smallBlindIndex + 1) % playerCount
    this.resetGame()
  }

  // 更新玩家動作
  updatePlayerAction(playerId, action, raiseAmount = null) {
    const player = this.players.find(p => p.id === playerId)
    if (!player) return

    // 計算實際下注金額
    let actualAmount = 0
    if (action === ACTIONS.CALL) {
      // 如果是跟注，計算需要跟注的金額
      // 對於大盲注玩家，需要考慮他已經投入的大盲注金額
      const currentBet = this.currentBet
      const alreadyBet = player.raiseAmount || 0
      actualAmount = currentBet - alreadyBet
    } else if (action === ACTIONS.RAISE) {
      // 如果是加注，計算總下注金額
      actualAmount = raiseAmount - player.raiseAmount || 0
    } else if (action === ACTIONS.SMALL_BLIND) {
      actualAmount = this.config.bigBlind / 2
    } else if (action === ACTIONS.BIG_BLIND) {
      actualAmount = this.config.bigBlind
      this.currentBet = this.config.bigBlind
    }

    // 記錄行動歷史
    this.actionHistory[this.currentStage].push({
      playerId,
      position: player.position,
      action,
      raiseAmount: (player.raiseAmount || 0) + actualAmount,
      timestamp: new Date().toISOString()
    })

    // 更新玩家狀態
    player.action = action
    player.raiseAmount = (player.raiseAmount || 0) + actualAmount
    player.hasActed = true

    if (action === ACTIONS.FOLD) {
      player.isFolded = true
    }

    // 更新底池和加注資訊
    if (action === ACTIONS.RAISE) {
      this.lastRaise = raiseAmount
      this.minRaise = Math.max(this.minRaise, raiseAmount * 2)
      this.currentBet = raiseAmount
    } else if (action === ACTIONS.CALL) {
      this.currentBet = Math.max(this.currentBet, player.raiseAmount)
    }

    // 更新底池
    if (action !== ACTIONS.FOLD) {
      this.pot += actualAmount
    }
  }

  // 檢查是否所有玩家都行動過
  allPlayersActed() {
    return this.players.every(player => 
      player.hasActed || player.isFolded || 
      (this.currentStage === STAGES.PREFLOP && 
       (player.action === ACTIONS.SMALL_BLIND || player.action === ACTIONS.BIG_BLIND))
    )
  }

  // 進入下一階段
  nextStage() {
    if (!this.allPlayersActed()) {
      throw new Error("Not all players have acted yet")
    }

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
        this.resetGame()
        return
    }

    // 重置玩家動作狀態（保留 FOLD）
    this.players.forEach(player => {
      if (!player.isFolded) {
        player.action = null
        player.raiseAmount = 0
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
    this.actionHistory = {
      [STAGES.PREFLOP]: [],
      [STAGES.FLOP]: [],
      [STAGES.TURN]: [],
      [STAGES.RIVER]: []
    }
    this.currentBet = 0
    this.lastRaise = 0
    this.minRaise = this.config.bigBlind
    this.initializePlayers()
    this.initializeBlinds()
  }

  // 獲取遊戲狀態摘要
  getGameState() {
    return {
      players: this.players.map(player => ({
        id: player.id,
        name: player.name,
        stack: player.stack,
        position: player.position,
        action: player.action,
        raiseAmount: player.raiseAmount,
        isFolded: player.isFolded
      })),
      pot: this.pot,
      bigBlind: this.config.bigBlind,
      currentStage: this.currentStage,
      heroPosition: this.heroPosition,
      heroStack: this.heroStack,
      actionHistory: this.actionHistory,
      currentBet: this.currentBet,
      lastRaise: this.lastRaise,
      minRaise: this.minRaise
    }
  }

  // 獲取行動歷史的格式化字串
  getFormattedActionHistory() {
    let historyText = ''
    Object.entries(this.actionHistory).forEach(([stage, actions]) => {
      if (actions.length > 0) {
        historyText += `\n${stage.toUpperCase()}:\n`
        actions.forEach(action => {
          const player = this.players.find(p => p.id === action.playerId)
          historyText += `${player.name} (${action.position}): ${action.action}`
          if (action.raiseAmount) {
            historyText += ` ${action.raiseAmount}BB`
          }
          historyText += '\n'
        })
      }
    })
    return historyText
  }
}

export {
  GameState,
  STAGES,
  POSITIONS,
  ACTIONS
} 