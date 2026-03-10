import type { StockData, FundData } from '../types/index'

export interface FormattedStock {
  type: 'stock'
  code: string
  name: string
  current_price: number
  change: number
  change_percent: number
  high: number
  low: number
  open: number
  pre_close: number
  volume: number
  amount: number
  update_time: string
}

export interface FormattedFund {
  type: 'fund'
  code: string
  name: string
  current_estimate: string
  estimate_change_percent: string
  update_time: string
}

export type FormattedData = FormattedStock | FormattedFund

export function isFormattedStock(data: FormattedData): data is FormattedStock {
  return data.type === 'stock'
}

export function isFormattedFund(data: FormattedData): data is FormattedFund {
  return data.type === 'fund'
}

export function formatStockForLLM(stock: StockData): FormattedStock {
  return {
    type: 'stock',
    code: stock.nameEn,
    name: stock.name,
    current_price: stock.current,
    change: stock.change,
    change_percent: stock.changePercent,
    high: stock.high,
    low: stock.low,
    open: stock.open,
    pre_close: stock.preClose,
    volume: stock.volume,
    amount: stock.amount,
    update_time: `${stock.date} ${stock.time}`
  }
}

export function formatFundForLLM(fund: FundData): FormattedFund {
  return {
    type: 'fund',
    code: fund.fundcode,
    name: fund.name,
    current_estimate: fund.gsz,
    estimate_change_percent: fund.gszzl,
    update_time: fund.gztime
  }
}

export function formatStocksForLLM(stocks: StockData[]): FormattedStock[] {
  return stocks.map(formatStockForLLM)
}

export function formatFundsForLLM(funds: FundData[]): FormattedFund[] {
  return funds.map(formatFundForLLM)
}

export function formatAllForLLM(
  stocks: StockData[],
  funds: FundData[]
): FormattedData[] {
  return [...formatStocksForLLM(stocks), ...formatFundsForLLM(funds)]
}
