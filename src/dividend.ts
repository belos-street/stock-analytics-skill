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
}

/**
 * 从东方财富API获取股息率数据
 * 数据来源：https://datacenter-web.eastmoney.com/api/data/v1/get
 */
async function getDividendYieldFromEastMoney(
  symbol: string
): Promise<DividendYieldResult | null> {
  try {
    // 提取纯数字代码（去掉sh/sz前缀）
    const code = symbol.replace(/^(sh|sz)/, '')

    // 构建东方财富API请求
    const baseUrl = 'https://datacenter-web.eastmoney.com/api/data/v1/get'
    const params = new URLSearchParams({
      reportName: 'RPT_SHAREBONUS_DET',
      columns: 'ALL',
      filter: `(SECURITY_CODE="${code}")`,
      pageNumber: '1',
      pageSize: '10',
      sortColumns: 'EX_DIVIDEND_DATE',
      sortTypes: '-1',
      source: 'WEB',
      client: 'WEB'
    })

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.error(`东方财富API请求失败: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.code !== 0 || !data.result?.data?.length) {
      console.error(`东方财富API返回无数据: ${symbol}`)
      return null
    }

    const dividends = data.result.data

    // 获取当前股价（使用CLI）
    const quotes = await getQuotes([symbol])
    if (!quotes || quotes.length === 0) {
      console.error(`未获取到行情数据: ${symbol}`)
      return null
    }

    const currentPrice = quotes[0].price
    const stockName = quotes[0].name

    // 找到最新的已实施分红
    const latestDividend = dividends.find(
      (d: any) => d.ASSIGN_PROGRESS === '实施分配' && d.PRETAX_BONUS_RMB != null
    )

    if (!latestDividend) {
      console.error(`未找到已实施的分红记录: ${symbol}`)
      return null
    }

    // 每股分红 = 每10股派息 / 10
    const dividendPerShare = (latestDividend.PRETAX_BONUS_RMB || 0) / 10

    // 直接使用东方财富提供的股息率（已经计算好的）
    // 注意：东方财富返回的 DIVIDENT_RATIO 是小数形式（如 0.0512 表示 5.12%），需要乘以 100
    const yieldRate = latestDividend.DIVIDENT_RATIO
      ? parseFloat(latestDividend.DIVIDENT_RATIO) * 100
      : (dividendPerShare / currentPrice) * 100

    return {
      symbol,
      name: stockName!,
      currentPrice,
      dividendPerShare,
      yieldRate,
      latestDividend: {
        reportDate: latestDividend.EX_DIVIDEND_DATE || '',
        dividendPretax: latestDividend.PRETAX_BONUS_RMB || 0,
        dividendDesc: latestDividend.IMPL_PLAN_PROFILE || '',
        assignProgress: latestDividend.ASSIGN_PROGRESS || ''
      }
    }
  } catch (error) {
    console.error(`从东方财富获取股息率失败: ${symbol}`, error)
    return null
  }
}

/**
 * 从SDK获取股息率数据（备用方案）
 */
async function getDividendYieldFromSDK(
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
      }
    }
  } catch (error) {
    console.error(`从SDK获取股息率失败: ${symbol}`, error)
    return null
  }
}

/**
 * 获取股息率（优先使用东方财富API，失败时回退到SDK）
 */
export async function getDividendYield(
  symbol: string
): Promise<DividendYieldResult | null> {
  // 优先使用东方财富API
  const eastMoneyResult = await getDividendYieldFromEastMoney(symbol)
  if (eastMoneyResult) {
    return eastMoneyResult
  }

  // 回退到SDK
  console.log(`东方财富API获取失败，尝试使用SDK: ${symbol}`)
  return getDividendYieldFromSDK(symbol)
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
