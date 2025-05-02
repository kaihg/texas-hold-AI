import { getApiKey } from './api'
import { ACTIONS } from './gameState'
import OpenAI from 'openai'
const client = new OpenAI({ apiKey: getApiKey(), dangerouslyAllowBrowser: true })

// API 相關常數
const SYSTEM_PROMPT = `You are a professional Texas Hold'em poker assistant built for real-time use at live or online tables. Your goal is to provide quick, clear action recommendations for each hand scenario.

For each input, calculate and report the estimated win rate and expected value (EV) for each possible action (fold, call, raise, etc). Then clearly recommend the best action based on GTO strategy and professional-level exploitative adjustments when appropriate.

Do not explain in long paragraphs. Keep your answer concise, structured, and focused on actionable advice. If the input lacks key information, ask a short clarification question. Always return your recommendation in the following format:
All your response should be in Traditional Chinese.
---
**Hero's Action Options:**

- **Fold**: Win rate ~X%, EV = Y bb  
- **Call**: Win rate ~X%, EV = Y bb  
- **Check**: Win rate ~X%, EV = Y bb  
- **Raise to Z bb**: Win rate ~X%, EV = Y bb

**Recommended Action**: [Best Action Here]
**Reason**: [Reason Here]
---

Assume players have 50bb stacks unless otherwise stated. Use standard poker terminology. You are allowed to estimate if necessary, based on common poker knowledge.`

// 將遊戲狀態轉換為 OpenAPI Prompt
const generatePrompt = (gameState) => {
  const { players, pot, bigBlind, handCards, communityCards, actionHistory } = gameState

  // 格式化行動歷史
  const formatActionHistory = () => {
    let historyText = ''
    Object.entries(actionHistory).forEach(([stage, actions]) => {
      if (actions.length > 0) {
        historyText += `\nStage ${stage}：\n`

        // 按時間戳記排序行動
        const sortedActions = [...actions].sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp)
        })

        // 格式化每個行動
        sortedActions.forEach(action => {
          const player = players.find(p => p.id === action.playerId)
          if (!player) return

          let actionText = `${player.name} (${action.position}): ${action.action}`

          // 對於所有有金額的行動都顯示金額
          if (action.action === ACTIONS.CALL) {
            // 如果是跟注，顯示實際跟注金額
            actionText += ` ${action.raiseAmount}BB`
          } else if (action.action === ACTIONS.RAISE) {
            // 如果是加注，顯示加注金額
            actionText += ` ${action.raiseAmount}BB`
          } else if (action.action === ACTIONS.SMALL_BLIND) {
            actionText += ` ${action.raiseAmount}BB`
          } else if (action.action === ACTIONS.BIG_BLIND) {
            actionText += ` ${action.raiseAmount}BB`
          }

          historyText += actionText + '\n'
        })
      }
    })
    return historyText
  }

  // 格式化公共牌資訊
  const formatCommunityCards = () => {
    const cards = []
    if (communityCards.flop.length > 0) {
      cards.push(`翻牌：${communityCards.flop.join(' ')}`)
    }
    if (communityCards.turn) {
      cards.push(`轉牌：${communityCards.turn}`)
    }
    if (communityCards.river) {
      cards.push(`河牌：${communityCards.river}`)
    }
    return cards.join('\n')
  }

  return `你是一個專業的德州撲克玩家，請根據以下牌局資訊提供建議：

${formatActionHistory()}

底池：${pot}BB
大盲注：${bigBlind}BB

Hero 位置：${gameState.heroPosition}
Hero 籌碼：${gameState.heroStack}BB
當前階段：${gameState.currentStage}

Hero 手牌：${handCards.join(' ')}
${formatCommunityCards()}

---
現在輪到 Hero 行動，請你根據以上資訊回覆最佳策略：
`
}

// 呼叫 OpenAPI 獲取建議
const getAdvice = async (gameState) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('請先設定 API Key');
    }

    const API_MODEL = localStorage.getItem('apiModel') || 'gpt-3.5-turbo';
    const prompt = generatePrompt(gameState);
    console.log(prompt);

    const response = await client.responses.create({
      model: API_MODEL,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    return response.output_text;
  } catch (error) {
    console.error('獲取建議時發生錯誤:', error);
    throw error;
  }
}

export {
  generatePrompt,
  getAdvice
} 