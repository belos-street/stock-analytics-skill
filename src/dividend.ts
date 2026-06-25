import { getSDK } from './sdk'
import { getQuotes } from './sdk'

/**
 * 股息率计算结果
 */
export interface DividendYieldResult {
  symbol: string
  name: string
  currentPrice: number
  dividendPerShare: number
  yieldRate: number
  latestDividend: {
    reportDate: string
    dividendPretax: number
    dividendDesc: string
    assignProgress: string
  }
  totalAnnualDividend?: number
  annualYieldRate?: number
}

/**
 * 从分红数据计算当前股息率
 * 股息率 = 最近一年每股分红 / 当前股价 × 100%
 */
export async function getDividendYield(
  symbol: string
): Promise<DividendYieldResult | null> {
  const sdk = getSDK()

  try {
    // 获取分红历史
    const dividends = await sdk.reference.dividendDetail(symbol)

    if (!dividends || dividends.length === 0) {
      console.error(`未获取到分红数据: ${symbol}`)
      return null
    }

    // 获取当前股价（使用CLI）
    const quotes = await getQuotes([symbol])
    if (!quotes || quotes.length === 0) {
      console.error(`未获取到行情数据: ${symbol}`)
      return null
    }

    const currentPrice = quotes[0].price
    const stockName = quotes[0].name

    // 找到最新的已实施分配的分红
    const latestDividend = dividends.find(
      (d: any) => d.assignProgress === '实施分配' && d.dividendPretax != null
    )

    if (!latestDividend) {
      console.error(`未找到已实施的分红记录: ${symbol}`)
      return null
    }

    // 每股分红 = 每10股派息 / 10
    const dividendPerShare = (latestDividend.dividendPretax || 0) / 10

    // 股息率 = 每股分红 / 当前股价 × 100%
    const yieldRate = (dividendPerShare / currentPrice) * 100

    // 计算年度总分红（累加最近一年的分红）
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const annualDividends = dividends.filter((d: any) => {
      if (d.assignProgress !== '实施分配' || d.dividendPretax == null)
        return false
      const reportDate = new Date(d.reportDate)
      return reportDate >= oneYearAgo
    })

    const totalAnnualDividend =
      annualDividends.reduce(
        (sum: number, d: any) => sum + (d.dividendPretax || 0),
        0
      ) / 10

    const annualYieldRate = (totalAnnualDividend / currentPrice) * 100

    return {
      symbol,
      name: stockName!,
      currentPrice,
      dividendPerShare,
      yieldRate,
      latestDividend: {
        reportDate: latestDividend.reportDate!,
        dividendPretax: latestDividend.dividendPretax!,
        dividendDesc: latestDividend.dividendDesc!,
        assignProgress: latestDividend.assignProgress!
      },
      totalAnnualDividend,
      annualYieldRate
    }
  } catch (error) {
    console.error(`获取股息率失败: ${symbol}`, error)
    return null
  }
}

/**
 * 批量查询股息率
 */
export async function getDividendYields(
  symbols: string[]
): Promise<DividendYieldResult[]> {
  const results: DividendYieldResult[] = []

  for (const symbol of symbols) {
    const result = await getDividendYield(symbol)
    if (result) {
      results.push(result)
    }
  }

  return results
}
