import { Command } from 'commander'
import chalk from 'chalk'
import {
  getStockData,
  getFundData,
  formatAllForLLM,
  isFormattedStock,
  isFormattedFund
} from '../index'
import type { MarketDataResponse, StockData, FundData } from '../types/index'

interface CliOptions {
  stocks?: string
  funds?: string
  format?: string
}

export async function runCli() {
  const program = new Command()

  program
    .name('stock-analytics')
    .description('股票和基金行情查询工具')
    .version('1.0.0')
    .option('-s, --stocks <codes>', '股票代码列表（逗号分隔）', '')
    .option('-f, --funds <codes>', '基金代码列表（逗号分隔）', '')
    .option('-o, --format <type>', '输出格式: raw | llm', 'llm')
    .parse(process.argv)

  const options = program.opts<CliOptions>()

  if (!options.stocks && !options.funds) {
    console.log(chalk.yellow('请指定股票或基金代码'))
    console.log(chalk.gray('使用 -h 查看帮助'))
    process.exit(1)
  }

  const stocks = options.stocks?.split(',').filter(Boolean) || []
  const funds = options.funds?.split(',').filter(Boolean) || []
  const format = options.format === 'raw' ? 'raw' : 'llm'

  if (stocks.length > 0) {
    console.log(chalk.cyan('=== 获取股票数据 ==='))
    const stockResponse: MarketDataResponse<StockData> =
      await getStockData(stocks)

    if (stockResponse.success) {
      console.log(chalk.green('请求状态: 成功'))
      printStockData(stockResponse.data, format)
    } else {
      console.log(chalk.red(`请求状态: 失败 - ${stockResponse.error}`))
    }
  }

  if (funds.length > 0) {
    console.log(chalk.cyan('\n=== 获取基金数据 ==='))
    const fundResponse: MarketDataResponse<FundData> = await getFundData(funds)

    if (fundResponse.success) {
      console.log(chalk.green('请求状态: 成功'))
      printFundData(fundResponse.data, format)
    } else {
      console.log(chalk.red(`请求状态: 失败 - ${fundResponse.error}`))
    }
  }
}

function printStockData(stocks: StockData[], format: string) {
  if (format === 'raw') {
    console.log(chalk.gray('股票数据:'), stocks)
    return
  }

  const formatted = formatAllForLLM(stocks, [])

  if (formatted.length === 0) {
    console.log(chalk.yellow('未获取到股票数据'))
    return
  }

  formatted.forEach((item, index) => {
    if (!isFormattedStock(item)) return
    console.log(
      `\n${chalk.bold.cyan(`${index + 1}. ${item.name}`)} ${chalk.gray(`(${item.code})`)}`
    )
    console.log(
      `  ${chalk.white('当前价格:')} ${chalk.yellow(String(item.current_price))}`
    )
    console.log(
      `  ${chalk.white('涨  跌:')} ${item.change >= 0 ? chalk.green(`+${item.change}`) : chalk.red(String(item.change))}`
    )
    console.log(
      `  ${chalk.white('涨跌幅:')} ${item.change_percent >= 0 ? chalk.green(`+${item.change_percent}%`) : chalk.red(`${item.change_percent}%`)}`
    )
    console.log(`  ${chalk.white('更新时间:')} ${chalk.gray(item.update_time)}`)
  })
}

function printFundData(funds: FundData[], format: string) {
  if (format === 'raw') {
    console.log(chalk.gray('基金数据:'), funds)
    return
  }

  const formatted = formatAllForLLM([], funds)

  if (formatted.length === 0) {
    console.log(chalk.yellow('未获取到基金数据'))
    return
  }

  formatted.forEach((item, index) => {
    if (!isFormattedFund(item)) return
    console.log(
      `\n${chalk.bold.cyan(`${index + 1}. ${item.name}`)} ${chalk.gray(`(${item.code})`)}`
    )
    console.log(
      `  ${chalk.white('当前估值:')} ${chalk.yellow(item.current_estimate)}`
    )
    console.log(
      `  ${chalk.white('估值涨幅:')} ${parseFloat(item.estimate_change_percent) >= 0 ? chalk.green(`+${item.estimate_change_percent}%`) : chalk.red(`${item.estimate_change_percent}%`)}`
    )
    console.log(`  ${chalk.white('更新时间:')} ${chalk.gray(item.update_time)}`)
  })
}
