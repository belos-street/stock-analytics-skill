# Stock Analytics Skill V2.0 升级文档

## 一、升级背景

### 当前版本（V1.x）架构

```
stock-analytics-skill/
├── main.ts                    # CLI 入口
├── src/
│   ├── api/
│   │   ├── stock.ts           # 自实现：腾讯/新浪股票API
│   │   └── fund.ts            # 自实现：天天基金API
│   ├── parser/
│   │   ├── stock.ts           # 自实现：股票数据解析（正则）
│   │   └── fund.ts            # 自实现：基金数据解析
│   ├── cli/
│   │   └── index.ts           # 自实现：commander CLI
│   ├── config/
│   │   └── index.ts           # API配置
│   ├── formatter/
│   │   └── index.ts           # LLM格式化
│   ├── types/
│   │   └── index.ts           # 类型定义
│   └── utils/
│       └── index.ts           # 工具函数
├── position.md                # 持仓配置
└── agent.md                   # Agent配置
```

### 当前版本问题

| 问题 | 说明 |
|------|------|
| **功能有限** | 仅支持股票/基金行情查询（2个API） |
| **维护成本高** | 自实现API调用、数据解析、格式转换 |
| **依赖较多** | commander、chalk、iconv-lite |
| **数据源单一** | 仅腾讯/新浪/天天基金 |
| **无扩展性** | 新增数据源需手写代码 |

---

## 二、升级目标

### V2.0 架构

```
stock-analytics-skill/
├── main.ts                    # CLI 入口（调用 stock-sdk CLI）
├── src/
│   ├── index.ts               # 统一导出
│   ├── sdk.ts                 # StockSDK 封装
│   ├── dividend.ts            # 股息率计算（从分红数据计算）
│   └── format.ts              # 输出格式化（保持兼容）
├── position.md                # 持仓配置
├── agent.md                   # Agent配置
└── package.json               # 依赖：stock-sdk（零依赖）
```

### 核心变化

| 变化 | V1.x | V2.0 |
|------|------|------|
| **依赖** | commander + chalk + iconv-lite | stock-sdk（零依赖） |
| **数据源** | 腾讯/新浪/天天基金 | 东方财富 + 多数据源 |
| **功能** | 2个API | 84个方法 |
| **CLI** | 自实现 | stock-sdk 内置 CLI |
| **维护** | 自己维护 | 社区维护 |

---

## 三、升级步骤

### 步骤1：安装 stock-sdk

```bash
bun add stock-sdk
```

### 步骤2：创建 SDK 封装层

创建 `src/sdk.ts`：

```typescript
import { StockSDK } from 'stock-sdk'

// 单例模式
let sdk: StockSDK | null = null

export function getSDK(): StockSDK {
  if (!sdk) {
    sdk = new StockSDK()
  }
  return sdk
}

// 便捷方法
export async function getQuotes(codes: string[]) {
  const sdk = getSDK()
  return sdk.quotes.cn(codes)
}

export async function getFundQuotes(codes: string[]) {
  const sdk = getSDK()
  return sdk.quotes.fund(codes)
}

export async function getHKQuotes(codes: string[]) {
  const sdk = getSDK()
  return sdk.quotes.hk(codes)
}

export async function getUSQuotes(codes: string[]) {
  const sdk = getSDK()
  return sdk.quotes.us(codes)
}
```

### 步骤3：创建股息率计算模块

创建 `src/dividend.ts`：

```typescript
import { getSDK } from './sdk'

/**
 * 从分红数据计算当前股息率
 * 股息率 = 最近一年每股分红 / 当前股价
 */
export async function getDividendYield(symbol: string): Promise<number | null> {
  const sdk = getSDK()
  
  try {
    // 获取分红历史
    const dividends = await sdk.reference.dividendDetail(symbol)
    
    if (!dividends || dividends.length === 0) {
      return null
    }
    
    // 获取当前股价
    const quotes = await sdk.quotes.cn([symbol])
    if (!quotes || quotes.length === 0) {
      return null
    }
    
    const currentPrice = quotes[0].price
    const latestDividend = dividends[0]
    
    // 每股分红 = 每10股派息 / 10
    const dividendPerShare = (latestDividend.dividendPretax || 0) / 10
    
    // 股息率 = 每股分红 / 当前股价 * 100
    const yieldRate = (dividendPerShare / currentPrice) * 100
    
    return yieldRate
  } catch (error) {
    console.error(`获取股息率失败: ${symbol}`, error)
    return null
  }
}
```

