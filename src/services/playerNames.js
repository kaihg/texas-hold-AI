const STORAGE_KEY = 'quickPlayerNames'

// 預設常用名稱
const DEFAULT_NAMES = ['++', '邦', 'Ashley', 'STK Rax', 'PO1']

// 從 localStorage 獲取常用名稱
export const getQuickNames = () => {
  const savedNames = localStorage.getItem(STORAGE_KEY)
  return savedNames ? JSON.parse(savedNames) : DEFAULT_NAMES
}

// 儲存常用名稱到 localStorage
export const saveQuickNames = (names) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
}

// 新增常用名稱
export const addQuickName = (name) => {
  const names = getQuickNames()
  if (!names.includes(name)) {
    names.push(name)
    saveQuickNames(names)
  }
}

// 移除常用名稱
export const removeQuickName = (index) => {
  const names = getQuickNames()
  names.splice(index, 1)
  saveQuickNames(names)
}

// 更新常用名稱
export const updateQuickName = (index, newName) => {
  const names = getQuickNames()
  names[index] = newName
  saveQuickNames(names)
} 