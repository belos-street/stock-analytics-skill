import type { StockData } from '../types/index'

export function parseStockData(rawData: string): StockData[] {
  const results: StockData[] = []

  const sinaRegex = /var hq_str_([^=]+)="([^"]*)"/g
  let match = sinaRegex.exec(rawData)
  if (match) {
    do {
      const code = match[1]
      const dataStr = match[2]

      if (!dataStr) continue

      const fields = dataStr.split(',')
      if (fields.length < 18) continue

      results.push({
        nameEn: fields[0],
        name: fields[1],
        open: parseFloat(fields[2]) || 0,
        preClose: parseFloat(fields[3]) || 0,
        close: parseFloat(fields[4]) || 0,
        high: parseFloat(fields[5]) || 0,
        low: parseFloat(fields[6]) || 0,
        current: parseFloat(fields[6]) || 0,
        change: parseFloat(fields[7]) || 0,
        changePercent: parseFloat(fields[8]) || 0,
        volume: parseFloat(fields[11]) || 0,
        amount: parseFloat(fields[12]) || 0,
        date: fields[17] || '',
        time: fields[18] || ''
      })
    } while ((match = sinaRegex.exec(rawData)) !== null)
    return results
  }

  const tencentRegex = /v_([^=]+)="([^"]*)"/g
  match = tencentRegex.exec(rawData)
  if (match) {
    do {
      const code = match[1]
      const dataStr = match[2]

      if (!dataStr) continue

      const fields = dataStr.split('~')
      if (fields.length < 33) continue

      const dateStr = fields[30] || ''
      const date = dateStr.slice(0, 8)
      const time = dateStr.slice(8)

      results.push({
        nameEn: code,
        name: fields[1] || '',
        open: parseFloat(fields[5]) || 0,
        preClose: parseFloat(fields[4]) || 0,
        close: parseFloat(fields[3]) || 0,
        high: parseFloat(fields[9]) || 0,
        low: parseFloat(fields[11]) || 0,
        current: parseFloat(fields[3]) || 0,
        change: parseFloat(fields[31]) || 0,
        changePercent: parseFloat(fields[32]) || 0,
        volume: parseFloat(fields[6]) || 0,
        amount: parseFloat(fields[7]) || 0,
        date: date,
        time: time
      })
    } while ((match = tencentRegex.exec(rawData)) !== null)
    return results
  }

  return results
}
