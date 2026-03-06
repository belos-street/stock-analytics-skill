# Stock Analytics Skill - 股市投资分析助手

## 项目简介

Stock Analytics Skill 是一个基于大语言模型（LLM）的股市投资分析技能集，专为个人投资者设计。它通过模块化的Skill架构，帮助投资者进行市场分析、资产配置和投资决策。

## 核心特点

- **多维度分析**：覆盖A股、港股、债券基金、ETF等多个投资品种
- **智能持仓管理**：根据投资者配置，自动调用对应分析技能
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
├── .trae/skills/               # Skill技能目录
│   ├── stock-analytics/       # 股市行情分析
│   ├── dividend-low-vol-etf/  # 红利低波ETF分析
│   ├── bond-fund-analysis/    # 债券基金分析
│   ├── hk-stock-analysis/     # 港股市场分析
│   ├── asset-allocation-rebalancing/  # 资产配置与再平衡
│   ├── broad-index-etf-analysis/      # 宽基ETF分析
│   ├── stock-deep-analysis/   # 个股深度分析
│   └── cash-flow-etf-analysis/        # 现金流ETF分析
├── position.md                # 持仓配置示例
├── agent.md                   # Agent配置说明
└── README.md                  # 项目介绍
```

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

## 快速开始

### 1. 配置持仓

编辑 `position.md` 文件，配置您的持仓信息：

```markdown
| 资产大类 | 具体标的 | 代码 | 目标占比 |
|---------|---------|------|---------|
| 固收类 | 债券基金 | 006493 | 20% |
| 核心稳健权益 | 红利低波ETF | 515450 | 20% |
| ... | ... | ... | ... |
```

### 2. 配置Agent

编辑 `agent.md` 文件，配置Skill调用规则和场景映射。

### 3. 开始使用

根据您的投资问题，自动调用对应的Skill进行分析：

- "今天A股市场怎么样？" → 调用 `stock-analytics`
- "515450现在可以加仓吗？" → 调用 `dividend-low-vol-etf`
- "我的资产配置合理吗？" → 调用 `asset-allocation-rebalancing`

## 持仓配置示例

一个典型的个人投资者持仓配置：

| 资产大类 | 占比 | 标的类型 |
|---------|------|---------|
| 固收类 | 20% | 债券基金（4只分散） |
| 核心稳健权益 | 50% | 红利ETF + 宽基ETF + 蓝筹股 |
| 高弹性进攻 | 10% | 港股医疗 + 港股科技 |
| 现金/货币基金 | 20% | 防守备用金 |

详细配置见 [position.md](./position.md)

## 使用示例

### 示例1：市场行情分析
```
用户：今天A股市场表现怎么样？
Agent：调用 stock-analytics Skill，分析今日行情...
```

### 示例2：持仓综合分析
```
用户：今天我的持仓表现怎么样？
Agent：
1. 读取 position.md 了解持仓配置
2. 调用 stock-analytics 了解整体市场
3. 调用各专业Skill分析持仓标的
4. 调用 asset-allocation-rebalancing 给出建议
```

### 示例3：资产配置评估
```
用户：我的资产配置需要调整吗？
Agent：调用 asset-allocation-rebalancing，分析配置偏离度...
```

## 技术栈

- **LLM Provider**: 支持 OpenAI、Claude、DeepSeek 等主流大模型
- **IDE**: Trae IDE、Cursor、Windsurf 等支持 Skill 的开发工具
- **数据源**: 东方财富、同花顺、雪球等财经网站

## 扩展开发

### 添加新的Skill

1. 在 `.trae/skills/` 目录下创建新目录
2. 编写 `SKILL.md` 文件，定义技能说明
3. 在 `agent.md` 中添加场景映射

### 自定义持仓配置

根据您的投资偏好，修改 `position.md` 中的：
- 资产配置比例
- 具体投资标的
- 投资目标和时间 horizon

## 注意事项

⚠️ **风险提示**
- 本项目仅供学习和参考，不构成投资建议
- 投资有风险，入市需谨慎
- 请根据自身情况做出投资决策

## 许可证

MIT License - 欢迎开源和贡献

## 致谢

- 感谢所有开源社区的贡献者
- 感谢 Trae IDE 提供的 Skill 框架支持
