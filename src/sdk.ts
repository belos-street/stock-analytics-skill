import { StockSDK } from 'stock-sdk'
import { execSync } from 'child_process'

// 单例模式
let sdk: StockSDK | null = null

export function getSDK(): StockSDK {
  if (!sdk) {
    sdk = new StockSDK()
  }
  return sdk
}

// 通过CLI获取行情（避免Bun编码问题）
function execQuoteCLI(codes: string[], market: string = 'cn'): any[] {
  try {
    // 过滤空字符串
    const validCodes = codes.filter((c) => c.trim())
    if (validCodes.length === 0) return []

    // stock-sdk quote 命令用空格分隔多个代码
    const result = execSync(
      `npx stock-sdk quote ${validCodes.join(' ')} --format json`,
      { encoding: 'utf-8' }
    )
    return JSON.parse(result)
  } catch (error) {
    console.error(`CLI行情查询失败: ${codes.join(',')}`)
    return []
  }
}

// A股行情（使用CLI）
export async function getQuotes(codes: string[]) {
  return execQuoteCLI(codes, 'cn')
}

// 基金行情（使用CLI --market fund 参数）
export async function getFundQuotes(codes: string[]) {
  try {
    const validCodes = codes.filter((c) => c.trim())
    if (validCodes.length === 0) return []

    // 基金查询需要 --market fund 参数
    const result = execSync(
      `npx stock-sdk quote ${validCodes.join(' ')} --market fund --format json`,
      { encoding: 'utf-8' }
    )
    return JSON.parse(result)
  } catch (error) {
    console.error(`基金行情查询失败: ${codes.join(',')}`)
    return []
  }
}

// 港股行情（使用CLI）
export async function getHKQuotes(codes: string[]) {
  return execQuoteCLI(codes, 'hk')
}

// 美股行情（使用CLI）
export async function getUSQuotes(codes: string[]) {
  return execQuoteCLI(codes, 'us')
}

// K线数据（使用SDK）
export async function getKline(symbol: string, period: string = 'daily') {
  const sdk = getSDK()
  return sdk.kline.cn(symbol, { period: period as any })
}

// 搜索股票
export async function searchStock(keyword: string) {
  const sdk = getSDK()
  return sdk.search(keyword)
}
