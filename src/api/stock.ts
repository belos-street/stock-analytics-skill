import * as iconv from 'iconv-lite'
import { API_CONFIG } from '../config/index'
import { parseStockData } from '../parser/stock'
import type { StockData, MarketDataResponse } from '../types/index'

async function fetchFromTencent(
  codes: string
): Promise<{ rawData: string; success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_CONFIG.TENCENT_STOCK.BASE_URL}${codes}`, {
      headers: API_CONFIG.TENCENT_STOCK.HEADERS
    })
    const buffer = await res.arrayBuffer()
    const rawData = iconv.decode(Buffer.from(buffer), 'gbk')
    return { rawData, success: true }
  } catch (err: any) {
    return { rawData: '', success: false, error: err.message }
  }
}

async function fetchFromSina(
  codes: string
): Promise<{ rawData: string; success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_CONFIG.SINA_STOCK.BASE_URL}${codes}`, {
      headers: API_CONFIG.SINA_STOCK.HEADERS
    })
    const buffer = await res.arrayBuffer()
    const rawData = iconv.decode(Buffer.from(buffer), 'gbk')
    return { rawData, success: true }
  } catch (err: any) {
    return { rawData: '', success: false, error: err.message }
  }
}

export async function getStockData(
  stockCodes: string | string[]
): Promise<MarketDataResponse<StockData>> {
  const codes = Array.isArray(stockCodes) ? stockCodes.join(',') : stockCodes
  const timestamp = new Date().toISOString()

  let result = await fetchFromTencent(codes)

  if (!result.success || !result.rawData || result.rawData.includes('="";')) {
    result = await fetchFromSina(codes)
  }

  if (!result.success) {
    return {
      success: false,
      data: [],
      error: result.error,
      timestamp
    }
  }

  if (!result.rawData || result.rawData.includes('="";')) {
    return {
      success: false,
      data: [],
      error: '未获取到股票数据',
      timestamp
    }
  }

  const stockData = parseStockData(result.rawData)

  return {
    success: true,
    data: stockData,
    timestamp
  }
}