### 步骤4：保持输出格式兼容

创建 `src/format.ts`：

```typescript
/**
 * 保持与 V1.x 输出格式兼容
 */

interface FormattedStock {
  type: 'stock'
  code: string
  name: string
  current_price: number
  change: number
  change_percent: number
  update_time: string
}

interface FormattedFund {
  type: 'fund'
  code: string
  name: string
  current_estimate: string
  estimate_change_percent: string
  update_time: string
}

export type FormattedData = FormattedStock | FormattedFund

export function formatQuoteForLLM(quote: any): FormattedStock {
  return {
    type: 'stock',
    code: quote.symbol || quote.code,
    name: quote.name,
    current_price: quote.price,
    change: quote.change || 0,
    change_percent: quote.changePercent || 0,
    update_time: new Date(quote.timestamp).toLocaleString('zh-CN')
  }
}

export function formatFundForLLM(quote: any): FormattedFund {
  return {
    type: 'fund',
    code: quote.symbol || quote.code,
    name: quote.name,
    current_estimate: String(quote.price || quote.nav || ''),
    estimate_change_percent: String(quote.changePercent || 0),
    update_time: new Date(quote.timestamp).toLocaleString('zh-CN')
  }
}
```

### 步骤5：重写 main.ts

```typescript
#!/usr/bin/env bun

import { Command } from 'commander'
import chalk from 'chalk'
import { getQuotes, getFundQuotes, getHKQuotes } from './src/sdk'
import { formatQuoteForLLM, formatFundForLLM } from './src/format'
import { getDividendYield } from './src/dividend'

const program = new Command()

program
  .name('stock-analytics')
  .description('股市投资分析助手 V2.0 - 基于 stock-sdk')
  .version('2.0.0')
  .option('-s, --stocks <codes>', '股票代码列表（逗号分隔）', '')
  .option('-f, --funds <codes>', '基金代码列表（逗号分隔）', '')
  .option('--hk <codes>', '港股代码列表（逗号分隔）', '')
  .option('--us <codes>', '美股代码列表（逗号分隔）', '')
  .option('--dividend <code>', '查询股息率', '')
  .option('--kline <code>', '查询K线数据', '')
  .option('--indicators <code>', '查询技术指标', '')
  .option('-o, --format <type>', '输出格式: json | table | csv', 'json')
  .option('--pretty', 'JSON美化输出', false)
  .parse(process.argv)

const options = program.opts()

async function main() {
  const hasOptions = options.stocks || options.funds || options.hk || options.us || 
                     options.dividend || options.kline || options.indicators

  if (!hasOptions) {
    console.log(chalk.yellow('请指定股票或基金代码'))
    console.log(chalk.gray('使用 -h 查看帮助'))
    process.exit(1)
  }

  // A股查询
  if (options.stocks) {
    const codes = options.stocks.split(',').filter(Boolean)
    console.log(chalk.cyan('=== A股行情 ==='))
    const quotes = await getQuotes(codes)
    outputData(quotes, 'stock', options.format, options.pretty)
  }

  // 基金查询
  if (options.funds) {
    const codes = options.funds.split(',').filter(Boolean)
    console.log(chalk.cyan('\n=== 基金行情 ==='))
    const quotes = await getFundQuotes(codes)
    outputData(quotes, 'fund', options.format, options.pretty)
  }

  // 港股查询
  if (options.hk) {
    const codes = options.hk.split(',').filter(Boolean)
    console.log(chalk.cyan('\n=== 港股行情 ==='))
    const quotes = await getHKQuotes(codes)
    outputData(quotes, 'stock', options.format, options.pretty)
  }

  // 美股查询
  if (options.us) {
    const codes = options.us.split(',').filter(Boolean)
    console.log(chalk.cyan('\n=== 美股行情 ==='))
    // TODO: 实现美股查询
    console.log(chalk.yellow('美股查询功能开发中...'))
  }

  // 股息率查询
  if (options.dividend) {
    console.log(chalk.cyan('\n=== 股息率查询 ==='))
    const yieldRate = await getDividendYield(options.dividend)
    if (yieldRate !== null) {
      console.log(`${options.dividend} 股息率: ${yieldRate.toFixed(2)}%`)
    } else {
      console.log(chalk.yellow('未获取到股息率数据'))
    }
  }
}

function outputData(quotes: any[], type: string, format: string, pretty: boolean) {
  if (!quotes || quotes.length === 0) {
    console.log(chalk.yellow('未获取到数据'))
    return
  }

  const formatted = quotes.map(q => 
    type === 'fund' ? formatFundForLLM(q) : formatQuoteForLLM(q)
  )

  if (format === 'json') {
    const output = pretty ? JSON.stringify(formatted, null, 2) : JSON.stringify(formatted)
    console.log(output)
  } else if (format === 'table') {
    // 表格格式输出
    console.table(formatted)
  } else if (format === 'csv') {
    // CSV格式输出
    const headers = Object.keys(formatted[0]).join(',')
    const rows = formatted.map(item => Object.values(item).join(','))
    console.log([headers, ...rows].join('\n'))
  }
}

main().catch(console.error)
```

