# Stock Analytics Skill - 股市投资分析助手

## 项目简介

Stock Analytics Skill 是一个基于大语言模型（LLM）的股市投资分析技能集，专为个人投资者设计。它通过模块化的Skill架构和本地数据获取工具，帮助投资者进行市场分析、资产配置和投资决策。

## 核心特点

- **多维度分析**：覆盖A股、港股、债券基金、ETF等多个投资品种
- **智能持仓管理**：根据投资者配置，自动调用对应分析技能
- **本地数据获取**：可直接获取港股、基金实时行情数据
- **长期投资导向**：专注于长期稳健复利策略，不鼓励短期炒作
- **开源可扩展**：模块化设计，方便自定义和扩展

## 适用人群

- 追求长期稳健收益的个人投资者
- 无太多时间盯盘的上班族
- 希望系统化学习投资的小白投资者

## 投资理念

```
核心原则：长期持有、分红再投入、不波段、不追热点、年度再平衡
风险偏好：中低风险为主，小仓位高弹性进攻，严控回撤
```

## 项目结构

```
stock-analytics-skill/
├── main.ts                 # CLI 入口文件
├── src/                    # 源码目录
│   ├── api/               # API 调用模块
│   ├── cli/               # CLI 命令行工具
│   ├── config/           # 配置
│   ├── formatter/        # 格式化输出
│   ├── parser/           # 数据解析
│   ├── types/            # 类型定义
│   └── utils/            # 工具函数
├── .trae/skills/         # Skill技能目录
│   ├── stock-analytics/  # 股市行情分析
│   ├── dividend-low-vol-etf/  # 红利低波ETF分析
│   ├── bond-fund-analysis/    # 债券基金分析
│   ├── hk-stock-analysis/    # 港股市场分析
│   ├── asset-allocation-rebalancing/  # 资产配置与再平衡
│   ├── broad-index-etf-analysis/      # 宽基ETF分析
│   ├── stock-deep-analysis/    # 个股深度分析
│   └── cash-flow-etf-analysis/ # 现金流ETF分析
├── position.md           # 持仓配置示例
├── agent.md              # Agent配置说明
├── package.json          # 项目依赖
└── README.md            # 项目介绍
```

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 查询股票/基金数据

```bash
# 查询港股
bun run main.ts -s hk00700

# 查询基金
bun run main.ts -f 320007

# 查询多个标的
bun run main.ts -s hk00700,hk01810 -f 320007,110022
```

### 3. 配置持仓

编辑 `position.md` 文件，配置您的持仓信息。

### 4. 配置Agent

编辑 `agent.md` 文件，配置Skill调用规则和场景映射。

## CLI 工具

### 基本用法

```bash
bun run main.ts [options]
```

### 参数说明

| 参数 | 说明 | 示例 |
|-----|------|------|
| `-s, --stocks` | 股票代码（逗号分隔 hk00700） | `-s,sh000001` |
| `-f, --funds` | 基金代码（逗号分隔） | `-f 320007,110022` |
| `-a, --agent` | Agent配置文件路径 | `-a ./agent.md` |
| `-o, --format` | 输出格式: raw \| llm | `-o llm` |
| `-h, --help` | 查看帮助 | |

### 输出格式

**LLM 格式**（默认）：
```json
[
  {
    "type": "stock",
    "code": "TENCENT",
    "name": "腾讯控股",
    "current_price": 538,
    "change": 22,
    "change_percent": 4.264,
    "update_time": "2026/03/10 11:09"
  }
]
```

**Raw 格式**：
```javascript
[
  {
    nameEn: "TENCENT",
    name: "腾讯控股",
    open: 525,
    current: 538,
    change: 22,
    changePercent: 4.264,
    ...
  }
]
```

### 支持的市场

- **港股**：hk00700（腾讯控股）、hk01810（小米集团）等
- **A股**：sh000001（上证指数）、sh600519（贵州茅台）等
- **基金**：天天基金网支持的基金代码

## Skill 技能一览

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| stock-analytics | 股市行情分析 | 了解整体市场行情、资金流向 |
| dividend-low-vol-etf | 红利低波ETF | 分析红利ETF加仓减仓时机 |
| bond-fund-analysis | 债券基金 | 分析债券基金、利率影响 |
| hk-stock-analysis | 港股市场 | 分析港股、港股ETF、南向资金 |
| broad-index-etf-analysis | 宽基ETF | 分析A500、沪深300等宽基指数 |
| stock-deep-analysis | 个股深度分析 | 分析个股基本面、估值、财务数据 |
| cash-flow-etf-analysis | 现金流ETF | 分析现金流ETF、现金流稳定性 |
| asset-allocation-rebalancing | 资产配置 | 资产配置优化、再平衡时机 |

## 使用示例

### 示例1：查询股票数据
```
$ bun run main.ts -s hk00700

=== 获取股票数据 ===
请求状态: 成功

1. 腾讯控股 (TENCENT)
  当前价格: 538
  涨  跌: +22
  涨跌幅: +4.264%
  更新时间: 2026/03/10 11:09
```

### 示例2：市场行情分析
```
用户：今天A股市场表现怎么样？
Agent：调用 stock-analytics Skill，分析今日行情...
```

### 示例3：持仓综合分析
```
用户：今天我的持仓表现怎么样？
Agent：
1. 读取 position.md 了解持仓配置
2. 使用 CLI 获取各持仓标的数据
3. 调用各专业Skill分析持仓标的
4. 调用 asset-allocation-rebalancing 给出建议
```

## 技术栈

- **运行时**：Bun
- **CLI 框架**：Commander
- **命令行美化**：Chalk
- **编码处理**：iconv-lite
- **IDE**：Trae IDE、Cursor、Windsurf 等支持 Skill 的开发工具
- **数据源**：东方财富（股票）、天天基金（基金）

## 扩展开发

### 添加新的数据源

1. 在 `src/api/` 目录下创建新的 API 模块
2. 实现数据获取和解析函数
3. 在 `src/cli/index.ts` 中添加对应命令

### 添加新的Skill

1. 在 `.trae/skills/` 目录下创建新目录
2. 编写 `SKILL.md` 文件，定义技能说明
3. 在 `agent.md` 中添加场景映射

## 注意事项

⚠️ **法律声明**
- 本项目仅供个人学习和技术研究使用，禁止用于任何商业目的
- 数据来源为公开的第三方接口（东方财富、天天基金），数据归属权归各平台所有
- 本项目不存储任何用户数据，不涉及账户登录和信息采集
- 如有任何问题或侵权内容，请联系删除

⚠️ **风险提示**
- 本项目仅供学习和参考，不构成投资建议
- 投资有风险，入市需谨慎
- 请根据自身情况做出投资决策

## 许可证

MIT License
