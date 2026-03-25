# Stock Analytics Skill - 股市投资分析助手

## 项目简介

Stock Analytics Skill 是一个基于大语言模型（LLM）的股市投资分析技能集，专为个人投资者设计。它通过模块化的Skill架构和本地数据获取工具，帮助投资者进行市场分析、资产配置和投资决策。

## 核心特点

- **多维度分析**：覆盖A股、港股、债券基金、ETF、基金等多个投资品种
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

## 快速开始

### 1. 安装依赖

```bash
npm install -g bun  # 如果有bun运行时，则跳过
bun --version
```

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

## 首次配置说明

### 为什么要配置 position.md 和 agent.md？

本项目采用 **Skill + 配置驱动** 的架构，大模型需要通过这两个文件来理解您的投资情况：

- **`position.md`**：定义您的持仓配置，包括持仓标的、目标占比、配置规则等
- **`agent.md`**：定义Agent的工作流程，包括各场景对应调用哪个Skill、分析报告生成流程等

### 配置步骤

**第一步：配置持仓信息**

打开 `position.md` 文件，根据您的实际情况修改持仓配置：

```markdown
| 资产大类 | 具体标的 | 代码 | 查询参数 | 目标占比 | 配置规则 & 备注 |
| --- | --- | --- | --- | --- | --- |
| 核心稳健权益类（50%） | 红利低波50ETF | sh515450 | -s | 20% | 股息率过低则逐步减仓... |
```

主要修改内容：
- 持仓标的代码
- 目标占比
- 个人的配置规则和备注

**第二步：将 agent.md 丢给大模型**

在开始使用大模型分析之前，需要将 `agent.md` 文件内容**完整复制**并发送给大模型，让大模型理解您的工作流程。

发送方式：
```
请加载以下 Agent 配置文件，并按照其中的规则执行任务：
[复制 agent.md 的完整内容]
```
或者将agent.md内容作为system prompt上传至trae，生成随时可对话的智能体
```
设置->智能体->创建->输入智能体名称->agent.md内容粘贴至提示词
```

**第三步：验证配置**

配置完成后，可以尝试让大模型执行一个简单的任务来验证配置是否生效：

```
请分析一下我的持仓今天表现怎么样？
```

大模型应该会：
1. 自动读取 `position.md` 了解您的持仓
2. 调用CLI获取各持仓标的数据
3. 按照 `agent.md` 中的流程进行分析
4. 给出持仓分析报告

### 配置示意图

```
┌─────────────────────────────────────────────────────────┐
│                     大模型对话窗口                        │
├─────────────────────────────────────────────────────────┤
│  用户：今天我的持仓表现怎么样？                            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 大模型读取 agent.md → 了解工作流程                │  │
│  │ 大模型读取 position.md → 了解持仓配置            │  │
│  │ 大模型调用 CLI 获取数据 → 各持仓标的价格          │  │
│  │ 大模型调用对应 Skill → 分析各持仓                 │  │
│  │ 大模型给出分析报告和建议                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  输出：今日持仓分析报告...                                │
└─────────────────────────────────────────────────────────┘
```

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

## Skill 技能一览（22个技能）

### 市场分析类

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| stock-analytics | 股市行情分析 | 了解整体市场行情、资金流向、热点板块 |
| hk-stock-analysis | 港股市场 | 分析港股、港股ETF、南向资金 |
| market-valuation | A股估值判断 | 判断市场高低位、加仓减仓时机 |

### ETF投资类

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| dividend-low-vol-etf | 红利低波ETF | 分析红利ETF加仓减仓时机 |
| broad-index-etf-analysis | 宽基ETF | 分析A500、沪深300等宽基指数 |
| cash-flow-etf-analysis | 现金流ETF | 分析现金流ETF、现金流稳定性 |

### 基金投资类

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| fund-screening | 基金筛选 | 根据风险偏好筛选基金 |
| fund-comparison | 基金对比 | 对比多只基金业绩、风险、持仓 |

