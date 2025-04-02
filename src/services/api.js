const API_URL = import.meta.env.VITE_API_URL

// 從 localStorage 獲取 API Key
const getApiKey = () => {
  return localStorage.getItem('apiKey')
}

// 儲存 API Key 到 localStorage
const setApiKey = (key) => {
  localStorage.setItem('apiKey', key)
}

// 獲取建議
const getAdvice = async (gameState) => {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('請先設定 API Key')
  }

  const response = await fetch(`${API_URL}/api/advice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(gameState)
  })

  if (!response.ok) {
    throw new Error('API 請求失敗')
  }

  return response.json()
}

export {
  getApiKey,
  setApiKey,
  getAdvice
} 