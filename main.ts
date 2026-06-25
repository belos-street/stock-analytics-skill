#!/usr/bin/env bun

/**
 * Stock Analytics Skill V2.0
 * 基于 stock-sdk 的股市投资分析助手
 */

import { Command } from 'commander'
import chalk from 'chalk'
import { getQuotes, getFundQuotes, getHKQuotes, getUSQuotes, getKline, searchStock } from './src/sdk'
import { getDividendYield, getDividendYields } from './src/dividend'
import {
  formatAndOutputStocks,
  formatAndOutputFunds,
  formatAndOutputDividends,
  outputData
} from './src/format'

const program = new Command()

program
  .name('stock-analytics')
  .description('股市投资分析助手 V2.0 - 基于 stock-sdk')
  .version('2.0.0')
  .option('-s, --stocks <codes>', 'A股代码列表（逗号分隔）', '')
  .option('-f, --funds <codes>', '基金代码列表（逗号分隔）', '')
  .option('--hk <codes>', '港股代码列表（逗号分隔）', '')
  .option('--us <codes>', '美股代码列表（逗号分隔）', '')
  .option('--dividend <codes>', '查询股息率（逗号分隔多个代码）', '')
  .option('--kline <code>', '查询K线数据', '')
  .option('--search <keyword>', '搜索股票/基金', '')
  .option('-o, --format <type>', '输出格式: json | table | csv', 'json')
  .option('--pretty', 'JSON美化输出', false)
  .parse(process.argv)

const options = program.opts()

async function main() {
  const hasOptions = options.stocks || options.funds || options.hk || options.us ||
                     options.dividend || options.kline || options.search

  if (!hasOptions) {
    console.log(chalk.yellow('请指定股票或基金代码'))
    console.log(chalk.gray('使用 -h 查看帮助'))
    console.log('')
    console.log(chalk.cyan('示例:'))
    console.log('  bun main.ts -s sh600519,sh600036')
    console.log('  bun main.ts -f 006493,006961')
    console.log('  bun main.ts --hk 00700')
    console.log('  bun main.ts --dividend sh600941,sh600036')
    console.log('  bun main.ts --search 招商银行')
    process.exit(1)
  }

  try {
    // A股查询
    if (options.stocks) {
      const codes = options.stocks.split(',').filter((s: string) => s.trim())
      console.log(chalk.cyan('=== A股行情 ==='))
      const quotes = await getQuotes(codes)
      formatAndOutputStocks(quotes, options.format, options.pretty)
    }

    // 基金查询
    if (options.funds) {
      const codes = options.funds.split(',').filter((s: string) => s.trim())
      console.log(chalk.cyan('\n=== 基金行情 ==='))
      const quotes = await getFundQuotes(codes)
      formatAndOutputFunds(quotes, options.format, options.pretty)
    }

    // 港股查询
    if (options.hk) {
      const codes = options.hk.split(',').filter((s: string) => s.trim())
      console.log(chalk.cyan('\n=== 港股行情 ==='))
      const quotes = await getHKQuotes(codes)
      formatAndOutputStocks(quotes, options.format, options.pretty)
    }

    // 美股查询
    if (options.us) {
      const codes = options.us.split(',').filter((s: string) => s.trim())
      console.log(chalk.cyan('\n=== 美股行情 ==='))
      const quotes = await getUSQuotes(codes)
      formatAndOutputStocks(quotes, options.format, options.pretty)
    }

    // 股息率查询
    if (options.dividend) {
      const codes = options.dividend.split(',').filter((s: string) => s.trim())
      console.log(chalk.cyan('\n=== 股息率查询 ==='))

      if (codes.length === 1) {
        const result = await getDividendYield(codes[0])
        if (result) {
          formatAndOutputDividends([result], options.format, options.pretty)
        } else {
          console.log(chalk.yellow('未获取到股息率数据'))
        }
      } else {
        const results = await getDividendYields(codes)
        if (results.length > 0) {
          formatAndOutputDividends(results, options.format, options.pretty)
        } else {
          console.log(chalk.yellow('未获取到股息率数据'))
        }
      }
    }

    // K线查询
    if (options.kline) {
      console.log(chalk.cyan('\n=== K线数据 ==='))
      const kline = await getKline(options.kline)
      if (kline && kline.length > 0) {
        console.log(`获取到 ${kline.length} 条K线数据`)
        outputData(kline.slice(-10), options.format, options.pretty) // 只显示最近10条
      } else {
        console.log(chalk.yellow('未获取到K线数据'))
      }
    }

    // 搜索功能
    if (options.search) {
      console.log(chalk.cyan('\n=== 搜索结果 ==='))
      const results = await searchStock(options.search)
      if (results && results.length > 0) {
        outputData(results, options.format, options.pretty)
      } else {
        console.log(chalk.yellow('未找到匹配的股票/基金'))
      }
    }
  } catch (error: any) {
    console.error(chalk.red('执行出错:'), error.message)
    process.exit(1)
  }
}

main()