### 个股分析类

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| stock-deep-analysis | 个股深度分析 | 分析个股基本面、估值、财务数据 |
| stock-investment-logic | 个股投资逻辑 | 深度研究个股，生成券商风格报告 |
| investment-memo | 投资备忘录 | 生成一页纸投资摘要 |
| announcement-analysis | 公告与财报 | 解读公告、年报、季报 |
| comparable-company-analysis | 可比公司分析 | 估值对标分析、构建Comps表 |
| valuation-framework | 估值与定价 | 估值方法选择、相对估值分析 |

### 投资发现类

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| investment-idea-generator | 投资标的筛选 | 量化筛选、主题扫描发现机会 |
| thematic-stock-picker | 按主题选股 | AI、新能源等主题投资机会 |

### 债券与信用类

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| bond-fund-analysis | 债券基金 | 分析债券基金、利率影响 |
| bond-yield-analysis | 债券利率走势 | 利率走势研判、久期策略 |
| credit-analysis | 信用分析 | 主体信用资质、违约概率评估 |

### 宏观研究类

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| macro-data-interpretation | 宏观数据解读 | CPI、PPI、PMI、GDP、社融解读 |
| macro-sector-transmission | 宏观行业传导 | 宏观变量对行业的影响传导 |

### 资产配置类

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| asset-allocation-rebalancing | 资产配置 | 资产配置优化、再平衡时机 |

## 使用场景

| 场景 | 触发条件 | 调用Skill |
|------|---------|----------|
| 市场分析 | 询问A股整体行情、大盘走势 | stock-analytics |
| 红利ETF | 询问红利低波ETF的行情、加仓时机 | dividend-low-vol-etf |
| 债券基金 | 询问债券基金、利率影响 | bond-fund-analysis |
| 港股市场 | 询问港股、恒生医疗/科技ETF | hk-stock-analysis |
| 宽基ETF | 询问A500、沪深300ETF估值 | broad-index-etf-analysis |
| 个股分析 | 询问个股基本面、财务、估值 | stock-deep-analysis |
| 现金流ETF | 询问现金流ETF、投资策略 | cash-flow-etf-analysis |
| 资产配置 | 询问配置、再平衡、仓位管理 | asset-allocation-rebalancing |
| 持仓分析 | 询问整体持仓情况、今日表现 | asset-allocation-rebalancing |
| 市场估值 | 询问A股估值高低、加仓时机 | market-valuation |
| 投资筛选 | 发现新机会、量化筛选、主题投资 | investment-idea-generator |
| 基金筛选 | 根据风险偏好筛选基金 | fund-screening |
| 基金对比 | 对比多只基金业绩、风险 | fund-comparison |
| 主题选股 | AI、新能源等主题投资机会 | thematic-stock-picker |
| 估值分析 | 估值方法、相对估值分析 | valuation-framework |
| 个股深度 | 深度研究个股投资逻辑 | stock-investment-logic |
| 可比公司 | 估值对标分析 | comparable-company-analysis |
| 投资备忘录 | 一页纸投资报告 | investment-memo |
| 公告财报 | 解读公告、年报、业绩预告 | announcement-analysis |
| 信用分析 | 信用资质、违约概率评估 | credit-analysis |
| 债券利率 | 利率走势、久期策略 | bond-yield-analysis |
| 宏观传导 | 宏观变量对行业的影响 | macro-sector-transmission |
| 宏观数据 | CPI、PPI、PMI等数据解读 | macro-data-interpretation |

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

### 示例4：个股深度分析
```
用户：请分析一下比亚迪的投资价值
Agent：调用 stock-investment-logic Skill，生成深度研究报告...
```

### 示例5：基金筛选
```
用户：我是平衡型投资者，帮我筛选几只合适的基金
Agent：调用 fund-screening Skill，根据风险偏好筛选基金...
```

### 示例6：主题投资
```
用户：AI主题有哪些真受益标的？
Agent：调用 thematic-stock-picker Skill，筛选AI产业链受益股...
```

### 示例7：宏观数据解读
```
用户：最新CPI数据怎么看？
Agent：调用 macro-data-interpretation Skill，解读通胀数据...
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
