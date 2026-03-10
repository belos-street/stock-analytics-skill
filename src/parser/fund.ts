import type { FundData } from '../types/index'

export function parseFundData(rawData: string): FundData | null {
  try {
    const jsonStr = rawData.replace(/^jsonpgz\(/, '').replace(/\);?$/, '')
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}
