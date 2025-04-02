import { getApiKey } from './api'

// 將遊戲狀態轉換為 OpenAPI Prompt
const generatePrompt = (gameState) => {
  const { players, pot, bigBlind, handCards, communityCards } = gameState

  // 格式化玩家資訊
  const playersInfo = players.map(player => {
    const actionInfo = player.action ? 
      `(${player.action}${player.raiseAmount ? ` ${player.raiseAmount}BB` : ''})` : 
      ''
    return `${player.name}${player.isSmallBlind ? '(小盲)' : ''} ${actionInfo}`
  }).join('\n')

  // 格式化公共牌資訊
  const communityCardsInfo = [
    communityCards.flop.length > 0 ? `翻牌：${communityCards.flop.join(' ')}` : '',
    communityCards.turn ? `轉牌：${communityCards.turn}` : '',
    communityCards.river ? `河牌：${communityCards.river}` : ''
  ].filter(Boolean).join('\n')

  return `你是一個專業的德州撲克玩家，請根據以下牌局資訊提供建議：

玩家資訊：
${playersInfo}

底池：${pot}BB
大盲注：${bigBlind}BB

手牌：${handCards.join(' ')}
${communityCardsInfo}

請提供以下建議：
1. 根據當前牌面，你的手牌強度如何？
2. 考慮到其他玩家的動作和底池大小，你應該採取什麼行動？
3. 如果選擇加注，建議加注多少？

請用簡潔明瞭的方式回答。`
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
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional Texas Hold'em poker assistant built for real-time use at live or online tables. Your goal is to provide quick, clear action recommendations for each hand scenario.

For each input, calculate and report the estimated win rate and expected value (EV) for each possible action (fold, call, raise, etc). Then clearly recommend the best action based on GTO strategy and professional-level exploitative adjustments when appropriate.

Do not explain in long paragraphs. Keep your answer concise, structured, and focused on actionable advice. If the input lacks key information, ask a short clarification question. Always return your recommendation in the following format:

---
**Hero's Action Options:**

- **Fold**: Win rate ~X%, EV = Y bb  
- **Call**: Win rate ~X%, EV = Y bb  
- **Raise to Z bb**: Win rate ~X%, EV = Y bb

**Recommended Action**: [Best Action Here]
---

Assume players have 50bb stacks unless otherwise stated. Use standard poker terminology. You are allowed to estimate if necessary, based on common poker knowledge.
`
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