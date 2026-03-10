export interface StockData {
  name: string
  nameEn: string
  open: number
  preClose: number
  close: number
  high: number
  low: number
  current: number
  change: number
  changePercent: number
  volume: number
  amount: number
  date: string
  time: string
}

export interface FundData {
  fundcode: string
  name: string
  jzrq: string
  dwjz: string
  gsz: string
  gszzl: string
  gztime: string
}

export interface MarketDataResponse<T> {
  success: boolean
  data: T[]
  error?: string
  timestamp: string
}

export interface QueryParams {
  codes: string | string[]
  interval?: number
}
