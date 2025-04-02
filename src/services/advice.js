import { getApiKey } from './api'
import { STAGES, POSITIONS } from './gameState'

// API 相關常數
// const API_MODEL = 'gpt-4o'
const API_MODEL = 'gpt-3.5-turbo'
const SYSTEM_PROMPT = `You are a professional Texas Hold'em poker assistant built for real-time use at live or online tables. Your goal is to provide quick, clear action recommendations for each hand scenario.

For each input, calculate and report the estimated win rate and expected value (EV) for each possible action (fold, call, raise, etc). Then clearly recommend the best action based on GTO strategy and professional-level exploitative adjustments when appropriate.

Do not explain in long paragraphs. Keep your answer concise, structured, and focused on actionable advice. If the input lacks key information, ask a short clarification question. Always return your recommendation in the following format:

---
**Hero's Action Options:**

- **Fold**: Win rate ~X%, EV = Y bb  
- **Call**: Win rate ~X%, EV = Y bb  
- **Raise to Z bb**: Win rate ~X%, EV = Y bb

**Recommended Action**: [Best Action Here]
---

Assume players have 50bb stacks unless otherwise stated. Use standard poker terminology. You are allowed to estimate if necessary, based on common poker knowledge.`

// 將遊戲狀態轉換為 OpenAPI Prompt
const generatePrompt = (gameState) => {
  const { players, pot, bigBlind, handCards, communityCards } = gameState

  // 格式化玩家資訊
  const playersInfo = players.map(player => {
    let actionInfo = ''
    if (gameState.currentStage === STAGES.PREFLOP) {
      if (player.position === POSITIONS.SB && !player.action) {
        actionInfo = 'small blind'
      } else if (player.position === POSITIONS.BB && !player.action) {
        actionInfo = 'big blind'
      } else if (player.action) {
        actionInfo = player.action
        if (player.raiseAmount) {
          actionInfo += ` ${player.raiseAmount}BB`
        }
      }
    } else if (player.action) {
      actionInfo = player.action
      if (player.raiseAmount) {
        actionInfo += ` ${player.raiseAmount}BB`
      }
    }
    return `${player.name} (${player.position}): ${actionInfo}`
  }).join('\n')

  // 格式化公共牌資訊
  const communityCardsInfo = [
    communityCards.flop.length > 0 ? `翻牌：${communityCards.flop.join(' ')}` : '',
    communityCards.turn ? `轉牌：${communityCards.turn}` : '',
    communityCards.river ? `河牌：${communityCards.river}` : ''
  ].filter(Boolean).join('\n')

  return `你是一個專業的德州撲克玩家，請根據以下牌局資訊提供建議：

玩家歷史行動：
${playersInfo}

底池：${pot}BB
大盲注：${bigBlind}BB

Hero 位置：${gameState.heroPosition}
Hero 籌碼：${gameState.heroStack}BB
當前階段：${gameState.currentStage}

Hero 手牌：${handCards.join(' ')}
${communityCardsInfo}

---
現在輪到 Hero 行動，請你根據以上資訊，並依照以下格式回覆：

**Hero's Action Options:**

- **Fold**: Win rate ~X%, EV = Y bb  
- **Call**: Win rate ~X%, EV = Y bb  
- **Raise to Z bb**: Win rate ~X%, EV = Y bb

**Recommended Action**: `
}

// 呼叫 OpenAPI 獲取建議
const getAdvice = async (gameState) => {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      throw new Error('請先設定 API Key')
    }

    const prompt = generatePrompt(gameState)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error('API 請求失敗')
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('獲取建議時發生錯誤:', error)
    throw error
  }
}

export {
  generatePrompt,
  getAdvice
} 