import { API_CONFIG } from '../config/index'
import { delay } from '../utils/index'
import { parseFundData } from '../parser/fund'
import type { FundData, MarketDataResponse } from '../types/index'

export async function getFundData(
  fundCodes: string | string[],
  interval: number = API_CONFIG.REQUEST_DELAY
): Promise<MarketDataResponse<FundData>> {
  const codes = Array.isArray(fundCodes) ? fundCodes : [fundCodes]
  const results: FundData[] = []
  const errors: string[] = []
  const timestamp = new Date().toISOString()

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i]
    try {
      const res = await fetch(`${API_CONFIG.FUND.BASE_URL}${code}.js`)
      const data = await res.text()
      const parsed = parseFundData(data)
      if (parsed) {
        results.push(parsed)
      }
    } catch (err: any) {
      errors.push(`${code}: ${err.message}`)
    }

    if (i < codes.length - 1) {
      await delay(interval)
    }
  }

  return {
    success: errors.length === 0,
    data: results,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    timestamp
  }
}