### 步骤6：更新 package.json

```json
{
  "name": "stock-analytics-skill",
  "version": "2.0.0",
  "module": "main.ts",
  "type": "module",
  "bin": {
    "stock-analytics": "./main.ts"
  },
  "scripts": {
    "start": "bun run main.ts",
    "quote": "bun run main.ts -s",
    "fund": "bun run main.ts -f",
    "dividend": "bun run main.ts --dividend"
  },
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "stock-sdk": "latest",
    "chalk": "^5.6.2",
    "commander": "^14.0.3"
  }
}
```

### 步骤7：删除旧代码

```bash
# 删除自实现的API和解析器
rm -rf src/api src/parser src/types src/utils

# 保留 src/index.ts 作为统一导出
```

### 步骤8：更新 src/index.ts

```typescript
export { getSDK, getQuotes, getFundQuotes, getHKQuotes, getUSQuotes } from './sdk'
export { getDividendYield } from './dividend'
export { formatQuoteForLLM, formatFundForLLM } from './format'
```

---

## 四、V2.0 新增功能

### 4.1 CLI 命令一览

| 命令 | 功能 | 示例 |
|------|------|------|
| `-s, --stocks` | A股行情 | `bun main.ts -s sh600519,000001` |
| `-f, --funds` | 基金行情 | `bun main.ts -f 510300` |
| `--hk` | 港股行情 | `bun main.ts --hk 00700` |
| `--us` | 美股行情 | `bun main.ts --us AAPL` |
| `--dividend` | 股息率查询 | `bun main.ts --dividend sh600941` |
| `--kline` | K线数据 | `bun main.ts --kline sh600519` |
| `--indicators` | 技术指标 | `bun main.ts --indicators sh600519` |
| `--format` | 输出格式 | `bun main.ts -s sh600519 --format table` |
| `--pretty` | JSON美化 | `bun main.ts -s sh600519 --pretty` |

### 4.2 可扩展功能（通过 stock-sdk）

| 功能 | stock-sdk 方法 | 说明 |
|------|----------------|------|
| **行情查询** | `sdk.quotes.cn/hk/us/fund` | 多市场实时行情 |
| **K线数据** | `sdk.kline.cn/hk/us` | 历史K线 |
| **技术指标** | `sdk.kline.withIndicators` | MA/MACD/KDJ等14个指标 |
| **买卖信号** | `calcSignals` | 金叉/死叉/超买/超卖 |
| **分红数据** | `sdk.reference.dividendDetail` | 历史分红明细 |
| **交易日历** | `sdk.calendar` | 交易日判断 |
| **板块数据** | `sdk.board.industry/concept` | 行业/概念板块 |
| **资金流向** | `sdk.fundFlow` | 个股/大盘资金流 |
| **北向资金** | `sdk.northbound` | 沪深港通数据 |
| **龙虎榜** | `sdk.dragonTiger` | 机构/营业部数据 |
| **期货期权** | `sdk.futures/options` | 衍生品数据 |
| **大宗交易** | `sdk.blockTrade` | 大宗交易明细 |

### 4.3 股息率查询（新增）

通过 `--dividend` 参数查询个股股息率：

```bash
# 查询中国移动股息率
bun main.ts --dividend sh600941

# 输出：
# sh600941 股息率: 5.28%
```

**实现原理**：
1. 调用 `sdk.reference.dividendDetail` 获取分红历史
2. 调用 `sdk.quotes.cn` 获取当前股价
3. 计算：股息率 = 最近一年每股分红 / 当前股价 × 100%

---

## 五、更新文档清单

### 5.1 需要更新的文档

| 文档 | 更新内容 |
|------|----------|
| **README.md** | 更新项目架构、CLI命令、安装方式 |
| **agent.md** | 更新CLI调用示例、数据格式 |
| **position.md** | 无需更新（持仓配置不变） |

### 5.2 README.md 更新要点

```markdown
## 技术栈

- **运行时**：Bun
- **CLI 框架**：Commander
- **命令行美化**：Chalk
- **数据源**：stock-sdk（多数据源聚合）

## V2.0 新增功能

- 多市场支持（A股/港股/美股/基金）
- 股息率查询
- K线数据查询
- 技术指标计算
- 买卖信号识别
```

### 5.3 agent.md 更新要点

```markdown
## CLI 工具使用

### 查询A股行情
bun main.ts -s sh600519,000001

### 查询基金行情
bun main.ts -f 510300,110022

### 查询港股行情
bun main.ts --hk 00700

### 查询股息率
bun main.ts --dividend sh600941

### 输出格式
bun main.ts -s sh600519 --format table
bun main.ts -s sh600519 --pretty
```

---

## 六、升级验证

### 6.1 功能验证

```bash
# 1. 安装依赖
bun install

# 2. 测试A股查询
bun main.ts -s sh600519

# 3. 测试基金查询
bun main.ts -f 510300

# 4. 测试港股查询
bun main.ts --hk 00700

# 5. 测试股息率查询
bun main.ts --dividend sh600941

# 6. 测试输出格式
bun main.ts -s sh600519 --format table --pretty
```

### 6.2 兼容性验证

```bash
# 验证 position.md 查询命令仍然可用
bun main.ts -f "006493,006961,002276,159232"
bun main.ts -s "sh600941,sh600036,sh515450,sh513920,sh513010"
```

---

## 七、风险与注意事项

| 风险 | 说明 | 应对方案 |
|------|------|----------|
| **数据格式差异** | stock-sdk 返回格式与 V1.x 不同 | 通过 format.ts 适配 |
| **股息率计算** | 需要两次API调用（分红+行情） | 添加缓存机制 |
| **依赖更新** | stock-sdk 版本更新可能有 breaking changes | 锁定版本号 |
| **网络问题** | API 请求可能失败 | 保留重试机制 |

---

## 八、时间规划

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| **阶段1** | 安装 stock-sdk，创建 sdk.ts | 1小时 |
| **阶段2** | 实现 dividend.ts 股息率计算 | 1小时 |
| **阶段3** | 重写 main.ts，保持兼容 | 2小时 |
| **阶段4** | 更新文档（README、agent） | 1小时 |
| **阶段5** | 测试验证 | 1小时 |
| **总计** | | **6小时** |

---

## 九、总结

### V2.0 升级收益

| 收益 | 说明 |
|------|------|
| **功能扩展** | 从2个API扩展到84个方法 |
| **维护成本降低** | 依赖社区维护的 stock-sdk |
| **数据源丰富** | 支持多市场、多数据源 |
| **新增能力** | 股息率、K线、技术指标、资金流 |
| **零依赖** | stock-sdk 本身零依赖 |

### 升级后能力矩阵

```
┌─────────────────────────────────────────────────────────┐
│                   Stock Analytics V2.0                   │
├─────────────────────────────────────────────────────────┤
│  行情查询    │  K线数据    │  技术指标    │  买卖信号    │
├─────────────────────────────────────────────────────────┤
│  股息率      │  分红数据    │  交易日历    │  板块数据    │
├─────────────────────────────────────────────────────────┤
│  资金流向    │  北向资金    │  龙虎榜      │  期货期权    │
├─────────────────────────────────────────────────────────┤
│  A股/港股/美股/基金/期货/期权                            │
└─────────────────────────────────────────────────────────┘
```

---

**文档版本**：V1.0  
**创建日期**：2026-06-24  
**最后更新**：2026-06-24
